<template>
  <q-icon :color="$q.dark.mode ? darkColor : lightColor" :name="name" :size="size" />
</template>

<script lang="ts" setup>
const { name, lightColor, darkColor } = defineProps({
  name: {
    type: String,
    required: true,
  },
  lightColor: {
    type: String,
    required: false,
    default: 'purple-700',
  },
  darkColor: {
    type: String,
    required: false,
    default: 'primary-dark',
  },
  size: {
    type: String,
    required: false,
    default: undefined,
  },
});
</script>
