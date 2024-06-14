import { defineStore } from 'pinia';
import { useAccountStore } from 'stores/account';

type Settings = {
  darkmode: boolean;
  username: string;
  avatar: {
    item_hash: string;
    ipfs_hash: string;
  };
};

export const useSettingsStore = defineStore('settings', {
  state: (): Settings => ({
    darkmode: false,
    username: 'user',
    avatar: {
      item_hash: '3649c86b67d8bb45e0a6d7f7c06f860aebc10b322744ef15b797b707c65cc5fd',
      ipfs_hash: 'QmWxB29Jauxwypn2HrrNDyxG9D6h61ncc12jLfPR4aKybZ',
    },
  }),
  getters: {
    currentPersistedSettings: (state): Settings => ({
      darkmode: state.darkmode,
      username: state.username,
      avatar: state.avatar,
    }),
  },
  actions: {
    async update(newSettings: Partial<Settings>, saveOnAleph: boolean = true) {
      if (newSettings.darkmode !== undefined) {
        this.darkmode = newSettings.darkmode;
      }
      if (newSettings.username !== undefined) {
        this.username = newSettings.username;
      }
      if (newSettings.avatar !== undefined) {
        this.avatar = newSettings.avatar;
      }

      if (saveOnAleph) {
        await this.persistOnAleph(this.currentPersistedSettings);
      }
    },

    async persistOnAleph(settings: Settings) {
      const account: any = useAccountStore();

      if (account.alephStorage !== null) {
        account.alephStorage.save(settings);
      }
    },
  },
  persist: {
    //storage: sessionStorage | idb
    paths: ['darkmode', 'username', 'avatar'], // key to persist
  },
});
