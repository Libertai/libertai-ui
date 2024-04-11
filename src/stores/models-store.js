import { defineStore } from 'pinia';

import { defaultModels } from '../utils/models.js';

export const useModelsStore = defineStore('models', {
  state: () => ({
    models: defaultModels,
    selectedModel: defaultModels[0],
  }),
  getters: {},
  actions: {
    // any amount of arguments, return a promise or not
    setModel(model) {
      // you can directly mutate the state
      this.selectedModel = model;
    },
    setModelByURL(modelUrl) {
      console.log('searching for', modelUrl);
      for (let model of defaultModels)
        if (model.apiUrl == modelUrl) {
          console.log('found', model.name, model.apiUrl);
          this.selectedModel = model;
        }
    },
  },
});
