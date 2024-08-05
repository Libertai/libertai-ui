import { Chat, ChatMigration } from 'src/types/chats';

export const chat_4_add_knowledge_bases: ChatMigration = (currentChat: Chat) => {
  return { ...currentChat, knowledgeBases: [] };
};
