import { defineStore } from "pinia";

import models from "../utils/models.js";

export const useModels = defineStore("models", {
  state: () => ({
    models: models,
    model: models[0],
  }),
  getters: {},
  actions: {
    // any amount of arguments, return a promise or not
    setModel(model) {
      // you can directly mutate the state
      this.model = model;
    },
    setModelByURL(modelUrl) {
      console.log("searching for", modelUrl);
      for (let model of models) {
        if (model.apiUrl == modelUrl) {
          console.log("found", model.name, model.apiUrl);
          this.model = model;
        }
      }
    },
  },
});
