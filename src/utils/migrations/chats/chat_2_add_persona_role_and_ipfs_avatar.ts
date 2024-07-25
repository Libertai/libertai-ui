import { Chat, ChatMigration } from 'src/types/chats';

export const chat_2_add_persona_role_and_ipfs_avatar: ChatMigration = (currentChat: Chat) => {
  const newChat = { ...currentChat };

  if (currentChat.persona.role === undefined) {
    // Set by default role as persona name
    newChat.persona.role = currentChat.persona.name;
  }
  if (currentChat.persona.avatar === undefined) {
    // Add default IPFS LibertAI avatar
    newChat.persona.avatar = {
      item_hash: '90db3237796d27118e0b9e21dae10a4b1179878f869cb6c0058d0d7c00b0440d',
      ipfs_hash: 'QmQMBfgnmuxcQ4kptR1oPE9guYxG13GpASjYVeFQSxNxjE',
    };
  }
  // Remove old URL avatar
  // @ts-expect-error
  delete newChat.persona.avatarUrl;

  return newChat;
};
