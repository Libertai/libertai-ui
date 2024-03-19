<template>
  <q-layout view="hHh lpR fff" container style="height: 100vh">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="row justify-between items-center q-px-lg">
        <q-btn flat round dense @click="$router.push('/')" icon="home" />
        <q-toolbar-title>Knowledge Database</q-toolbar-title>
        <q-btn flat round dense icon="add" @click="openForm" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="row justify-center q-pa-md">
        <div class="col-lg-8 col-sm-12">

          <!-- KnowledgeDB Table -->
          <q-table title="Documents" :rows="documents" :columns="columns" row-key="id" selection="single"
            v-model:selected="selectedDocument" @row-click="onRowClick" />

          <!-- Add/Edit Document Form -->
          <q-dialog v-model="showForm" position="bottom">
            <!--<q-card>
              <q-card-section class="text-h6">{{ formTitle }}</q-card-section>
              <q-card-section>
                <q-form @submit.prevent="onSubmit" ref="addEditDocumentForm">
                  <q-input v-model="editedDocument.title" label="Title"
                    :rules="[val => val && val.length > 0 || 'Please enter a title']" />

                  <q-input v-model="editedDocument.description" type="textarea" label="Description" />

                  <q-file accept=".pdf,.docx,.txt" @update:modelValue="onFileChange" />
                </q-form>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Cancel" color="primary" v-close-popup />
                <q-btn :disable="submitting" type="submit" color="primary" :label="formTitle" @click.stop
                  @click="onSubmit" />
              </q-card-actions>
            </q-card>-->
            <DBUploader label="Auto Uploader" auto-upload url="http://localhost:4444/upload" multiple />

          </q-dialog>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useKnowledgeDBStore } from '../stores/knowledgeDB.js';

const knowledgeDBStore = useKnowledgeDBStore();

// Columns for the table displaying documents
const columns = [
  { name: 'title', label: 'Title', field: 'title' },
  { name: 'description', label: 'Description', field: 'description' },
];

// Documents data source
const documents = computed(() => knowledgeDBStore.documents);

// Selected document
const selectedDocument = ref(null);

// Show form for adding or editing a document
const showForm = ref(false);

// Submitting status for the form
const submitting = ref(false);

// Edited document object
const editedDocument = ref({ title: '', description: '' });

// Form title based on whether we're adding or editing a document
const formTitle = computed(() => selectedDocument.value ? 'Edit Document' : 'Add Document');

// On row click event handler for the table
function onRowClick(evt, row) {
  selectedDocument.value = row;
}

// Open the add/edit document form
function openForm() {
  showForm.value = true;
}

// Submit the add/edit document form
async function onSubmit() {
  console.log("blah")
  submitting.value = true;
  try {
    if (selectedDocument.value) {
      await knowledgeDBStore.updateDocument(selectedDocument.value, editedDocument.value);
    } else {
      await knowledgeDBStore.addDocument(editedDocument.value);
    }
    showForm.value = false;
  } catch (error) {
    console.error('Error adding or updating document:', error);
  } finally {
    submitting.value = false;
  }
}

// Handle file changes for the document file input field
function onFileChange(files) {
  editedDocument.value.file = files[0];
}
</script>