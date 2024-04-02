const defaults = {
  maxLength: 15,
  maxTries: 60,
  maxTokens: 8192,
  temperature: 0.7,
  sampler_order: [6, 0, 1, 3, 4, 2, 5],
  min_p: 0.05
  top_p: 0.9,
  top_k: 40,
  model_type: "knowledge",
  log_start: "",
  base_prompt: "Discussion is between {{user}} and {{char}}.\n",
  persona_start: "",
  scenario_start: "",
  user_prepend: "### ",
  user_append: ": ",
  stop_sequences: ["###"],
  line_separator: "",
  engine: "kobold",
  pass_credentials: true,
};


const chatml = {
  base_prompt:
    "<|im_start|>system\nYou are {{char}}, discussing with {{user}}.\n",
  log_start: "",
  user_prepend: "<|im_start|>",
  user_append: "\n",
  line_separator: "<|im_end|>\n",
  stop_sequences: ["<|im_end|>", "<|endoftext|>", "<|"],
};

export default [
  {
    ...defaults,
    ...chatml,
    maxLength: 15,
    maxTokens: 16384,
    min_p: 0.1,
    top_p: 0.95,
    temperature: 0.8,
    name: "AlphaMonarch (7B, fast)",
    apiUrl:
      "https://curated.aleph.cloud/vm/a8b6d895cfe757d4bc5db9ba30675b5031fe3189a99a14f13d5210c473220caf/completion",
    engine: "llamacpp",
    pass_credentials: true,
    stop_sequences: ["<|im_end|>","<|endoftext|>", "<|", "</|", "<im_end|>","</assistant","</user"]
  },
  {
    ...defaults,
    ...chatml,
    name: "Mixtral (8x7B MOE, smart)",
    apiUrl:
      "https://curated.aleph.cloud/vm/cb6a4ae6bf93599b646aa54d4639152d6ea73eedc709ca547697c56608101fc7/completion",
    maxLength: 15,
    maxTries: 60,
    maxTokens: 8192,
    engine: "llamacpp",
    pass_credentials: true,
    stop_sequences: [
      "<|im_end|>",
      "<|endoftext|>",
      "<|",
      "<im_end|>",
      "</assistant",
      "</user",
    ],
  },
  {
    ...defaults,
    ...chatml,
    name: "Nous Hermes 2 (34B, smartest)",
    apiUrl:
      "https://curated.aleph.cloud/vm/16a9f0f870c251719a0c63554cf02b6b8e4c2b4fee9987ddc3341a6507aef68d/completion",
    maxLength: 15,
    maxTries: 60,
    maxTokens: 8192,
    engine: "llamacpp",
    pass_credentials: true,
    // stop_sequences: ["<|im_end|>","<|endoftext|>", "<|", "<im_end|>","</assistant","</user"],
  },
  {
    ...defaults,
    ...chatml,
    name: "Llama Big FT (70B, genius, slow)",
    apiUrl:
      "https://curated.aleph.cloud/vm/055e1267fb63f5961e8aee890cfc3f61387deee79f37ce51a44b21feee57d40b/completion",
    maxLength: 15,
    maxTries: 60,
    maxTokens: 16384,
    engine: "llamacpp",
    pass_credentials: true,
    stop_sequences: [
      "<|im_end|>",
      "<|endoftext|>",
      "<|",
      "<im_end|>",
      "</assistant",
      "</user",
    ],
  },
  {
    ...defaults,
    name: "DeepSeek Coder (6.7B, developer)",
    apiUrl:
      "https://curated.aleph.cloud/vm/b950fef19b109ef3770c89eb08a03b54016556c171b9a32475c085554b594c94/completion",
    maxLength: 15,
    maxTries: 60,
    maxTokens: 16384,
    engine: "llamacpp",
    base_prompt:
      "Discussion is between {{user}} and {{char}}.\n{{char}} is a very good developer and will try to provide code examples whenever possible.\n",
    persona_start: "",
    pass_credentials: true,
    user_append: ": \n",
  },
];