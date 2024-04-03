import { defineStore } from "pinia";

import { personasConfig } from "../utils/personas.js";

export const usePersonasStore = defineStore("personas", {
  state: () => ({
    personas: personasConfig,
    persona: personasConfig[0],
  }),
  getters: {},
  actions: {
    setPersona(persona) {
      // you can directly mutate the state
      this.persona = persona;
    },
  },
});
