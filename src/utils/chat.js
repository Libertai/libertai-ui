import { findMatches } from "../utils/knowledge";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const chat_openers_prompt =
  "Summarization of chat first sentence for menu items:\n\n" +
  '### Input: """Hello, can you please write a short hello world code for me?"""\n### Summary:\nHello world\n\n' +
  '### Input: """What is the color of Henry IV\'s white horse?\nI\'m not really sure"""\n### Summary:\nHenry IV\'s horse color\n\n';

export function calculateNumberOfTokens(line) {
  return line.length / 2.7;
}

async function preparePrompt(messages, activePrompt, model) {
  let chatLog = "";
  let currentTokens = 0;
  let persona_name = activePrompt.users[1].username;
  let user_name = activePrompt.users[0].username;
  let context_document = activePrompt.context_document;

  let basePrompt = `${model.base_prompt}${model.persona_start}${activePrompt.persona}`;
  basePrompt = basePrompt.replaceAll("{{user}}", user_name);
  basePrompt = basePrompt.replaceAll("{{char}}", persona_name);
  basePrompt = basePrompt.replaceAll("{{model}}", model.name);

  if (context_document) {
    basePrompt = `${basePrompt}\n${model.line_separator}\n${model.log_start}${model.user_prepend}CONTEXT DOCUMENT${model.user_append}${context_document}\n`;
  } else {
    basePrompt = `${basePrompt}\n${model.log_start}`;
  }

  const promptcalc = `${basePrompt}\n${model.log_start}\n${model.user_prepend}${persona_name}${model.user_append}`;
  const initialPromptTokens = calculateNumberOfTokens(promptcalc);
  const maxTokens = model.maxTokens - initialPromptTokens;

  const chatLogLines = messages.map((msg) => {
    let name = msg.username;
    if (name == activePrompt.users[0].username) {
      name = user_name;
    } else if (name == activePrompt.users[1].username) {
      name = persona_name;
    }
    return `${model.user_prepend}${name}${model.user_append}${msg.content}`;
  });
  const seenInfo = new Set();
  for (let i = chatLogLines.length - 1; i >= 0; i--) {
    const line = chatLogLines[i];
    const lineTokens = calculateNumberOfTokens(line);

    // Check for matching knowledge DB entries and add to chat log if not seen before
    const matchedEntries = findMatches(line);
    let infoTokens = 0;
    let infoText = "";
    for (const entry of matchedEntries) {
      if (!seenInfo.has(entry)) {
        const formattedEntry = `### INFO: ${entry}`;
        infoTokens += calculateNumberOfTokens(formattedEntry);
        infoText += `${formattedEntry}\n`;
        seenInfo.add(entry);
      }
    }

    // If adding the line won't exceed the token limit, add it to the chat log.
    if (currentTokens + lineTokens + infoTokens <= maxTokens) {
      chatLog = `${model.line_separator}${line}\n${chatLog}`;
      currentTokens += lineTokens;

      if (infoText) {
        console.log("adding infotext", infoText);
        chatLog = `${infoText}${chatLog}`;
        currentTokens += infoTokens;
      }
    } else {
      // If adding the line would exceed the token limit, stop the loop.
      break;
    }
  }
  console.log(basePrompt, model.log_start, model);
  return `${basePrompt}\n${chatLog}${model.line_separator}${model.user_prepend}${persona_name}${model.user_append}`;
}

