<template>
  <div class="markdown-message" v-html="renderedContent"></div>
</template>

<script lang="ts" setup>
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import { ref, watch } from 'vue';

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
    langPrefix: 'hljs language-',
    highlight(code, lang, _info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
);

const renderedContent = ref('');

async function updateContent(content: string) {
  renderedContent.value = DOMPurify.sanitize(await marked.parse(content));
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

<style scoped>
.markdown-message :deep(a) {
  text-decoration: revert;
}
</style>
