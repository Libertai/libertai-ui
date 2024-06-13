<template>
  <q-input
    ref="input"
    v-model="model"
    :bottom-slots="props.hint !== ''"
    :class="` ${$q.screen.gt.sm ? 'q-pa-lg' : 'q-pa-sm'}`"
    :loading="isLoading"
    autofocus
    autogrow
    bg-color="secondary"
    input-class="text-light"
    input-style="max-height: 10em;"
    label-color="grey"
    outlined
    placeholder="Write your message here"
    type="textarea"
    @keydown.enter="sendMessage"
  >
    <template v-slot:prepend>
      <!--<q-btn round dense flat icon="img:icons/svg/attachment.svg" @click="sendMessage" color="white" />-->
    </template>
    <template v-slot:append>
      <!--<q-btn round dense flat icon="img:icons/mic.svg" @click="sendMessage" color="" class="" />-->
      <q-btn dense flat icon="img:icons/send.svg" round @click="sendMessage" />
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
    default: '',
  },
});

const emit = defineEmits(['sendMessage']);
const model = defineModel();
const sendMessage = (event) => {
  if (event.shiftKey) {
    return;
  }
  event.preventDefault();

  if (!model.value.trim()) return;
  let content = model.value;
  emit('sendMessage', content);
};
</script>
