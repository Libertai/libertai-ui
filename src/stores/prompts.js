import { defineStore } from 'pinia'

import prompts from '../utils/prompts.js'

export const usePrompts = defineStore('prompts', {
  state: () => ({
    prompts: prompts,
    prompt: prompts[0]
  }),
  getters: {
  },
  actions: {
    setPrompt(prompt) {
      // you can directly mutate the state
      this.prompt = prompt
    },
  },
})

