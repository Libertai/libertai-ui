import { v4 as uuidv4 } from 'uuid';
import { defineStore } from 'pinia';

import { defaultModels } from 'src/utils/models';
import { chatTag } from 'src/utils/chat';
import idb from 'src/utils/idb';
import { Message, Model } from '@libertai/libertai-js';
import { UIPersona } from 'src/utils/personas';

const CHATS_STORE_NAME = 'chats-store';
const CHATS_STORE_PINIA_KEY = 'chats-store-pinia-key';

export type UIMessage = Message & { stopped?: boolean; error?: any; searchResults?: any };

export type Chat = {
  id: string;
  title: string;
  username: string;
  tags: string[];

  model: Model;
  persona: UIPersona; // TODO: fix and use real message from SDK
  messages: UIMessage[]; // TODO: fix and use real message from SDK
  createdAt: Date;
};

type MinimalChat = Pick<Chat, 'id' | 'title' | 'createdAt'> & Partial<Chat>;

/**
 * Representation of an attachment:
 * interface Attachment {
 *   // File type
 *   type: string;  // eg 'application/pdf', 'text/plain', etc.
 *   // File name
 *   name: string;
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
  chatsStore: ChatsStore;
  chats: MinimalChat[];
};

export const useChatsStore = defineStore(CHATS_STORE_PINIA_KEY, {
  state: (): ChatsStoreState => ({
    // Interface for our ChatsStore
    chatsStore: new ChatsStore(),
    // List of partials chats
    chats: [],
  }),
  actions: {
    async load() {
      // Update the models for all chats
      await this.chatsStore.updateModels(defaultModels);
      // Get the partial chats
      this.chats = await this.chatsStore.readChats();
    },

    async readChat(id: string) {
      return await this.chatsStore.readChat(id);
    },

    async createChat(title: string, username: string, model: Model, persona: UIPersona): Promise<Chat> {
      const chat = await this.chatsStore.createChat(title, username, [], model, persona);
      const tag = chatTag(chat.id);
      await this.chatsStore.pushChatTag(chat.id, tag);
      this.chats.push(chat);
      return chat;
    },

    async updateChatTitle(chatId: string, title: string) {
      await this.chatsStore.updateChat(chatId, { title });
      // Update the partial chats
      this.chats = this.chats.map((chat) => {
        if (chat.id === chatId) {
          chat.title = title;
        }
        return chat;
      });
    },

    async updateChatModel(chatId: string, model: Model) {
      await this.chatsStore.updateChat(chatId, { model });
      // Update the partial chats
      this.chats = this.chats.map((chat) => {
        if (chat.id === chatId) {
          chat.model = model;
        }
        return chat;
      });
    },

    async updateChatMessageContent(chatId: string, messageIndex: number, content: string) {
      const chat = await this.chatsStore.readChat(chatId);
      const messages = chat.messages;
      messages[messageIndex].content = content;
      await this.chatsStore.updateChat(chatId, { messages });
    },

    async popChatMessages(chatId: string) {
      return await this.chatsStore.popChatMessages(chatId);
    },

    async appendUserMessage(chatId: string, message: string, attachments: any[] | undefined = undefined) {
      return await this.chatsStore.appendUserMessage(chatId, message, attachments);
    },

    async appendModelResponse(chatId: string, response: string, searchResults: any) {
      return await this.chatsStore.appendModelResponse(chatId, response, searchResults);
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

  async updateModels(models: Model[]) {
    // Create an array for the updates we will resolve
    const updatedChats: Promise<Chat>[] = [];

    // Iterate over all chats and update the model if necessary
    await this.store.iterate((chat: Chat, _key, _iterationNumber) => {
      // Find the chat and model
      const apiUrl = chat.model.apiUrl;
      const matchingModel = models.find((m) => m.apiUrl === apiUrl);

      // Determine if the model has changed
      let changed = false;
      if (matchingModel) {
        // Do a deep comparison of the models
        if (matchingModel !== chat.model) {
          chat.model = matchingModel;
          changed = true;
        }
      }

      // If the model has changed, update the chat
      if (changed) {
        updatedChats.push(idb.put(chat.id, chat, this.store));
      }
    });

    await Promise.all(updatedChats);
  }

  async createChat(title: string, username: string, tags: string[], model: Model, persona: UIPersona) {
    const id = uuidv4();
    const chat: Chat = {
      id,
      title,
      tags,
      username,
      model,
      persona,
      messages: [],
      createdAt: new Date(),
    };
    return idb.put<Chat>(chat.id, chat, this.store);
  }

  async readChats(): Promise<MinimalChat[]> {
    const result: MinimalChat[] = [];
    await this.store.iterate((value: Chat, _key) => {
      const chat = value;
      const partialChat = {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
      };
      result.push(partialChat);
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

  async appendUserMessage(chatId: string, messageContent: string, attachments: any[] | undefined) {
    const chat = await this.readChat(chatId);
    const message: Message & { attachments: any[] | undefined } = {
      role: chat.username,
      content: messageContent,
      timestamp: new Date(),
      attachments,
    };
    chat.messages.push(message);
    await idb.put(chatId, chat, this.store);
    return message;
  }

  async appendModelResponse(chatId: string, responseContent: string, searchResults: any) {
    const chat = await this.readChat(chatId);
    const message: Message & { searchResults: any } = {
      role: chat.persona.role,
      content: responseContent,
      timestamp: new Date(),
      searchResults,
    };
    chat.messages.push(message);
    await idb.put(chatId, chat, this.store);
    return message;
  }

  async deleteChat(id: string) {
    await idb.rm(id, this.store);
  }
}
