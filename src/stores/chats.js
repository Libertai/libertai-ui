import { defineStore } from 'pinia'

import models from '../utils/models.js'

export const useChats = defineStore('chats', {
  state: () => ({
    chats: [],
  }),
  getters: {
  },
  actions: {
    // any amount of arguments, return a promise or not
    setModel(model) {
      // you can directly mutate the state
      this.model = model
    },

    loadFromStorage() {
        let savedChats = localStorage.getItem("assistant-chats");
        if (savedChats) {
            savedChats = JSON.parse(savedChats);
            let model_urls = models.map(m => m.apiUrl);
            for (let chat of savedChats) {
                chat.unreadCount = 0;
                // check if chat model is in the list of models
                if (!model_urls.includes(chat.model.apiUrl)) {
                    // check if there is another model with the same name
                    const model = models.find(m => m.name === chat.model.name);
                    if (model) {
                        chat.model = model;
                    } else {
                        // set the default model
                        chat.model = models[0];
                    }
                } else {
                    // update the model to the latest version
                    chat.model = models.find(m => m.apiUrl === chat.model.apiUrl);
                }
            }
        }
        else {
            savedChats = [];
        }
        // const defaultPrompts = this.prompts;

        // TODO: verify models, and that they are still in the list.
        this.chats = savedChats;
    }
  },
})

