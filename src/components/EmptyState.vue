<template>
  <div class="tw-mx-auto tw-mt-10 tw-w-fit">
    <img :alt="imageAlt" :src="imageLink" />
    <p class="tw-text-lg text-purple-700 tw-w-fit tw-mx-auto">{{ title }}</p>
    <p class="text-primary tw-w-fit tw-mx-auto">{{ description }}</p>
  </div>
</template>

<script lang="ts" setup>
const { imageLink, imageAlt, title, description } = defineProps({
  imageLink: {
    type: String,
    required: true,
  },
  imageAlt: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});
</script>
