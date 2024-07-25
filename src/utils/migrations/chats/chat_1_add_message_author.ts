import { Chat, ChatMigration, UIMessage } from 'src/types/chats';

export const chat_1_add_message_author: ChatMigration = (currentChat: Chat) => {
  const messages = currentChat.messages.map((message): UIMessage => {
    if (message.role === 'user') {
      return { ...message, author: 'user' };
    }
    return { ...message, author: 'ai' };
  });

  return { ...currentChat, messages };
};
