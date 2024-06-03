import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    darkmode: false,
    username: 'user',
  }),
  getters: {},
  actions: {
    setDarkMode(value) {
      this.darkmode = value;
    },
  },
  persist: {
    //storage: sessionStorage | idb
    paths: ['darkmode', 'username'], // key to persist
  },
});
