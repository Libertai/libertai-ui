import { PersonaMigration } from 'src/types/personas';
import { persona_1_add_knowledge_bases } from 'src/migrations/personas/persona_1_add_knowledge_bases';

export const personasMigrations: PersonaMigration[] = [persona_1_add_knowledge_bases];
