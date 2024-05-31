<template>
  <q-layout container style="height: 100vh" view="hHh lpR fff">
    <q-header class="bg-primary text-white" elevated>
      <q-toolbar class="row justify-between items-center q-px-lg">
        <q-btn dense flat icon="home" round @click="$router.push('/')" />
        <q-toolbar-title>Knowledge Database</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="row justify-center q-pa-md">
        <div class="col-lg-8 col-sm-12">
          <q-list>
            <q-item v-for="document in documents" :key="document.id" clickable @click="onRowClick(document)">
              <q-item-section>
                <q-item-label>{{ document.title }}</q-item-label>
              </q-item-section>
              <!-- If the document is selected, show the deletion icon -->
              <q-item-section v-if="selectedDocumentId === document.id" side>
                <q-btn-group dense flat>
                  <q-btn icon="delete" @click="removeSelectedDocument(document.id)" />
                  <q-tooltip>Remove Document</q-tooltip>
                </q-btn-group>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

import { useKnowledgeStore } from 'src/stores/knowledge-store';

const knowledgeStore = useKnowledgeStore();

// Columns for the table displaying documents
// const columns = [
//   { name: 'id', label: 'ID', field: 'id' },
//   { name: 'title', label: 'Title', field: 'title' },
// ];

// Documents data source
const { documents } = storeToRefs(knowledgeStore);

// Selected document
// const selectedDocument = ref(null);
const selectedDocumentId = ref(null);

// Edited document object
// const editedDocument = ref({ title: '', description: '' });

// Form title based on whether we're adding or editing a document
// const formTitle = computed(() => (selectedDocument.value ? 'Edit Document' : 'Add Document'));

// On row click event handler for the table
function onRowClick(row) {
  selectedDocumentId.value = row.id;
}

async function removeSelectedDocument() {
  if (selectedDocumentId.value) {
    await knowledgeStore.removeDocument(selectedDocumentId.value);
    selectedDocumentId.value = null;
  }
}
</script>
