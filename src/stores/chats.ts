import { defineStore } from 'pinia';
import { chatsMigrations } from 'src/migrations/chats';
import { Chat, MessageAttachment, UIMessage } from 'src/types/chats';
import { UIPersona } from 'src/types/personas';
import { v4 as uuidv4 } from 'uuid';

const CHATS_STORE_PINIA_KEY = 'chats-store-pinia-key';

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
      ctx.store.migrateChats();
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
    async migrateChats() {
      try {
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
        thought: '',
        timestamp: new Date().toISOString(),
        attachments,
        stopped: true,
        error: null,
        isLoading: true,
      };

      this.chats = this.chats.map((chat) => {
        if (chat.id === chatId) {
          chat.messages.push(userMessage);
        }
        return chat;
      });

      return userMessage;
    },

    appendModelResponse(chatId: string, response: string, thought: string, searchResults: any): UIMessage {
      const chat = this.chats.find((chat) => chat.id === chatId);
      if (chat === undefined) {
        throw Error('Chat not found');
      }
      const modelResponse: UIMessage = {
        author: 'ai',
        role: chat.persona.role,
        content: response,
        thought: thought,
        timestamp: new Date().toISOString(),
        searchResults,
        stopped: true,
        error: null,
        isLoading: true,
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
