<template>
  <section v-if="knowledgeBaseRef" class="max-sm:tw-mx-4 md:tw-mx-10 tw-space-y-4 tw-my-5">
    <q-btn
      :icon="`img:icons/svg/arrow-left${$q.dark.mode ? '_lighten' : ''}.svg`"
      class="tw-w-10 tw-h-10"
      to="/knowledge-base"
      unelevated
    />
    <div>
      <h4 class="text-h4 text-semibold">{{ knowledgeBaseRef.name }}</h4>
      <div class="tw-mt-4 tw-flex md:tw-justify-end">
        <q-btn
          class="border-primary-highlight"
          icon="img:icons/svg/add.svg"
          label="Upload document"
          no-caps
          rounded
          unelevated
          @click="($refs.documentUpload as any).click()"
        />
        <!-- Hidden document upload -->
        <input ref="documentUpload" accept=".txt,.md,.pdf" hidden multiple type="file" @change="uploadDocuments" />
      </div>
    </div>

    <div class="tw-space-y-4">
      <div
        v-for="document of knowledgeBaseRef.documents"
        :key="document.id"
        class="tw-flex tw-border tw-items-center tw-rounded-lg tw-p-4"
      >
        <q-icon
          :color="$q.dark.mode ? 'primary-dark' : 'purple-700'"
          class="tw-h-5 tw-w-5 tw-mr-4"
          name="img:icons/svg/attachment.svg"
        />

        <p class="tw-font-bold tw-text-base">{{ document.name }}</p>
        <div class="tw-ml-auto tw-flex tw-items-center tw-gap-4">
          <p>{{ filesize(document.size, { round: 0 }) }}</p>
          <q-btn class="tw-w-10 tw-h-10" disable icon="img:icons/svg/chat.svg" unelevated />

          <q-btn class="tw-w-10 tw-h-10" unelevated @click="downloadDocument(document)">
            <q-icon :color="$q.dark.mode ? 'primary-dark' : 'purple-700'" name="download" />
          </q-btn>

          <q-btn class="tw-w-10 tw-h-10" disable unelevated>
            <q-icon :color="$q.dark.mode ? 'primary-dark' : 'purple-700'" name="more_horiz" />
          </q-btn>
        </div>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { KnowledgeBase, KnowledgeDocument } from 'src/types/knowledge';
import { useKnowledgeStore } from 'stores/knowledge';
import { exportFile, useQuasar } from 'quasar';
import { useAccount } from '@wagmi/vue';
import { useAccountStore } from 'stores/account';
import { processDocument } from 'src/utils/knowledge/document';
import { filesize } from 'filesize';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const account = useAccount();

const accountStore = useAccountStore();
const knowledgeStore = useKnowledgeStore();

const knowledgeBaseRef = ref<KnowledgeBase | undefined>(undefined);

watch(
  () => route.params.id as string,
  async (newId: string) => {
    await loadKnowledgeBase(newId);
  },
  { immediate: true },
);

async function loadKnowledgeBase(id: string) {
  if (!account.isConnected.value) {
    $q.notify({ message: 'Account not connected', color: 'negative' });
    await router.push({ path: '/' });
    return;
  }

  if (!knowledgeStore.isLoaded) {
    // This page was loaded directly, auto connect allowed us to get the wallet,
    // but we didn't load KB yet, waiting for it
    setTimeout(() => {
      loadKnowledgeBase(id);
    }, 100);
    return;
  }

  const knowledgeBase = knowledgeStore.knowledgeBases.find((kb) => kb.id === id);

  if (!knowledgeBase) {
    $q.notify({ message: 'Knowledge base not found', color: 'negative' });
    await router.push({ path: '/knowledge-base' });
    return;
  }

  // Set the ref with a copy to avoid modifying the store value
  knowledgeBaseRef.value = JSON.parse(JSON.stringify(knowledgeBase));
}

const uploadDocuments = async (event: any) => {
  if (knowledgeBaseRef.value === undefined) {
    return;
  }
  if (accountStore.alephStorage === null) {
    $q.notify({
      message: 'Connect your wallet to upload a document',
      color: 'negative',
    });
    return;
  }

  const target = event.target as HTMLInputElement;
  const documents: KnowledgeDocument[] = [];

  await Promise.all(
    Array.from(target.files as FileList).map(async (file) => {
      try {
        const document = await processDocument(file);
        const uploadedFileMessage = await accountStore.alephStorage!.uploadFile(file);

        documents.push({ ...document, store_hash: uploadedFileMessage.content.item_hash });
      } catch (error) {
        $q.notify({
          message: (error as Error)?.message ?? 'Document processing failed, please try again',
          color: 'negative',
        });
      }
    }),
  );

  knowledgeBaseRef.value.documents = knowledgeBaseRef.value.documents.concat(documents);

  await knowledgeStore.updateKnowledgeBase(
    knowledgeBaseRef.value.id,
    JSON.parse(JSON.stringify(knowledgeBaseRef.value)),
  );
};

const downloadDocument = async (document: KnowledgeDocument) => {
  if (accountStore.alephStorage === null) {
    return;
  }

  const downloadedFile = await accountStore.alephStorage.downloadFile(document.store_hash);
  exportFile(document.name, downloadedFile);
};
</script>
