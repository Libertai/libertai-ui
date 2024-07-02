import { defineStore } from 'pinia';

import { defaultModels } from '../utils/models';

export const useModelsStore = defineStore('models', {
  state: () => ({
    models: defaultModels,
    selectedModel: defaultModels[0],
  }),
  actions: {
    setModelByURL(modelUrl: string) {
      for (let model of defaultModels)
        if (model.apiUrl === modelUrl) {
          this.selectedModel = model;
        }
    },
    unselectPremiumModel() {
      // Remove premium selected model
      if (this.selectedModel.premium) {
        this.selectedModel = this.models.find((model) => !model.premium)!;
      }
    },
  },
});
