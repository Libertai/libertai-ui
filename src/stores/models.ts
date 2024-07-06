import { defineStore } from 'pinia';

import { defaultModels, UIModel } from '../utils/models';

type ModelsStoreState = {
  models: UIModel[];
  selectedModel: UIModel;
};

export const useModelsStore = defineStore('models', {
  state: (): ModelsStoreState => ({
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
