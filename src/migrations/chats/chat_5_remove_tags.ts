import { Chat, ChatMigration } from 'src/types/chats';

export const chat_5_remove_tags: ChatMigration = (currentChat: Chat) => {
  const newChat = { ...currentChat };

  // @ts-expect-error
  delete newChat.tags;

  return newChat;
};
