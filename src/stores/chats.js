import { defineStore } from "pinia";

import models from "../utils/models.js";
import { v4 as uuidv4 } from "uuid";

export const useChats = defineStore("chats", {
  state: () => ({
    chats: [],
  }),
  getters: {},
  actions: {
    // any amount of arguments, return a promise or not
    setModel(model) {
      // you can directly mutate the state
      this.model = model;
    },

    loadFromStorage() {
      let savedChats = localStorage.getItem("assistant-chats");
      if (savedChats) {
        savedChats = JSON.parse(savedChats);
        let model_urls = models.map((m) => m.apiUrl);
        for (let chat of savedChats) {
          if (chat.id == undefined) {
            chat.id = uuidv4();
          }
          chat.unreadCount = 0;
          // check if chat model is in the list of models
          if (!model_urls.includes(chat.model.apiUrl)) {
            // check if there is another model with the same name
            const model = models.find((m) => m.name === chat.model.name);
            if (model) {
              chat.model = model;
            } else {
              // set the default model
              chat.model = models[0];
            }
          } else {
            // update the model to the latest version
            chat.model = models.find((m) => m.apiUrl === chat.model.apiUrl);
          }
        }
      } else {
        savedChats = [];
      }
      // const defaultPrompts = this.prompts;

      // TODO: verify models, and that they are still in the list.
      this.chats = savedChats;
    },

    saveToStorage() {
      localStorage.setItem("assistant-chats", JSON.stringify(this.chats));
    },

    getChat(chat_id) {
      for (let chat of this.chats) {
        if (chat.id == chat_id) return chat;
      }
    },

    addChat(chat) {
      this.chats.push(chat);
      this.saveToStorage();
    },

    deleteChat(chat) {
      const index = this.chats.indexOf(chat);
      if (index > -1) {
        // only splice array when item is found
        this.chats.splice(index, 1); // 2nd parameter means remove one item only
        this.saveToStorage();
      }
    },
  },
});
