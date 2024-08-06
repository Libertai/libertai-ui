import { v4 as uuidv4 } from 'uuid';
import { defineStore } from 'pinia';
import { chatTag } from 'src/utils/chat';
import { chatsMigrations } from 'src/migrations/chats';
import { Chat, MessageAttachment, UIMessage } from 'src/types/chats';
import { UIPersona } from 'src/types/personas';
import localforage from 'localforage';

const CHATS_STORE_NAME = 'chats-store';
const CHATS_STORE_PINIA_KEY = 'chats-store-pinia-key';

// TODO: Search results are not yet implemented
/**
 * Representation of a search result:
 * interface SearchResult {
 *  // embedding document id
 *  documentId: string;
 *  // embedding content
 *  content: string;
 * }
 */

type ChatsStoreState = {
  version: number;
  chats: Chat[];
};

export const useChatsStore = defineStore(CHATS_STORE_PINIA_KEY, {
  state: (): ChatsStoreState => ({
    // Current version of the migrations
    version: 0, //  /!\ DO NOT UPDATE /!\, it should be done automatically when running migrations

    chats: [],
  }),
  persist: {
    paths: ['version', 'chats'],
    afterRestore: (ctx) => {
      ctx.store.loadAndMigrateChats();
    },
  },
  getters: {
    getChat: (state) => {
      return (id: string): Chat | undefined => {
        return state.chats.find((c) => c.id === id);
      };
    },
    getSortedChats: (state) => {
      return state.chats.toSorted((a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf());
    },
  },
  actions: {
    async loadAndMigrateChats() {
      try {
        // Legacy: Fetch chats stored with LocalForage
        const localForageStore = localforage.createInstance({ name: CHATS_STORE_NAME });

        const oldChats: Chat[] = [];
        await localForageStore.iterate((chat: Chat) => {
          oldChats.push(chat);
        });
        if (oldChats.length > 0) {
          const oldIds = oldChats.map((c) => c.id);
          this.chats = this.chats.filter((c) => !oldIds.includes(c.id)).concat(oldChats);
        }
        // Remove all the data now that we are done migrating it
        await localForageStore.dropInstance({ name: CHATS_STORE_NAME });

        // Running migrations if needed
        if (this.version < chatsMigrations.length) {
          // Removing migrations already ran
          const migrationsToRun = chatsMigrations.slice(this.version);
          for (const migration of migrationsToRun) {
            this.chats = this.chats.map((chat) => migration(chat));
          }
        }
        this.version = chatsMigrations.length;
      } catch (error) {
        console.error(`Chats: Running migrations starting from version ${this.version} failed: ${error}`);
      }
    },

    createChat(title: string, username: string, modelId: string, persona: UIPersona, knowledgeBaseIds: string[]): Chat {
      const id = uuidv4();
      const chat: Chat = {
        id,
        title,
        tags: [chatTag(id)],
        username,
        modelId,
        persona,
        messages: [],
        createdAt: new Date().toISOString(),
        knowledgeBases: knowledgeBaseIds,
      };
      this.chats.push(chat);
      return chat;
    },

    updateChat(chatId: string, updates: Partial<Chat>) {
      this.chats = this.chats.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, ...updates };
        }
        return chat;
      });
    },

    updateChatMessageContent(chatId: string, messageIndex: number, content: string) {
      this.chats = this.chats.map((chat) => {
        if (chat.id === chatId) {
          const messages = chat.messages;
          messages[messageIndex].content = content;
        }
        return chat;
      });
    },

    popChatMessages(chatId: string) {
      this.chats = this.chats.map((chat) => {
        if (chat.id === chatId) {
          const messages = chat.messages;
          messages.splice(-1);
        }
        return chat;
      });
    },

    appendUserMessage(chatId: string, content: string, attachments?: MessageAttachment[]): UIMessage {
      const chat = this.chats.find((chat) => chat.id === chatId);
      if (chat === undefined) {
        throw Error('Chat not found');
      }
      const userMessage: UIMessage = {
        author: 'user',
        role: chat.username,
        content,
        timestamp: new Date().toISOString(),
        attachments,
        stopped: true,
        error: null,
      };

      this.chats = this.chats.map((chat) => {
        if (chat.id === chatId) {
          chat.messages.push(userMessage);
        }
        return chat;
      });

      return userMessage;
    },

    appendModelResponse(chatId: string, response: string, searchResults: any): UIMessage {
      const chat = this.chats.find((chat) => chat.id === chatId);
      if (chat === undefined) {
        throw Error('Chat not found');
      }
      const modelResponse: UIMessage = {
        author: 'ai',
        role: chat.persona.role,
        content: response,
        timestamp: new Date().toISOString(),
        searchResults,
        stopped: true,
        error: null,
      };

      this.chats = this.chats.map((chat) => {
        if (chat.id === chatId) {
          chat.messages.push(modelResponse);
        }
        return chat;
      });

      return modelResponse;
    },

    deleteChat(chatId: string) {
      this.chats = this.chats.filter((c) => c.id !== chatId);
    },
  },
});
