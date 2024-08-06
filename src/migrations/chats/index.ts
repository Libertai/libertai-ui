import { ChatMigration } from 'src/types/chats';
import { chat_1_add_message_author } from 'src/migrations/chats/chat_1_add_message_author';
import { chat_2_add_persona_role_and_ipfs_avatar } from 'src/migrations/chats/chat_2_add_persona_role_and_ipfs_avatar';
import { chat_3_add_model_id } from 'src/migrations/chats/chat_3_add_model_id';
import { chat_4_add_knowledge_bases } from 'src/migrations/chats/chat_4_add_knowledge_bases';
import { chat_5_remove_tags } from 'src/migrations/chats/chat_5_remove_tags';

export const chatsMigrations: ChatMigration[] = [
  chat_1_add_message_author,
  chat_2_add_persona_role_and_ipfs_avatar,
  chat_3_add_model_id,
  chat_4_add_knowledge_bases,
  chat_5_remove_tags,
];
