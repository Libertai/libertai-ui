<template>
  <section v-if="knowledgeBaseRef" class="max-sm:tw-mx-4 md:tw-mx-10 tw-space-y-4 tw-my-5">
    <q-btn class="tw-w-10 tw-h-10" to="/knowledge-base" unelevated>
      <ltai-icon name="svguse:icons.svg#arrow-left" />
    </q-btn>
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
        <ltai-icon class="tw-h-5 tw-w-5 tw-mr-4" name="svguse:icons.svg#attachment" />

        <p class="tw-font-bold tw-text-base">{{ document.name }}</p>
        <div class="tw-ml-auto tw-flex tw-items-center tw-gap-4">
          <p>{{ filesize(document.size, { round: 0 }) }}</p>
          <q-btn class="tw-w-10 tw-h-10" disable unelevated>
            <ltai-icon name="svguse:icons.svg#chat" />
          </q-btn>

          <q-btn class="tw-w-10 tw-h-10" unelevated @click="downloadDocument(document)">
            <ltai-icon name="svguse:icons.svg#download" />
          </q-btn>

          <q-btn-dropdown class="tw-p-1" dropdown-icon="more_horiz" unelevated>
            <q-list>
              <q-item v-close-popup clickable @click="deleteDocumentConfirmation = true">
                <q-item-section avatar>
                  <ltai-icon class="tw-mx-auto" name="svguse:icons.svg#delete" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Delete</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <ltai-dialog v-model="deleteDocumentConfirmation" title="Delete chat" @save="deleteDocument(document)">
            <q-card-section class="row">
              <span>Are you sure you want to delete the the document {{ document.name }}?</span>
            </q-card-section>
          </ltai-dialog>
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
import LtaiIcon from 'components/libertai/LtaiIcon.vue';
import LtaiDialog from 'components/libertai/LtaiDialog.vue';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const account = useAccount();

const accountStore = useAccountStore();
const knowledgeStore = useKnowledgeStore();

const knowledgeBaseRef = ref<KnowledgeBase | undefined>(undefined);
const deleteDocumentConfirmation = ref(false);

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

        documents.push({
          ...document,
          store: { item_hash: uploadedFileMessage.item_hash, ipfs_hash: uploadedFileMessage.content.item_hash },
        });
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

  const downloadedFile = await accountStore.alephStorage.downloadFile(document.store.ipfs_hash);
  exportFile(document.name, downloadedFile);
};

const deleteDocument = async (document: KnowledgeDocument) => {
  if (knowledgeBaseRef.value === undefined || accountStore.alephStorage === null) {
    return;
  }

  try {
    await accountStore.alephStorage.deleteFile(document.store.item_hash);

    knowledgeBaseRef.value.documents = knowledgeBaseRef.value.documents.filter((d) => d.id !== document.id);
    await knowledgeStore.updateKnowledgeBase(
      knowledgeBaseRef.value.id,
      JSON.parse(JSON.stringify(knowledgeBaseRef.value)),
    );
  } catch (error) {
    $q.notify({
      message: (error as Error)?.message ?? 'Document deletion failed, please try again',
      color: 'negative',
    });
  }
};
</script>
