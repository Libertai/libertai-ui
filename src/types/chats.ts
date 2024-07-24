import { Message } from '@libertai/libertai-js';
import { UIPersona } from 'src/types/personas';

export type MessageAttachment = {
  id: string;
  title: string;
  content: string;
  type: string;
};

// TODO: clean this type and understand the added properties
export type UIMessage = Message & {
  author: 'user' | 'ai';
  attachments?: MessageAttachment[];

  // to understand
  stopped?: boolean;
  error?: any;
  searchResults?: any;
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

export type SendMessageParams = { content: string; attachments?: MessageAttachment[] };
