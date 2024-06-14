import { defineStore } from 'pinia';

import { defaultPersonas } from '../utils/personas.js';

export const usePersonasStore = defineStore('personas', {
  state: () => ({
    personas: JSON.parse(JSON.stringify(defaultPersonas)),
    persona: { ...defaultPersonas[0] },
  }),
  getters: {
    sortedPersonas: (state) => state.personas.slice().sort((a, b) => a.hidden - b.hidden),
    shownPersonas: (state) => state.personas.filter((persona) => !persona.hidden),
  },
  actions: {
    refreshDefaultPersonas: () => {
      const test = usePersonasStore();

      test.personas = test.personas.map((currentPersona) => {
        const matchingDefault = defaultPersonas.find((p) => currentPersona.id === p.id);
        if (!matchingDefault) {
          return currentPersona;
        }
        return {
          ...currentPersona,
          avatar: matchingDefault.avatar,
          name: matchingDefault.name,
          description: matchingDefault.description,
        };
      });
    },
  },
  persist: {
    paths: ['persona', 'personas'], // keys to persist
    afterRestore: (ctx) => {
      ctx.store.refreshDefaultPersonas();
    },
  },
});
