import { defineStore } from 'pinia';

import { defaultModels } from '../utils/models.ts';

export const useModelsStore = defineStore('models', {
  state: () => ({
    models: defaultModels,
    selectedModel: defaultModels[0],
  }),
  actions: {
    // any amount of arguments, return a promise or not
    setModel(model) {
      // you can directly mutate the state
      this.selectedModel = model;
    },
    setModelByURL(modelUrl) {
      for (let model of defaultModels)
        if (model.apiUrl == modelUrl) {
          this.selectedModel = model;
        }
    },
  },
});
