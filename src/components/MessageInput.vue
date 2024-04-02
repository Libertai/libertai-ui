<template>
  <q-input
    rounded
    standout
    v-model="model"
    label="Write your message here"
    autofocus
    bg-color="secondary"
    label-color="grey"
    input-class="text-white"
    class="q-pa-lg"
    ref="input"
    type="textarea"
    autogrow
    input-style="max-height: 4.5em"
    @keydown.enter="sendMessage"
    :loading="isLoading"
    :bottom-slots="props.hint !== ''"
  >
    <template v-slot:append>
      <q-btn round dense flat icon="send" @click="sendMessage" color="white" />
    </template>

    <template v-slot:hint>
      {{ hint }}
    </template>
  </q-input>
</template>

<script setup>
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["sendMessage"]);
const model = defineModel();
const sendMessage = (event) => {
  if (event.shiftKey) {
    return;
  }
  event.preventDefault();
  console.log(model.value);

  if (!model.value.trim()) return;
  let content = model.value;
  emit("sendMessage", content);
};
// return {
//   model,
//   isLoading,
//   sendMessage
// }
</script>
