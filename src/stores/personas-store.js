import { defineStore } from 'pinia';

import { defaultPersonas } from '../utils/personas.js';

export const usePersonasStore = defineStore('personas', {
  state: () => ({
    personas: defaultPersonas,
    persona: { ...defaultPersonas[0] },
  }),
  getters: {},
  actions: {
    setPersona(persona) {
      // you can directly mutate the state
      this.persona = persona;
    },
  },
  persist: {
    paths: ['persona'], // key to persist
  },
});
