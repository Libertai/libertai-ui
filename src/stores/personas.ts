import { defineStore } from 'pinia';
import { personasMigrations } from 'src/migrations/personas';
import { UIPersona } from 'src/types/personas';

import { defaultPersonas } from '../utils/personas';

type PersonasStoreState = {
  version: number;
  personas: UIPersona[];
};

export const usePersonasStore = defineStore('personas', {
  state: (): PersonasStoreState => ({
    // Current version of the migrations
    version: 0, //  /!\ DO NOT UPDATE /!\, it should be done automatically when running migrations

    personas: JSON.parse(JSON.stringify(defaultPersonas)),
  }),
  persist: {
    paths: ['version', 'personas'],
    afterRestore: (ctx) => {
      ctx.store.migratePersonas();
    },
  },
  getters: {
    // @ts-expect-error
    sortedPersonas: (state) => state.personas.slice().sort((a, b) => a.hidden - b.hidden),
    shownPersonas: (state) => state.personas.filter((persona) => !persona.hidden),
  },
  actions: {
    migratePersonas() {
      // Update stored default personas if some values where changed
      this.personas = this.personas.map((currentPersona) => {
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
      try {
        // Running migrations if needed
        if (this.version < personasMigrations.length) {
          // Removing migrations already ran
          const migrationsToRun = personasMigrations.slice(this.version);
          for (const migration of migrationsToRun) {
            this.personas = this.personas.map((persona) => migration(persona));
          }
        }
        this.version = personasMigrations.length;
      } catch (error) {
        console.error(`Personas: Running migrations starting from version ${this.version} failed: ${error}`);
      }
    },
  },
});
