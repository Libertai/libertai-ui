import { defineStore } from 'pinia'

import models from '../utils/models.js'

export const useModels = defineStore('models', {
  state: () => ({
    wallet: null,
    address: ''
  }),
  getters: {
  },
  actions: {
    // any amount of arguments, return a promise or not
    setWallet(wallet) {
      // you can directly mutate the state
      this.wallet = wallet
    },
  },
})

