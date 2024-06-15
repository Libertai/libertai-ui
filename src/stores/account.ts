import { defineStore } from 'pinia';
import { AlephPersistentStorage } from 'src/utils/aleph-persistent-storage';
import { useSettingsStore } from 'stores/settings';

export const useAccountStore = defineStore('account', {
  state: () => ({
    alephStorage: null as AlephPersistentStorage | null,
  }),
  actions: {
    async initAlephStorage() {
      const settingsStore = useSettingsStore();

      const alephStorage = await AlephPersistentStorage.initialize();
      if (!alephStorage) {
        return;
      }

      this.alephStorage = alephStorage;
      const settingsOnAleph = await this.alephStorage.fetch();
      await settingsStore.update(settingsOnAleph ?? {});
    },

    disconnect() {
      this.alephStorage = null;
    },
  },
});
