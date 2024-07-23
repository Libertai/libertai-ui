import { defineStore } from 'pinia';

import { defaultPersonas } from '../utils/personas';
import { UIPersona } from 'src/types/personas';

export const usePersonasStore = defineStore('personas', {
  state: () => ({
    personas: JSON.parse(JSON.stringify(defaultPersonas)) as UIPersona[],
    persona: JSON.parse(JSON.stringify(defaultPersonas[0])) as UIPersona,
  }),
  getters: {
    // @ts-expect-error
    sortedPersonas: (state) => state.personas.slice().sort((a, b) => a.hidden - b.hidden),
    shownPersonas: (state) => state.personas.filter((persona) => !persona.hidden),
  },
  actions: {
    refreshDefaultPersonas: () => {
      const store = usePersonasStore();

      store.personas = store.personas.map((currentPersona) => {
        const matchingDefault = defaultPersonas.find((p) => currentPersona.id === p.id);
        if (!matchingDefault) {
          return currentPersona;
        }
        return {
          ...currentPersona,
          avatar: matchingDefault.avatar,
          name: matchingDefault.name,
          role: matchingDefault.role,
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
