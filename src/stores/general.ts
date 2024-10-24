import { defineStore } from 'pinia';

type GeneralStoreState = {
  isSidebarOpen: boolean;
};

export const useGeneralStore = defineStore('general', {
  state: (): GeneralStoreState => ({
    isSidebarOpen: false,
  }),
});
