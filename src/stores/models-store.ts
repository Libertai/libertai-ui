import { defineStore } from 'pinia';

import { defaultModels } from '../utils/models.ts';

export const useModelsStore = defineStore('models', {
  state: () => ({
    models: defaultModels,
    selectedModel: defaultModels[0],
  }),
  actions: {
    setModelByURL(modelUrl) {
      for (let model of defaultModels)
        if (model.apiUrl == modelUrl) {
          this.selectedModel = model;
        }
    },
  },
});
