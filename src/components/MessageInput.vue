<template>
  <q-input
    outlined
    v-model="model"
    placeholder="Write your message here"
    autofocus
    bg-color="secondary"
    label-color="grey"
    input-class="text-light"
    :class="` ${$q.screen.gt.sm ? 'q-pa-lg' : 'q-pa-sm'}`"
    ref="input"
    type="textarea"
    autogrow
    input-style="max-height: 10em;"
    @keydown.enter="sendMessage"
    :loading="isLoading"
    :bottom-slots="props.hint !== ''"
  >
    <template v-slot:prepend>
      <!--<q-btn round dense flat icon="img:icons/svg/attachment.svg" @click="sendMessage" color="white" />-->
    </template>
    <template v-slot:append>
      <!--<q-btn round dense flat icon="img:icons/mic.svg" @click="sendMessage" color="" class="" />-->
      <q-btn round dense flat icon="img:icons/send.svg" @click="sendMessage" color="" class="" />
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
  console.log(model.value);

  if (!model.value.trim()) return;
  let content = model.value;
  emit('sendMessage', content);
};
</script>
