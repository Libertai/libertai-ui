import { Message } from '@libertai/libertai-js';
import { UIPersona } from 'src/types/personas';

// TODO: clean this type and understand the added properties
export type UIMessage = Message & {
  stopped?: boolean;
  error?: any;
  searchResults?: any;
  attachments?: any[];
  author: 'user' | 'ai';
};

export type Chat = {
  id: string;
  title: string;
  username: string;
  tags: string[];

  modelId?: string;
  persona: UIPersona;
  messages: UIMessage[];
  createdAt: Date;
};
export type MinimalChat = Pick<Chat, 'id' | 'title' | 'createdAt'> & Partial<Chat>;

// eslint-disable-next-line no-unused-vars
export type ChatMigration = (currentChat: Chat) => Chat;
