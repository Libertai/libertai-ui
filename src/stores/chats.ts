import { v4 as uuidv4 } from 'uuid';
import { defineStore } from 'pinia';
import { chatTag } from 'src/utils/chat';
import idb from 'src/utils/idb';
import { chatsMigrations } from 'src/utils/migrations/chats';
import { Chat, ChatMigration, MessageAttachment, UIMessage } from 'src/types/chats';
import { UIPersona } from 'src/types/personas';
import { LocalForage } from 'src/types/utils';

const CHATS_STORE_NAME = 'chats-store';
const CHATS_STORE_PINIA_KEY = 'chats-store-pinia-key';

/**
 * To implement in attachments:
 * interface Attachment {
 *   // Document id within the embedding store, if stored there
 *   documentId: string?;
 *   // The content of the attachment, if stored inlined
 *   content: string?;
 * }
 */

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
  chatsStore: ChatsStore;
  chats: Chat[];
};

export const useChatsStore = defineStore(CHATS_STORE_PINIA_KEY, {
  state: (): ChatsStoreState => ({
    // Current version of the migrations
    version: 0, //  /!\ DO NOT UPDATE /!\, it should be done automatically when running migrations

    // Interface for our ChatsStore
    chatsStore: new ChatsStore(),

    chats: [],
  }),
  persist: {
    paths: ['version'],
  },
  getters: {
    getChat: (state) => {
      return (id: string): Chat | undefined => {
        return state.chats.find((c) => c.id === id);
      };
    },
  },
  actions: {
    async load() {
      this.chats = await this.chatsStore.getChats();

      try {
        // Running migrations if needed
        if (this.version < chatsMigrations.length) {
          // Removing migrations already ran
          const migrationsToRun = chatsMigrations.slice(this.version);
          for (const migration of migrationsToRun) {
            await this.chatsStore.runMigration(migration);
          }
        }
        this.version = chatsMigrations.length;
      } catch (error) {
        console.error(`Chats: Running migrations starting from version ${this.version} failed: ${error}`);
      }
    },

    async createChat(title: string, username: string, modelId: string, persona: UIPersona): Promise<Chat> {
      const chat = await this.chatsStore.createChat(title, username, [], modelId, persona);
      const tag = chatTag(chat.id);
      await this.chatsStore.pushChatTag(chat.id, tag);
      this.chats.push(chat);
      return chat;
    },

    async updateChat(chatId: string, updates: Partial<Chat>) {
      await this.chatsStore.updateChat(chatId, updates);
      this.chats = await this.chatsStore.getChats();
    },

    async updateChatMessageContent(chatId: string, messageIndex: number, content: string) {
      const chat = await this.chatsStore.readChat(chatId);
      const messages = chat.messages;
      messages[messageIndex].content = content;
      await this.chatsStore.updateChat(chatId, { messages });
      this.chats = await this.chatsStore.getChats();
    },

    async popChatMessages(chatId: string) {
      await this.chatsStore.popChatMessages(chatId);
      this.chats = await this.chatsStore.getChats();
    },

    async appendUserMessage(chatId: string, message: string, attachments?: MessageAttachment[]): Promise<UIMessage> {
      const userMessage = await this.chatsStore.appendUserMessage(chatId, message, attachments);
      this.chats = await this.chatsStore.getChats();
      return userMessage;
    },

    async appendModelResponse(chatId: string, response: string, searchResults: any) {
      await this.chatsStore.appendModelResponse(chatId, response, searchResults);
      this.chats = await this.chatsStore.getChats();
    },

    async deleteChat(chatId: string) {
      await this.chatsStore.deleteChat(chatId);
      this.chats = this.chats.filter((c) => c.id !== chatId);
    },
  },
});

class ChatsStore {
  private readonly store: LocalForage;

  constructor() {
    // Initialize the localforage store
    this.store = idb.createStore(CHATS_STORE_NAME);
  }

  async runMigration(migration: ChatMigration) {
    const updatedChats: Promise<Chat>[] = [];

    await this.store.iterate((currentChat: Chat) => {
      const newChat = migration(currentChat);
      updatedChats.push(idb.put(currentChat.id, newChat, this.store));
    });

    await Promise.all(updatedChats);
  }

  async createChat(title: string, username: string, tags: string[], modelId: string, persona: UIPersona) {
    const id = uuidv4();
    const chat: Chat = {
      id,
      title,
      tags,
      username,
      modelId,
      persona,
      messages: [],
      createdAt: new Date(),
    };
    return idb.put<Chat>(chat.id, chat, this.store);
  }

  async getChats(): Promise<Chat[]> {
    const result: Chat[] = [];
    await this.store.iterate((chat: Chat) => {
      result.push(chat);
    });
    // Sort the chats by creation date (descending)
    result.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());
    return result;
  }

  async readChat(id: string): Promise<Chat> {
    const chat = await idb.get<Chat>(id, this.store);
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  }

  async pushChatTag(chatId: string, tag: string) {
    const chat = await this.readChat(chatId);
    if (chat.tags.includes(tag)) {
      throw new Error('Tag already in chat');
    }
    chat.tags.push(tag);
    await idb.put(chatId, chat, this.store);
  }

  async updateChat(chatId: string, chat: Partial<Chat>) {
    const fullChat = await this.readChat(chatId);
    const updatedChat = { ...fullChat, ...chat };
    await idb.put(chatId, updatedChat, this.store);
  }

  async popChatMessages(chatId: string) {
    const chat = await this.readChat(chatId);
    chat.messages.pop();
    await idb.put(chatId, chat, this.store);
  }

  async appendUserMessage(chatId: string, messageContent: string, attachments?: MessageAttachment[]) {
    const chat = await this.readChat(chatId);
    const message: UIMessage = {
      author: 'user',
      role: chat.username,
      content: messageContent,
      timestamp: new Date(),
      attachments,
      stopped: true,
      error: null,
    };
    chat.messages.push(message);
    await idb.put(chatId, chat, this.store);
    return message;
  }

  async appendModelResponse(chatId: string, responseContent: string, searchResults: any) {
    const chat = await this.readChat(chatId);
    const message: UIMessage = {
      author: 'ai',
      role: chat.persona.role,
      content: responseContent,
      timestamp: new Date(),
      searchResults,
      stopped: true,
      error: null,
    };
    chat.messages.push(message);
    await idb.put(chatId, chat, this.store);
    return message;
  }

  async deleteChat(id: string) {
    await idb.rm(id, this.store);
  }
}
