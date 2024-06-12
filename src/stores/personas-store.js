import { defineStore } from 'pinia';

import { defaultPersonas } from '../utils/personas.js';

export const usePersonasStore = defineStore('personas', {
  state: () => ({
    personas: defaultPersonas,
    persona: { ...defaultPersonas[0] },
  }),
  getters: {
    sortedPersonas: (state) => state.personas.slice().sort((a, b) => a.hidden - b.hidden),
    shownPersonas: (state) => state.personas.filter((persona) => !persona.hidden),
  },
  persist: {
    paths: ['persona', 'personas'], // key to persist
  },
});
