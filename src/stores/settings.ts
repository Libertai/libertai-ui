import { defineStore } from 'pinia';
import { useAccountStore } from 'stores/account';
import { Dark } from 'quasar';

type Settings = {
  darkmode: boolean;
  username: string;
  avatar: {
    item_hash: string;
    ipfs_hash: string;
  };
  isSignatureHashStored: boolean;
  // Address to hash (to support multiple accounts/wallets)
  signatureHash: Record<string, string>;
};

type SettingsPersistedOnAleph = Omit<Settings, 'signatureHash'>;

export const useSettingsStore = defineStore('settings', {
  state: (): Settings => ({
    darkmode: false,
    username: 'user',
    avatar: {
      item_hash: '3649c86b67d8bb45e0a6d7f7c06f860aebc10b322744ef15b797b707c65cc5fd',
      ipfs_hash: 'QmWxB29Jauxwypn2HrrNDyxG9D6h61ncc12jLfPR4aKybZ',
    },
    isSignatureHashStored: false,
    signatureHash: {},
  }),
  getters: {
    currentAlephPersistedSettings: (state): SettingsPersistedOnAleph => ({
      darkmode: state.darkmode,
      username: state.username,
      avatar: state.avatar,
      isSignatureHashStored: state.isSignatureHashStored,
    }),
  },
  actions: {
    async update(newSettings: Partial<Settings>, saveOnAleph: boolean = true) {
      if (newSettings.darkmode !== undefined) {
        this.darkmode = newSettings.darkmode;
        Dark.set(newSettings.darkmode);
      }
      if (newSettings.username !== undefined) {
        this.username = newSettings.username;
      }
      if (newSettings.avatar !== undefined) {
        this.avatar = newSettings.avatar;
      }
      if (newSettings.isSignatureHashStored !== undefined) {
        this.isSignatureHashStored = newSettings.isSignatureHashStored;
      }
      if (newSettings.signatureHash !== undefined) {
        this.signatureHash = newSettings.signatureHash;
      }

      if (saveOnAleph) {
        await this.persistOnAleph(this.currentAlephPersistedSettings);
      }
    },

    async persistOnAleph(settings: SettingsPersistedOnAleph) {
      const account = useAccountStore();

      if (account.alephStorage !== null) {
        await account.alephStorage.saveSettings(settings);
      }
    },
  },
  persist: {
    paths: ['darkmode', 'username', 'avatar', 'isSignatureHashStored', 'signatureHash'],
  },
});