export async function complete(prompt, model, stop_sequences, handle_cache) {
  // Actually do the completion, calling the engine API
  let params = {
    prompt: prompt,
    temperature: model.temperature,
    top_p: model.top_p,
    top_k: model.top_k,
    min_p: model.min_p
  };
  console.log(model.engine);
  if (model.engine == "kobold") {
    params = {
      ...params,
      n: 1,
      max_context_length: model.maxTokens,
      max_length: model.maxLength,
      rep_pen: 1.08,
      top_a: 0,
      typical: 1,
      tfs: 1,
      rep_pen_range: 1024,
      rep_pen_slope: 0.7,
      sampler_order: model.sampler_order,
      quiet: true,
      stop_sequence: stop_sequences,
      use_default_badwordsids: false,
    };
  } else if (model.engine == "llamacpp") {
    let slot_id = -1;
    if (handle_cache && model.slot_id !== undefined) {
      slot_id = model.slot_id;
    }
    params = {
      ...params,
      n_predict: model.maxLength,
      id_slot: slot_id,
      slot_id: slot_id,
      cache_prompt: handle_cache,
      typical_p: 1,
      tfs_z: 1,
      stop: stop_sequences,
      use_default_badwordsids: false,
    };
  } else if (model.engine == "openai") {
    params = {
      ...params,
      n: 1,
      stop: stop_sequences,
      max_tokens: model.maxLength,
    };
  }
  const response = await axios.post(model.apiUrl, params, {
    withCredentials: model.pass_credentials,
  });

  // Parse the response
  if (model.engine == "kobold") {
    console.log(response.data);
    return response.data.results[0].text;
  } else if (model.engine == "llamacpp") {
    if (handle_cache) {
      if (response.data.id_slot !== undefined) {
        model.slot_id = response.data.id_slot;
      } else if (response.data.slot_id !== undefined) {
        model.slot_id = response.data.slot_id;
      }
    }
    model.slot_id = response.data.id_slot;
    return response.data.content;
  } else if (model.engine == "openai") {
    return response.data.choices[0].text;
  }
}

export async function* generateAnswer(messages, activePrompt, model) {
  console.log(activePrompt, model);
  let user_name = activePrompt.users[0].username;
  let persona_name = activePrompt.users[1].username;
  const prompt = await preparePrompt(messages, activePrompt, model);
  console.log(prompt);

  let isUnfinished = true;
  let tries = 0;
  let compoundedResult = "";
  let stop_sequences = [...model.stop_sequences];
  if (stop_sequences.length == 0) {
    stop_sequences = [`${model.user_prepend}${user_name}:`];
  }
  let alternative_stop_sequence = `${model.user_prepend}${persona_name}:`;
  stop_sequences.push(alternative_stop_sequence);

  let alternative_stop_sequence_2 = `${user_name}:`;
  stop_sequences.push(alternative_stop_sequence_2);
  while (isUnfinished && tries < model.maxTries) {
    tries += 1;
    const lastResult = await complete(
      prompt + compoundedResult,
      model,
      stop_sequences,
      true,
    );
    const fullResult = compoundedResult + lastResult;
    let results = fullResult;
    console.log(results);
    /// let's refactor this by iterating on stop sequences
    /// results = fullResult.split(`\n${alternative_stop_sequence}`).join("|||||").split(`\n${alternative_stop_sequence_2}`).join("|||||").split(`\n${stop_sequences[0]}`).join("|||||").split("|||||");
    for (let i = 0; i < stop_sequences.length; i++) {
      results = results.split(`\n${stop_sequences[i]}`).join("|||||");
      results = results.split(`${stop_sequences[i]}`).join("|||||");
    }
    results = results.split("|||||");

    const firstMessage = results[0].trimEnd();
    compoundedResult = firstMessage;
    let to_yield = compoundedResult;

    if ((results.length > 1) | (lastResult < model.maxLength)) {
      isUnfinished = false;
    } else {
      isUnfinished = true;
      if (tries < model.maxTries) {
        to_yield += " *[writing ...]*";
      }
    }
    yield { content: to_yield, unfinished: isUnfinished };
  }
}

export function createMessage(senderId, username, content) {
  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  });
  const timeString = currentDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return {
    _id: uuidv4(),
    senderId: senderId,
    username: username,
    content: content,
    date: dateString,
    timestamp: timeString,
    unfinished: false,
    in_error: false,
  };
}

export async function getChatName(prompt, model) {
  const summary_prompt =
    chat_openers_prompt + `### Input: """${prompt}"""\n` + "### Summary:\n";

  const result = (
    await complete(summary_prompt, model, ["\n", "<|endoftext|>"], false)
  )
    .replace("#", "")
    .trim();

  return result;
}
