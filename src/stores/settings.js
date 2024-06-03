import { defineStore } from 'pinia';
import { useAccountStore } from 'stores/account';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    darkmode: false,
    username: 'user',
  }),
  getters: {
    currentPersistedSettings: (state) => ({ darkmode: state.darkmode, username: state.username }),
  },
  actions: {
    async update(newSettings, saveOnAleph = true) {
      if (newSettings.darkmode !== undefined) {
        this.darkmode = newSettings.darkmode;
      }
      if (newSettings.username !== undefined) {
        this.username = newSettings.username;
      }

      if (saveOnAleph) {
        this.persistOnAleph(this.currentPersistedSettings);
      }
    },

    async persistOnAleph(settings) {
      const account = useAccountStore();

      if (account.alephStorage !== null) {
        account.alephStorage.save(settings);
      }
    },
  },
  persist: {
    //storage: sessionStorage | idb
    paths: ['darkmode', 'username'], // key to persist
  },
});
