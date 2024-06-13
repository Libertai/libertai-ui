import { v4 as uuidv4 } from 'uuid';
import { defineStore } from 'pinia';

import { defaultModels } from 'src/utils/models';
import { chatTag } from 'src/utils/chat';
import * as idb from 'src/utils/idb';

const CHATS_STORE_NAME = 'chats-store';
const CHATS_STORE_PINIA_KEY = 'chats-store-pinia-key';

/**
 * Representation of a single chat:
 *
 * interface Chat {
 *  id: string;
 *  title: string;
 *  username: string;
 *  tags: string[];
 *
 *  // From @libertai/libertai-js
 *  model: Model;
 *  persona: Persona;
 *  // Note: we will populate these with additional data,
 *  // by inlining attachments, search-results, etc.
 *  messages: Message[];
 *  createdAt: Date;
 * }
 */

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

export const useChatsStore = defineStore(CHATS_STORE_PINIA_KEY, {
  state: () => ({
    // Interface for our ChatsStore
    chatsStore: new ChatsStore(),
    // List of partials chats of the form { id, title }
    chats: [],
  }),
  getters: {},
  actions: {
    /**
     * Load the chats from persistent storage and update the models
     * @async
     * @returns {Promise<void>}
     */
    async load() {
      // Update the models for all chats
      await this.chatsStore.updateModels(defaultModels);
      // Get the partial chats of the form { id, title }
      let chats = await this.chatsStore.readChats();
      this.chats = chats;
    },

    /**
     * Read a chat by its id
     * @async
     * @param {string} id - the id of the chat
     * @returns {Promise<Chat>} - the chat or null if not found
     * @throws {Error} - if the chat is not found
     */
    async readChat(id) {
      const chat = await this.chatsStore.readChat(id);
      return chat;
    },

    /**
     * Create a new chat
     * @async
     * @param {string} title - the title of the chat
     * @param {string} username - the username of the user
     * @param {Model} model - the model to use for the chat
     * @param {Persona} persona - the persona to use for the chat
     * @returns {Promise<Chat>} - the created chat
     */
    async createChat(title, username, model, persona) {
      const chat = await this.chatsStore.createChat(title, username, [], model, persona);
      const tag = chatTag(chat.id);
      await this.chatsStore.pushChatTag(chat.id, tag);
      this.chats.push(chat);
      return chat;
    },

    /**
     * Update the title of a chat
     * @async
     * @param {string} chatId - the id of the chat
     * @param {string} title - the new title of the chat
     * @returns {Promise<void>}
     * @throws {Error} - if the chat is not found
     */
    async updateChatTitle(chatId, title) {
      await this.chatsStore.updateChat(chatId, { title });
      // Update the partial chats
      this.chats = this.chats.map((chat) => {
        if (chat.id === chatId) {
          chat.title = title;
        }
        return chat;
      });
    },

    /**
     * Update the model of a chat
     * @async
     * @param {string} chatId - the id of the chat
     * @param {Model} model - the new model of the chat
     * @returns {Promise<void>}
     * @throws {Error} - if the chat is not found
     */
    async updateChatModel(chatId, model) {
      await this.chatsStore.updateChat(chatId, { model });
      // Update the partial chats
      this.chats = this.chats.map((chat) => {
        if (chat.id === chatId) {
          chat.model = model;
        }
        return chat;
      });
    },

    /**
     * Update chat message content
     * @async
     * @param {string} chatId - the id of the chat
     * @param {number} messageIndex - the index of the message
     * @param {string} content - the new content of the message
     * @returns {Promise<void>}
     * @throws {Error} - if the chat is not found
     */
    async updateChatMessageContent(chatId, messageIndex, content) {
      const chat = await this.chatsStore.readChat(chatId);
      let messages = chat.messages;
      messages[messageIndex].content = content;
      await this.chatsStore.updateChat(chatId, { messages });
    },

    /**
     * Pop the last message from a chat
     * @async
     * @param {string} chatId - the id of the chat
     * @returns {Promise<void>}
     */
    async popChatMessages(chatId) {
      return await this.chatsStore.popChatMessages(chatId);
    },

    /**
     * append a user message to a chat
     * @async
     * @param {string} chatId - the id of the chat
     * @param {string} message - the content of the message
     * @param {[]} attachments - the attachments of the message
     * @returns {Promise<Message>} - the created message
     */
    async appendUserMessage(chatId, message, attachments) {
      return await this.chatsStore.appendUserMessage(chatId, message, attachments);
    },

    /**
     * append a model response to a chat
     * @async
     * @param {string} chatId - the id of the chat
     * @param {string} response - the content of the response
     * @returns {Promise<Message>} - the created message
     */
    async appendModelResponse(chatId, response, searchResults) {
      return await this.chatsStore.appendModelResponse(chatId, response, searchResults);
    },

    /**
     * Delete a chat
     * @async
     * @param {string} chatId - the id of the chat
     * @returns {Promise<void>}
     */
    async deleteChat(chatId) {
      await this.chatsStore.deleteChat(chatId);
      this.chats = this.chats.filter((c) => c.id !== chatId);
    },
  },
});

class ChatsStore {
  constructor() {
    // Initialize the localforage store
    this.store = idb.createStore(CHATS_STORE_NAME);

    this.createChat = this.createChat.bind(this);
    this.readChats = this.readChats.bind(this);
    this.readChat = this.readChat.bind(this);
    this.updateChat = this.updateChat.bind(this);
    this.popChatMessages = this.popChatMessages.bind(this);
    this.appendUserMessage = this.appendUserMessage.bind(this);
    this.appendModelResponse = this.appendModelResponse.bind(this);
  }

