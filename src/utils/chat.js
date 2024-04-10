import { LlamaCppApiEngine } from "@libertai/libertai-js";

import { modelDefaults, promptFormatDefaults } from "./models";

export const defaultChatTopic = "New Chat";

const chatTopicPromptFormat = {
  ...promptFormatDefaults,
  additionalStopSequences: promptFormatDefaults.additionalStopSequences.concat([
    "\n",
  ]),
};

const chatTopicModel = {
  ...modelDefaults,
  apiUrl:
    "https://curated.aleph.cloud/vm/a8b6d895cfe757d4bc5db9ba30675b5031fe3189a99a14f13d5210c473220caf/completion",
  promptFormat: chatTopicPromptFormat,
};

const chatTopicPersona = {
  avatarUrl: "https://this-is-a-fake-url.org",
  name: "summary",
  description:
    "You are a summary function provided with input. Provide an at most 5 word summary of the first sentence of the provided input for the purpose of determining menu item names",
};

const chatTopicExamples = [
  {
    role: "input",
    content: "Hello, can you please write a short hello world code for me?",
  },
  {
    role: "summary",
    content: "Hello world",
  },
  {
    role: "input",
    content:
      "What is the color of Henry IV's white horse?\nI'm not really sure",
  },
  {
    role: "summary",
    content: "Henry IV's horse color",
  },
];

/**
 * Infer the topic of a chat message using a sample of a text
 *
 * @async
 * @param {string} input - The text to infer the topic from
 * @returns {string} - The inferred topic
 * @throws {Error} - If the topic could not be inferred
 */
export async function inferChatTopic(input) {
  const engine = new LlamaCppApiEngine();
  const message = {
    role: "input",
    content: input,
  };
  const messages = chatTopicExamples.concat(message);

  try {
    for await (const output of engine.generateAnswer(
      messages,
      chatTopicModel,
      chatTopicPersona,
    )) {
      // Try just returning the first output (since that's what we were doing before we split this out)
      return output.content.split(chatTopicPromptFormat.lineSeparator)[0];
    }
  } catch (error) {
    console.error("Error during completion:", error);
    throw Error("Could not infer chat topic: {error}");
  }
}
