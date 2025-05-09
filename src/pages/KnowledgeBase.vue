<template>
  <authenticated-page>
    <q-linear-progress v-if="!knowledgeStore.isLoaded" class="tw-mt-20" indeterminate />
    <section v-else-if="knowledgeBaseRef" class="max-sm:tw-mx-4 sm:tw-mx-10 tw-space-y-4 tw-my-5">
      <q-btn class="tw-w-10 tw-h-10" to="/knowledge-base" unelevated>
        <ltai-icon name="svguse:icons.svg#arrow-left" />
      </q-btn>
      <div>
        <div class="tw-flex tw-space-x-4">
          <h4 class="text-h4 text-semibold">{{ knowledgeBaseRef.name }}</h4>

          <q-btn-dropdown class="tw-p-1" dropdown-icon="more_horiz" unelevated>
            <q-list>
              <q-item v-close-popup clickable @click="showRenameKnowledgeBase = true">
                <q-item-section avatar>
                  <ltai-icon class="tw-mx-auto" name="svguse:icons.svg#pencil" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Rename</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-close-popup clickable @click="showDeleteKnowledgeBaseConfirmation = true">
                <q-item-section avatar>
                  <ltai-icon class="tw-mx-auto" name="svguse:icons.svg#delete" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Delete</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

        <div class="tw-mt-4 tw-flex md:tw-justify-end">
          <q-btn
            class="border-primary-highlight"
            no-caps
            rounded
            unelevated
            @click="($refs.documentUpload as any).click()"
          >
            <ltai-icon left name="svguse:icons.svg#add" />
            <span>Upload document</span>
          </q-btn>
          <!-- Hidden document upload -->
          <input
            ref="documentUpload"
            :accept="supportedInputFiles"
            hidden
            multiple
            type="file"
            @change="uploadDocuments"
          />
        </div>
      </div>

      <empty-state
        v-if="knowledgeBaseRef.documents.length === 0"
        description="Upload a document to get started"
        image-alt="No document"
        image-link="/assets/empty-states/knowledge-document.png"
        title="No documents uploaded"
      />

      <div class="tw-space-y-4">
        <div
          v-for="document of knowledgeBaseRef.documents"
          :key="document.id"
          class="tw-flex tw-border tw-items-center tw-rounded-lg tw-p-4"
        >
          <ltai-icon class="tw-h-5 tw-w-5 tw-mr-4" name="svguse:icons.svg#attachment" />

          <p class="tw-font-bold tw-text-base">{{ document.name }}</p>
          <div class="tw-ml-auto tw-flex tw-items-center tw-gap-4">
            <p class="max-sm:tw-hidden">{{ filesize(document.size, { round: 0 }) }}</p>
            <q-btn
              :disable="document.size > MAX_ATTACHMENT_SIZE"
              class="tw-w-10 tw-h-10"
              unelevated
              @click="chatWithDocument(document)"
            >
              <ltai-icon name="svguse:icons.svg#chat" />
              <q-tooltip v-if="document.size > MAX_ATTACHMENT_SIZE">
                Document is too big to be used as chat attachment
              </q-tooltip>
            </q-btn>

            <q-btn class="tw-w-10 tw-h-10" unelevated @click="downloadDocument(document)">
              <ltai-icon name="svguse:icons.svg#download" />
              <q-tooltip>Download</q-tooltip>
            </q-btn>

            <q-btn-dropdown class="tw-p-1" dropdown-icon="more_horiz" unelevated>
              <q-list>
                <q-item
                  v-close-popup
                  clickable
                  @click="
                    () => {
                      selectedDocument = document;
                      showRenameDocument = true;
                    }
                  "
                >
                  <q-item-section avatar>
                    <ltai-icon class="tw-mx-auto" name="svguse:icons.svg#pencil" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Rename</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  v-close-popup
                  clickable
                  @click="
                    () => {
                      selectedDocument = document;
                      showDeleteDocumentConfirmation = true;
                    }
                  "
                >
                  <q-item-section avatar>
                    <ltai-icon class="tw-mx-auto" name="svguse:icons.svg#delete" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Delete</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>

        <!-- Document dialogs-->
        <knowledge-base-rename-document-dialog
          v-model="showRenameDocument"
          :name="selectedDocument?.name ?? ''"
          @save="(newName: string) => renameDocument(selectedDocument!, newName)"
        />
        <ltai-dialog
          v-model="showDeleteDocumentConfirmation"
          title="Delete document"
          @save="deleteDocument(selectedDocument!)"
        >
          <q-card-section class="row">
            <span>Are you sure you want to delete the document {{ selectedDocument!.name }}?</span>
          </q-card-section>
        </ltai-dialog>

        <!-- Knowledge base dialogs -->
        <knowledge-base-rename-dialog
          v-model="showRenameKnowledgeBase"
          :name="knowledgeBaseRef.name"
          @save="(newName: string) => renameKnowledgeBase(newName)"
        />
        <ltai-dialog
          v-model="showDeleteKnowledgeBaseConfirmation"
          title="Delete knowledge base"
          @save="deleteKnowledgeBase"
        >
          <q-card-section class="row">
            <span>Are you sure you want to delete the knowledge base "{{ knowledgeBaseRef.name }}" ?</span>
          </q-card-section>
        </ltai-dialog>
      </div>
      <q-linear-progress v-if="uploadInProgress" indeterminate />
    </section>
  </authenticated-page>
