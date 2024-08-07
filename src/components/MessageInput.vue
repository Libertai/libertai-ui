<template>
  <div>
    <q-item-label v-if="attachments.length > 0" class="max-sm:tw-px-2 sm:tw-px-6">
      <q-chip
        v-for="attachment in attachments"
        :key="attachment.id"
        class="tw-mr-1 bg-primary text-white"
        removable
        @remove="removeAttachment(attachment.id)"
      >
        {{ attachment.title }}
      </q-chip>
    </q-item-label>
    <q-input
      v-model="message"
      :bottom-slots="props.hint !== ''"
      :loading="isLoading"
      autofocus
      autogrow
      bg-color="secondary"
      class="max-sm:tw-p-2 sm:tw-p-6"
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
        >
          <q-tooltip>Add attachments</q-tooltip>
        </q-btn>
      </template>
      <template #append>
        <!--<q-btn round dense flat icon="img:icons/mic.svg" @click="sendMessage" color="" class="" />-->
        <q-btn dense flat icon="img:icons/send.svg" round @click="sendMessage" />
      </template>

      <template v-if="hint !== ''" #hint>
        {{ hint }}
      </template>
    </q-input>
    <!-- Hidden attachments upload -->
    <input
      ref="messageAttachmentsUpload"
      accept=".txt,.md,.pdf"
      hidden
      multiple
      type="file"
      @change="processMessageAttachments"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { processFile } from 'src/utils/attachments';
import { MessageAttachment, SendMessageParams } from 'src/types/chats';
import { useQuasar } from 'quasar';

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

const $q = useQuasar();

const emit = defineEmits<{ sendMessage: [value: SendMessageParams] }>();

// Values
const message = ref('');
const attachments = ref<MessageAttachment[]>([]);

const processMessageAttachments = async (event: any) => {
  const target = event.target as HTMLInputElement;
  const attachmentsData: MessageAttachment[] = [];

  await Promise.all(
    Array.from(target.files as FileList).map(async (file) => {
      try {
        const fileData = await processFile(file);
        attachmentsData.push(fileData);
      } catch (error) {
        $q.notify({
          message: (error as Error)?.message ?? 'File processing failed, please try again',
          color: 'negative',
        });
      }
    }),
  );
  attachments.value = attachments.value.concat(attachmentsData);
};

const removeAttachment = (attachmentId: string) => {
  attachments.value = attachments.value.filter((a) => a.id !== attachmentId);
};

const sendMessage = (event: Event | KeyboardEvent) => {
  if ((event as KeyboardEvent).shiftKey) {
    return;
  }
  event.preventDefault();

  const content = message.value;
  const attachmentsData = JSON.parse(JSON.stringify(attachments.value));

  if (content.trim() === '' || content.length === 0) {
    return;
  }

  emit('sendMessage', { content, attachments: attachmentsData });

  // Wipe the values
  message.value = '';
  attachments.value = [];
};
</script>
