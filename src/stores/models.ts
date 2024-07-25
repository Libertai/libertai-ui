import { defineStore } from 'pinia';

import { defaultModels, UIModel } from '../utils/models';

type ModelsStoreState = {
  models: UIModel[];
};

export const useModelsStore = defineStore('models', {
  state: (): ModelsStoreState => ({
    models: defaultModels,
  }),
});