</template>
<script lang="ts" setup>
import KnowledgeBaseRenameDialog from 'components/dialog/KnowledgeBaseRenameDialog.vue';
import KnowledgeBaseRenameDocumentDialog from 'components/dialog/KnowledgeBaseRenameDocumentDialog.vue';
import EmptyState from 'components/EmptyState.vue';
import LtaiDialog from 'components/libertai/LtaiDialog.vue';
import LtaiIcon from 'components/libertai/LtaiIcon.vue';
import { filesize } from 'filesize';
import AuthenticatedPage from 'layouts/AuthenticatedPage.vue';
import { exportFile, useQuasar } from 'quasar';
import { KnowledgeBase, KnowledgeBaseIdentifier, KnowledgeDocument } from 'src/types/knowledge';
import { decryptFile, encryptFile } from 'src/utils/encryption';
import { MAX_ATTACHMENT_SIZE } from 'src/utils/knowledge/attachments';
import { processDocument } from 'src/utils/knowledge/document';
import { supportedInputFiles } from 'src/utils/knowledge/parsing';
import { useAccountStore } from 'stores/account';
import { useKnowledgeStore } from 'stores/knowledge';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const accountStore = useAccountStore();
const knowledgeStore = useKnowledgeStore();

const knowledgeBaseRef = ref<KnowledgeBase | undefined>(undefined);
const knowledgeBaseIdentifierRef = ref<KnowledgeBaseIdentifier | undefined>(undefined);
const selectedDocument = ref<KnowledgeDocument | undefined>(undefined);
const showRenameKnowledgeBase = ref(false);
const showDeleteKnowledgeBaseConfirmation = ref(false);
const showRenameDocument = ref(false);
const showDeleteDocumentConfirmation = ref(false);
const uploadInProgress = ref(false);

watch(
  () => route.params.id as string,
  async (newId: string) => {
    await loadKnowledgeBase(newId);
  },
  { immediate: true },
);

async function loadKnowledgeBase(id: string) {
  if (!knowledgeStore.isLoaded) {
    // This page was loaded directly, auto connect allowed us to get the wallet,
    // but we didn't load KB yet, waiting for it
    setTimeout(() => {
      loadKnowledgeBase(id);
    }, 100);
    return;
  }

  const knowledgeBase = knowledgeStore.knowledgeBases.find((kb) => kb.id === id);
  const knowledgeBaseIdentifier = knowledgeStore.knowledgeBaseIdentifiers.find(
    (kbIdentifier) => kbIdentifier.id === id,
  );

  if (!knowledgeBase || !knowledgeBaseIdentifier) {
    $q.notify({ message: 'Knowledge base not found', color: 'negative' });
    await router.push({ path: '/knowledge-base' });
    return;
  }

  // Set the ref with a copy to avoid modifying the store value
  knowledgeBaseRef.value = JSON.parse(JSON.stringify(knowledgeBase));
  knowledgeBaseIdentifierRef.value = JSON.parse(JSON.stringify(knowledgeBaseIdentifier));
}