  /**
   * Update the models for all of our chats if one of them has been updated.
   * Searches for the model by apiUrl and updates the chat model if it has changed.
   * @async
   * @param {Model[]} - list of up-to-date models
   * @returns {Promise<void>}
   */
  async updateModels(upToDateModels) {
    // Create an array for the updates we will resolve
    const updatedChats = [];

    // Iterate over all chats and update the model if necessary
    await this.store.iterate((value, _key, _iterationNumber) => {
      // Find the chat and model
      const chat = value;
      const apiUrl = chat.model.apiUrl;
      const upToDateModel = upToDateModels.find((m) => m.apiUrl === apiUrl);

      // Determine if the model has changed
      let changed = false;
      if (upToDateModel) {
        // Do a deep comparison of the models
        if (upToDateModel !== chat.model) {
          chat.model = upToDateModel;
          changed = true;
        }
      } else {
        chat.model = upToDateModel;
        changed = true;
      }

      // If the model has changed, update the chat
      if (changed) {
        updatedChats.push(idb.put(chat.id, chat, this.store));
      }
    });

    // Resolve all the updates
    await Promise.all(updatedChats);

    // Done!
  }

  /**
   * Create a new chat
   * @async
   * @param {string} title - the title of the chat
   * @param {string} username - the username of the user
   * @param {string[]} tags - the tags of the chat
   * @param {Model} model - the model to use for the chat
   * @param {Persona} persona - the persona to use for the chat
   * @returns {Promise<Chat>} - the created chat
   */
  async createChat(title, username, tags, model, persona) {
    const id = uuidv4();
    const chat = {
      id,
      title,
      tags,
      username,
      model,
      persona,
      messages: [],
      createdAt: new Date(),
    };
    return await idb.put(chat.id, chat, this.store);
  }

  /**
   * Read all chats from the store as of the form { id, title }
   * @async
   * @returns {Promise<Partial<Chat>[]>} - list of partial chats
   */
  async readChats() {
    const result = [];
    await this.store.iterate((value, _key) => {
      const chat = value;
      const partialChat = {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
      };
      //
      result.push(partialChat);
    });
    // Sort the chats by creation date (descending)
    result.sort((a, b) => a.createdAt - b.createdAt);
    return result;
  }

  /**
   * Read a chat from the store by its id
   * @async
   * @param {string} id - the id of the chat
   * @returns {Promise<Chat>} - the chat
   * @throws {Error} - if the chat is not found
   */
  async readChat(id) {
    let chat = idb.get(id, this.store);
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  }

  /**
   * Push a tag to a chat
   * @async
   * @param {string} chatId - the id of the chat
   * @param {string} tag - the tag to push
   * @returns {Promise<void>}
   * @throws {Error} - if the tag is already in the chat
   */
  async pushChatTag(chatId, tag) {
    const chat = await this.readChat(chatId);
    if (chat.tags.includes(tag)) {
      throw new Error('Tag already in chat');
    }
    chat.tags.push(tag);
    await idb.put(chatId, chat, this.store);
  }

  /**
   * Update a chat with a partial data
   * @async
   * @param {string} chatId - the id of the chat
   * @param {Partial<Chat>} chat - the partial chat data
   * @returns {Promise<void>}
   * @throws {Error} - if the chat is not found
   */
  async updateChat(chatId, chat) {
    const fullChat = await this.readChat(chatId);
    // TODO: I should probably validate the chat data here
    const updatedChat = { ...fullChat, ...chat };
    await idb.put(chatId, updatedChat, this.store);
  }

  /**
   * Pop the last message from a chat
   * @async
   * @param {string} chatId - the id of the chat
   * @returns {Promise<void>}
   * @throws {Error} - if the chat is not found
   */
  async popChatMessages(chatId) {
    const chat = await this.readChat(chatId);
    chat.messages.pop();
    await idb.put(chatId, chat, this.store);
  }

  /**
   * Append a user message to a chat -- a message with the user's role as recorded in the chat
   * @async
   * @param {string} chatId - the id of the chat
   * @param {string} messageContent - the content of the message
   * @param {[]} attachments - the attachments of the message
   * @returns {Promise<Message>} - the created message
   * @throws {Error} - if the chat is not found
   */
  async appendUserMessage(chatId, messageContent, attachments) {
    const chat = await this.readChat(chatId);
    const message = {
      role: chat.username,
      content: messageContent,
      timestamp: new Date(),
      attachments,
    };
    chat.messages.push(message);
    await idb.put(chatId, chat, this.store);
    return message;
  }

  /**
   * Append a model's response to a chat
   * @async
   * @param {string} chatId - the id of the chat
   * @param {string} responseContent - the content of the response
   * @returns {Promise<Message>} - the created message
   * @throws {Error} - if the chat is not found
   */
  async appendModelResponse(chatId, responseContent, searchResults) {
    const chat = await this.readChat(chatId);
    const message = {
      role: chat.persona.name,
      content: responseContent,
      timestamp: new Date(),
      searchResults,
    };
    chat.messages.push(message);
    await idb.put(chatId, chat, this.store);
    return message;
  }

  /**
   * Delete a chat from the store
   * @async
   * @param {string} id - the id of the chat
   * @returns {Promise<void>}
   */
  async deleteChat(id) {
    await idb.rm(id, this.store);
  }
}
