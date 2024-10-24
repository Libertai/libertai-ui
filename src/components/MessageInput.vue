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
          icon="img:icons/attachment.svg"
          round
          @click="($refs.messageAttachmentsUpload as any).click()"
        >
          <q-tooltip>Add attachments</q-tooltip>
        </q-btn>
      </template>
      <template #append>
        <!--<q-btn round dense flat icon="img:icons/mic.svg" @click="sendMessage" color="" class="" />-->
        <q-btn dense flat round @click="sendMessage">
          <ltai-icon dark-color="purple-700" light-color="purple-700" name="svguse:icons.svg#send" />
        </q-btn>
      </template>

      <template v-if="hint !== ''" #hint>
        {{ hint }}
      </template>
    </q-input>
    <!-- Hidden attachments upload -->
    <input
      ref="messageAttachmentsUpload"
      :accept="supportedInputFiles"
      hidden
      multiple
      type="file"
      @change="processMessageAttachments"
    />
  </div>
</template>

<script lang="ts" setup>
import LtaiIcon from 'components/libertai/LtaiIcon.vue';
import { useQuasar } from 'quasar';
import { MessageAttachment, SendMessageParams } from 'src/types/chats';
import { processAttachment } from 'src/utils/knowledge/attachments';
import { supportedInputFiles } from 'src/utils/knowledge/parsing';
import { PropType, ref, watch } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
  additionalAttachment: {
    type: Object as PropType<File>,
    default: undefined,
  },
});

watch(
  () => props.additionalAttachment,
  async (additionalAttachmentFile: File | undefined) => {
    if (!additionalAttachmentFile) {
      return;
    }
    const attachmentData = await processAttachmentFile(additionalAttachmentFile);
    if (!attachmentData) {
      return;
    }
    attachments.value = attachments.value.concat([attachmentData]);
  },
  { immediate: true },
);

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
      const attachment = await processAttachmentFile(file);
      if (!attachment) {
        return;
      }
      attachmentsData.push(attachment);
    }),
  );
  attachments.value = attachments.value.concat(attachmentsData);
};

const processAttachmentFile = async (file: File): Promise<MessageAttachment | undefined> => {
  try {
    return await processAttachment(file);
  } catch (error) {
    $q.notify({
      message: (error as Error)?.message ?? 'File processing failed, please try again',
      color: 'negative',
    });
  }
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
