import { defineStore } from "pinia";

import { modelsConfig } from "../utils/models.js";

export const useModelsStore = defineStore("models", {
  state: () => ({
    models: modelsConfig,
    selectedModel: modelsConfig[0],
  }),
  getters: {},
  actions: {
    // any amount of arguments, return a promise or not
    setModel(model) {
      // you can directly mutate the state
      this.selectedModel = model;
    },
    setModelByURL(modelUrl) {
      console.log("searching for", modelUrl);
      for (let model of modelsConfig)
        if (model.apiUrl == modelUrl) {
          console.log("found", model.name, model.apiUrl);
          this.selectedModel = model;
        }
    },
  },
});
