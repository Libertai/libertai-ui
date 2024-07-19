import { ChatMigration } from 'src/types/chats';
import { chat_1_add_message_author } from 'src/utils/migrations/chats/chat_0';

export const chatsMigrations: ChatMigration[] = [chat_1_add_message_author];
