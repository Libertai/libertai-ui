import { defineStore } from 'pinia';

import { defaultPersonas } from '../utils/personas.js';

export const usePersonasStore = defineStore('personas', {
  state: () => ({
    personas: defaultPersonas,
    persona: defaultPersonas[0],
  }),
  getters: {},
});
