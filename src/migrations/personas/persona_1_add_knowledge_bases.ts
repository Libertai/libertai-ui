import { PersonaMigration, UIPersona } from 'src/types/personas';

export const persona_1_add_knowledge_bases: PersonaMigration = (currentPersona: UIPersona) => {
  return { ...currentPersona, knowledgeBases: [] };
};
