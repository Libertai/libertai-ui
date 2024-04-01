<template>
  <div class="markdown-component" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import DOMPurify from "dompurify";

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
});

const marked = new Marked(
  {
    gfm: true,
    breaks: true,
  },
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
);

const renderedContent = ref("");

function updateContent(content) {
  // content = DOMPurify.sanitize(content);
  renderedContent.value = DOMPurify.sanitize(marked.parse(content));
}

updateContent(props.content);

// we should watch for changes on the content
watch(
  () => props.content,
  (newContent) => {
    updateContent(newContent);
  },
);
</script>