const uploadDocuments = async (event: any) => {
  if (knowledgeBaseRef.value === undefined || knowledgeBaseIdentifierRef.value === undefined) {
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

  const encryptionKey = Buffer.from(knowledgeBaseIdentifierRef.value.encryption.key);
  const encryptionIv = Buffer.from(knowledgeBaseIdentifierRef.value.encryption.iv);

  uploadInProgress.value = true;

  await Promise.all(
    Array.from(target.files as FileList).map(async (file) => {
      try {
        const document = await processDocument(file);
        const encryptedFile = await encryptFile(file, encryptionKey, encryptionIv);
        const uploadedFileMessage = await accountStore.alephStorage!.uploadFile(encryptedFile);

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
  uploadInProgress.value = false;

  knowledgeBaseRef.value.documents = knowledgeBaseRef.value.documents.concat(documents);

  await knowledgeStore.updateKnowledgeBase(
    JSON.parse(JSON.stringify(knowledgeBaseRef.value)),
    knowledgeBaseIdentifierRef.value,
  );
};

const downloadDocument = async (document: KnowledgeDocument) => {
  if (accountStore.alephStorage === null || knowledgeBaseIdentifierRef.value === undefined) {
    return;
  }

  const encryptionKey = Buffer.from(knowledgeBaseIdentifierRef.value.encryption.key);
  const encryptionIv = Buffer.from(knowledgeBaseIdentifierRef.value.encryption.iv);

  const downloadedFile = await accountStore.alephStorage.downloadFile(document.store.ipfs_hash);
  const decryptedFile = decryptFile(downloadedFile, encryptionKey, encryptionIv);
  exportFile(document.name, decryptedFile);
};

const renameDocument = async (document: KnowledgeDocument, newName: string) => {
  if (knowledgeBaseRef.value === undefined || knowledgeBaseIdentifierRef.value === undefined) {
    return;
  }

  try {
    knowledgeBaseRef.value.documents = knowledgeBaseRef.value.documents.map((d) => {
      if (d.id === document.id) {
        return { ...d, name: newName };
      }
      return d;
    });
    await knowledgeStore.updateKnowledgeBase(
      JSON.parse(JSON.stringify(knowledgeBaseRef.value)),
      knowledgeBaseIdentifierRef.value,
    );
  } catch (error) {
    $q.notify({
      message: (error as Error)?.message ?? 'Document rename failed, please try again',
      color: 'negative',
    });
  }
};

const deleteDocument = async (document: KnowledgeDocument) => {
  if (knowledgeBaseRef.value === undefined || knowledgeBaseIdentifierRef.value === undefined) {
    return;
  }

  try {
    await knowledgeStore.deleteKnowledgeDocument(document, knowledgeBaseRef.value, knowledgeBaseIdentifierRef.value);

    knowledgeBaseRef.value.documents = knowledgeBaseRef.value.documents.filter((d) => d.id !== document.id);
  } catch (error) {
    $q.notify({
      message: (error as Error)?.message ?? 'Document deletion failed, please try again',
      color: 'negative',
    });
  }
};

const renameKnowledgeBase = async (newName: string) => {
  if (
    knowledgeBaseRef.value === undefined ||
    knowledgeBaseIdentifierRef.value === undefined ||
    accountStore.alephStorage === null
  ) {
    return;
  }

  try {
    await knowledgeStore.updateKnowledgeBase(
      JSON.parse(JSON.stringify({ ...knowledgeBaseRef.value, name: newName })),
      knowledgeBaseIdentifierRef.value,
    );

    knowledgeBaseRef.value.name = newName;
  } catch (error) {
    $q.notify({
      message: (error as Error)?.message ?? 'Knowledge base renaming failed, please try again',
      color: 'negative',
    });
  }
};

const deleteKnowledgeBase = async () => {
  if (
    knowledgeBaseRef.value === undefined ||
    knowledgeBaseIdentifierRef.value === undefined ||
    accountStore.alephStorage === null
  ) {
    return;
  }

  const success = await knowledgeStore.deleteKnowledgeBase(knowledgeBaseRef.value, knowledgeBaseIdentifierRef.value);
  if (!success) {
    $q.notify({
      message: 'Knowledge base deletion failed, please try again',
      color: 'negative',
    });
    return;
  }

  await router.push({ path: '/knowledge-base' });
};

const chatWithDocument = async (document: KnowledgeDocument) => {
  if (knowledgeBaseIdentifierRef.value === undefined) {
    return;
  }

  await router.push({
    path: '/new',
    query: {
      knowledgeDocumentAttachment: `${knowledgeBaseIdentifierRef.value.id},${document.id}`,
    },
  });
};
</script>
