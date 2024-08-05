import { Chat, ChatMigration } from 'src/types/chats';

const currentModels = [
  {
    id: 'c237ead6-165e-4725-af4f-a1b50b770e1e',
    name: 'Nous Hermes 2 Pro (Llama 3 8B, fast)',
    apiUrl:
      'https://curated.aleph.cloud/vm/84df52ac4466d121ef3bb409bb14f315de7be4ce600e8948d71df6485aa5bcc3/completion',
  },
  {
    id: 'a8ba5cfe-bd86-4f81-97fa-8f68300488b7',
    name: 'Roleplay (7B, fast)',
    apiUrl:
      'https://curated.aleph.cloud/vm/a8b6d895cfe757d4bc5db9ba30675b5031fe3189a99a14f13d5210c473220caf/completion',
  },
  {
    id: '068f9afc-281c-45b8-bea2-317d3c3bb469',
    name: 'Mixtral (8x7B MOE, smart)',
    apiUrl:
      'https://curated.aleph.cloud/vm/cb6a4ae6bf93599b646aa54d4639152d6ea73eedc709ca547697c56608101fc7/completion',
  },
  {
    id: 'b253aacf-cbbc-4e46-8187-74bfd5398d78',
    name: 'Phi-3-mini (3.8B, long context)',
    apiUrl:
      'https://curated.aleph.cloud/vm/ad482633bac1f1fae071fb3908c49ebe8d30e3dbeb047051a8ee1b206f2ef830/completion',
  },
  {
    id: '2f5219e5-d6e8-411a-b7a4-30dd3623e1e8',
    name: 'Nous Hermes 2 (34B, smart)',
    apiUrl:
      'https://curated.aleph.cloud/vm/16a9f0f870c251719a0c63554cf02b6b8e4c2b4fee9987ddc3341a6507aef68d/completion',
  },
  {
    id: '173ad7b5-4aa9-4ccd-8fdd-f8122499c2cb',
    name: 'Llama 3 Instruct (70B, genius, slow)',
    apiUrl:
      'https://curated.aleph.cloud/vm/055e1267fb63f5961e8aee890cfc3f61387deee79f37ce51a44b21feee57d40b/completion',
  },
  {
    id: 'c55a8d42-9f2f-4821-aa60-ee9ff8055e50',
    name: 'DeepSeek Coder V2 (6.7B, developer)',
    apiUrl:
      'https://curated.aleph.cloud/vm/b950fef19b109ef3770c89eb08a03b54016556c171b9a32475c085554b594c94/completion',
  },
];

export const chat_3_add_model_id: ChatMigration = (currentChat: Chat) => {
  const newChat = { ...currentChat };
  // @ts-expect-error
  const apiUrl = currentChat.model?.apiUrl;
  const matchingModel = currentModels.find((m) => m.apiUrl === apiUrl);

  newChat.modelId = matchingModel?.id;

  // Remove old model object
  // @ts-expect-error
  delete newChat.model;

  return newChat;
};
