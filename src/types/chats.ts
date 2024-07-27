import { Message } from '@libertai/libertai-js';
import { UIPersona } from 'src/types/personas';

export type MessageAttachment = {
  id: string;
  title: string;
  content: string;
  type: string; // eg 'application/pdf', 'text/plain', etc.
};

// TODO: clean this type and understand the added properties
export type UIMessage = Message & {
  author: 'user' | 'ai';
  attachments?: MessageAttachment[];
  timestamp?: string; // ISO 8601 date

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
  createdAt: string; // ISO 8601 date
};

// eslint-disable-next-line no-unused-vars
export type ChatMigration = (currentChat: Chat) => Chat;

export type SendMessageParams = { content: string; attachments?: MessageAttachment[] };
