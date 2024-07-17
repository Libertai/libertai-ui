import { Model } from '@libertai/libertai-js';

export const promptFormatDefaults = {
  userPrepend: '<|im_start|>',
  userAppend: '\n',
  logStart: '',
  lineSeparator: '\n',
  stopSequence: '<|im_end|>',
  additionalStopSequences: ['<|endoftext|>', '<|', '</|', '</assistant', '</user', '<im_end|>'],
};

export const promptFormatPhi = {
  userPrepend: '<|',
  userAppend: '|>',
  logStart: '',
  lineSeparator: '\n',
  stopSequence: '<|end|>',
  additionalStopSequences: ['<|endoftext|>', '<|', '</|'],
};

export const modelDefaults = {
  maxTokens: 8192,
  maxPredict: 15,
  maxTries: 60,
  temperature: 0.7,
  minP: 0.05,
  topP: 0.9,
  topK: 40,
  promptFormat: promptFormatDefaults,
  withCredentials: true,
};

export type UIModel = Model & { premium: boolean };

/*
 * Default Models Configuration
 */
export const defaultModels: UIModel[] = [
  // // Developer
  // {
  //   name: 'Local',
  //   ...modelDefaults,
  //   apiUrl:
  //     'http://localhost:5000/completion',
  //   promptFormat: promptFormatDefaults,
  //   premium: false,
  //   withCredentials: false
  // },

  // Function call model
  {
    name: 'Nous Hermes 2 Pro (Llama 3 8B, fast)',
    ...modelDefaults,
    apiUrl:
      'https://curated.aleph.cloud/vm/84df52ac4466d121ef3bb409bb14f315de7be4ce600e8948d71df6485aa5bcc3/completion',
    promptFormat: promptFormatDefaults,
    premium: false,
  },

  // Roleplay model
  {
    name: 'Roleplay (7B, fast)',
    ...modelDefaults,
    // Set our apiUrl
    apiUrl:
      'https://curated.aleph.cloud/vm/a8b6d895cfe757d4bc5db9ba30675b5031fe3189a99a14f13d5210c473220caf/completion',
    // Allow a larger prompt length
    maxTokens: 32768,
    // Set a minimum probability
    minP: 0.1,
    // Set a slightly higher top probability
    topP: 0.95,
    // Set a slightly higher temperature
    temperature: 0.8,
    // Set custom chatML settings
    promptFormat: promptFormatDefaults,
    premium: false,
  },

  // Mixtral
  {
    name: 'Mixtral (8x7B MOE, smart)',
    ...modelDefaults,
    apiUrl:
      'https://curated.aleph.cloud/vm/cb6a4ae6bf93599b646aa54d4639152d6ea73eedc709ca547697c56608101fc7/completion',
    promptFormat: promptFormatDefaults,
    premium: false,
  },

  // Phi-3-mini
  {
    name: 'Phi-3-mini (3.8B, long context)',
    ...modelDefaults,
    apiUrl:
      'https://curated.aleph.cloud/vm/ad482633bac1f1fae071fb3908c49ebe8d30e3dbeb047051a8ee1b206f2ef830/completion',
    promptFormat: promptFormatPhi,
    maxTokens: 131072,
    premium: false,
  },

  // Nous Hermes 2
  {
    name: 'Nous Hermes 2 (34B, smart)',
    ...modelDefaults,
    apiUrl:
      'https://curated.aleph.cloud/vm/16a9f0f870c251719a0c63554cf02b6b8e4c2b4fee9987ddc3341a6507aef68d/completion',
    promptFormat: promptFormatDefaults,
    premium: false,
  },

  // Llama 3 Instruct (70B, genius, slow)
  {
    name: 'Llama 3 Instruct (70B, genius, slow)',
    ...modelDefaults,
    // Set our apiUrl
    apiUrl:
      'https://curated.aleph.cloud/vm/055e1267fb63f5961e8aee890cfc3f61387deee79f37ce51a44b21feee57d40b/completion',
    // Allow a larger prompt length
    maxTokens: 16384,
    // Set a minimum probability
    minP: 0.1,
    // Set a slightly higher top probability
    topP: 0.95,
    // Set a slightly higher temperature
    temperature: 0.8,
    // Set custom chatML settings
    promptFormat: {
      userPrepend: '<|start_header_id|>',
      userAppend: '<|end_header_id|>',
      logStart: '',
      lineSeparator: '\n',
      stopSequence: '<|eot_id|>',
      additionalStopSequences: ['<|eot_id|>', '<|endoftext|>', '<|'],
    },
    premium: true,
  },

  // DeepSeek Coder V2 (6.7B, developer)
  {
    name: 'DeepSeek Coder V2 (6.7B, developer)',
    ...modelDefaults,
    apiUrl:
      'https://curated.aleph.cloud/vm/b950fef19b109ef3770c89eb08a03b54016556c171b9a32475c085554b594c94/completion',
    // Allow a larger prompt length
    maxTokens: 16384,
    promptFormat: promptFormatDefaults,
    premium: false,
  },
];
