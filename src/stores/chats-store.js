import { defineStore } from "pinia";
import { ChatsStore } from "libertai-js";

export const CHATS_STORE_PINIA_KEY = "chats-store-pinia-key";

export const useChatsStore = defineStore(CHATS_STORE_PINIA_KEY, {
  state: () => ({
    // Interface for our ChatsStore
    chatsStore: new ChatsStore(),
    // List of partials chats for populating the UI
    partialChats: [],
  }),
  getters: {},
  actions: {
    // Load and update chats with tweaks to models
    async loadAndUpdate(models) {
      console.log("stores::chats-store::loadAndUpdate: models = %s", models);
      // Return a list of partial chats
      // Contains id, title, and model
      let partialChats = await this.chatsStore.readChats();
      console.log(
        "stores::chats-store::loadAndUpdate: partialChats = %s",
        partialChats,
      );

      // Map over partial chats and update models where necessary
      let updatedPartialChats = await Promise.all(
        partialChats.map(async (chat) => {
          // Determine what apiUrl the chat is using
          let chatApiUrl = chat.model.apiUrl;
          // Find the model with the same apiUrl
          let model = models.find((m) => m.apiUrl === chatApiUrl);
          // Ser / DeSer our model to be safe
          model = JSON.parse(JSON.stringify(model));
          // If the model is found, update the chat model to the latest version
          if (model) {
            // TODO: we should version models to have a better equality check
            if (model === chat.model) {
              return chat;
            }
            chat.model = model;
            await this.chatsStore.updateChat(chat.id, { model });
          } else {
            // Set default model
            chat.model = models[0];
          }
          return chat;
        }),
      );

      console.log(
        "stores::chats-store::loadAndUpdate: updatedPartialChats = %s",
        updatedPartialChats,
      );
      // Update our partial chats
      this.partialChats = updatedPartialChats;
    },

    // Load chat by id
    async loadChat(id) {
      const chat = await this.chatsStore.readChat(id);
      return chat;
    },

    // Create a new chat
    async createChat(title, username, model, persona) {
      console.log(
        "stores::chats-store::createChat: title = %s, username = %s, model = %s, persona = %s",
        title,
        username,
        model,
        persona,
      );
      const chat = await this.chatsStore.createChat(
        title,
        username,
        model,
        persona,
      );
      this.partialChats.push(chat);
      return chat;
    },

    async updateChatTitle(chatId, title) {
      console.log(
        "stores::chats-store::updateChatTitle: id = %s, title = %s",
        chatId,
        title,
      );
      await this.chatsStore.updateChat(chatId, { title });
      // Update the partial chats
      this.partialChats = this.partialChats.map((chat) => {
        if (chat.id === chatId) {
          chat.title = title;
        }
        return chat;
      });
    },

    async updateChatModel(chatId, model) {
      console.log(
        "stores::chats-store::updateChatModel: id = %s, model = %s",
        chatId,
        model,
      );
      await this.chatsStore.updateChat(chatId, { model });
      // Update the partial chats
      this.partialChats = this.partialChats.map((chat) => {
        if (chat.id === chatId) {
          chat.model = model;
        }
        return chat;
      });
    },

    async popChatMessages(chatId) {
      console.log("stores::chats-store::popLastMessage: id = %s", chatId);
      return await this.chatsStore.popChatMessages(chatId);
    },

    async appendUserMessage(chatId, message) {
      console.log(
        "stores::chats-store::appendUserMessage: id = %s, message = %s",
        chatId,
        message,
      );
      return await this.chatsStore.appendUserMessage(chatId, message);
    },

    async appendModelResponse(chatId, response) {
      console.log(
        "stores::chats-store::appendModelResponse: id = %s, response = %s",
        chatId,
        response,
      );
      return await this.chatsStore.appendModelResponse(chatId, response);
    },

    async deleteChat(chatId) {
      console.log("stores::chats-store::deleteChat: chat = %s", chatId);
      await this.chatsStore.deleteChat(chatId);
      this.partialChats = this.partialChats.filter((c) => c.id !== chatId);
    },
  },
});
