<template>
  <div>
    <q-item-label v-if="attachments.length > 0">
      <q-chip v-for="attachment in attachments" :key="attachment.id" class="q-mr-xs bg-primary text-white">
        {{ attachment.title }}
      </q-chip>
    </q-item-label>
    <q-input
      v-model="message"
      :bottom-slots="props.hint !== ''"
      :class="`${$q.screen.gt.sm ? 'q-pa-lg' : 'q-pa-sm'}`"
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
      <template #prepend>
        <q-btn
          color="white"
          dense
          flat
          icon="img:icons/svg/attachment.svg"
          round
          @click="($refs.messageAttachmentsUpload as any).click()"
        />
      </template>
      <template #append>
        <!--<q-btn round dense flat icon="img:icons/mic.svg" @click="sendMessage" color="" class="" />-->
        <q-btn dense flat icon="img:icons/send.svg" round @click="sendMessage" />
      </template>

      <template #hint>
        {{ hint }}
      </template>
    </q-input>
    <!-- Hidden attachments upload -->
    <input ref="messageAttachmentsUpload" accept=".txt" hidden type="file" @change="processMessageAttachments" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { processFile } from 'src/utils/file';
import { MessageAttachment, SendMessageParams } from 'src/types/chats';

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

const emit = defineEmits<{ sendMessage: [value: SendMessageParams] }>();

// Values
const message = ref('');
const attachments = ref<MessageAttachment[]>([]);

const processMessageAttachments = async (event: any) => {
  const target = event.target as HTMLInputElement;
  const attachmentsData: MessageAttachment[] = [];

  await Promise.all(
    Array.from(target.files as FileList).map(async (file) => {
      // TODO: handle processing error
      const fileData = await processFile(file);
      attachmentsData.push(fileData);
    }),
  );
  attachments.value = attachmentsData;
};

const sendMessage = (event: any) => {
  if (event.shiftKey) {
    return;
  }
  event.preventDefault();

  const content = message.value;

  if (content.trim() === '' || content.length === 0) {
    return;
  }

  emit('sendMessage', { content, attachments: attachments.value });

  // Wipe the values
  message.value = '';
  attachments.value = [];
};
</script>
