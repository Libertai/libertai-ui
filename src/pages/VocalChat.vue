<template>
  <!-- It's a page with chat entries, by the user or by the AI assistant.
    We are using Quasard q-chat-message compoents -->
  <q-page class="flex flex-center">
    <div>
      hey there
      <div class="q-pa-md col justify-center">
        <q-chat-message
          v-for="entry in entries"
          :key="entry.id"
          :sent="entry.sent"
          :name="entry.name"
          :text="[entry.text]"
          :avatar="entry.avatar"
          :text-color="entry.isFinal ? 'black' : 'grey-8'"
        />
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { defineComponent, ref, onMounted, nextTick } from "vue";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: "libertai",
  dangerouslyAllowBrowser: true,
  baseURL: "http://46.255.204.205:5110/v1/", // For OpenHermes-2.5
});

// Initialize the entries array
const entries = ref([]);

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// let's define some functions
// to tell a message aloud
async function speak(message) {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "fr-FR";
  recognition.abort();

  await new Promise(function (resolve) {
    utterance.onend = resolve;
    speechSynthesis.speak(utterance);
  });
  recognition.start();
}

// now to call the ai, using openai chat api
async function ask(question) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: question }],
    model: "openhermes-2.5",
    max_tokens: 128,
  });
  console.log(chatCompletion);
  // We add the answer to the entries array
  const answer = chatCompletion.choices[0].message.content;
  entries.value.push({
    id: entries.value.length,
    sent: false,
    name: "AI",
    text: answer,
    isFinal: true,
    avatar: "https://cdn.quasar.dev/img/avatar.png",
  });
  await nextTick();
  speak(answer);
}

onMounted(() => {
  // We start the speech recognition
  var speech = true;
  recognition.interimResults = true;
  recognition.lang = "fr-FR";
  var last_entry = null;
  recognition.addEventListener("result", (e) => {
    console.log(e.results);
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript)
      .join("");
    console.log(transcript);

    // We add the transcript to the entries array, only if we weren't working on it yet (final arg)
    if (last_entry == null) {
      last_entry = entries.value.length;

      entries.value.push({
        id: last_entry,
        sent: true,
        name: "You",
        text: transcript,
        isFinal: e.results[0].isFinal,
        avatar: "https://cdn.quasar.dev/img/avatar.png",
      });
      // last_entry = transcript;
    } else {
      entries.value[last_entry].text = transcript;
      entries.value[last_entry].isFinal = e.results[0].isFinal;
    }
    if (e.results[0].isFinal) {
      last_entry = null;
      ask(transcript);
    }
  });
  console.log(speech);
  if (speech == true) {
    recognition.start();
    recognition.addEventListener("end", recognition.start);
  }
});
</script>
