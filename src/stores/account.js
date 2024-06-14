import { defineStore } from 'pinia';
import { AlephPersistentStorage } from 'src/utils/aleph-persistent-storage';
import { useSettingsStore } from 'stores/settings';

export const useAccountStore = defineStore('account', {
  state: () => ({
    alephStorage: null,
  }),
  actions: {
    async initAlephStorage() {
      const settingsStore = useSettingsStore();

      this.alephStorage = await AlephPersistentStorage.initialize();
      const settingsOnAleph = await this.alephStorage.fetch();
      settingsStore.update(settingsOnAleph ?? {});
    },

    disconnect() {
      this.alephStorage = null;
    },
  },
});
