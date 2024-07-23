import { ChatMigration } from 'src/types/chats';
import { chat_1_add_message_author } from 'src/utils/migrations/chats/chat_1_add_message_author';
import { chat_2_add_persona_role_and_ipfs_avatar } from 'src/utils/migrations/chats/chat_2_add_persona_role_and_ipfs_avatar';

export const chatsMigrations: ChatMigration[] = [chat_1_add_message_author, chat_2_add_persona_role_and_ipfs_avatar];
