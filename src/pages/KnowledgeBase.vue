<template>
  <q-layout view="hHh lpR fff" container style="height: 100vh">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="row justify-between items-center q-px-lg">
        <q-btn flat round dense @click="$router.push('/')" icon="home" />
        <q-toolbar-title>Knowledge Database</q-toolbar-title>
        <q-btn flat round dense icon="add" @click="openForm" />
      </q-toolbar>
      <q-toolbar class="row justify-between items-center q-px-lg">
        <q-toolbar-title>Search</q-toolbar-title>
        <q-btn flat round dense icon="search" @click="searchDefault" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div class="row justify-center q-pa-md">
        <div class="col-lg-8 col-sm-12">
          <q-list>
            <q-item
              v-for="document in documents"
              :key="document.id"
              clickable
              @click="onRowClick($event, document)"
            >
              <q-item-section>
                <q-item-label>{{ document.title }}</q-item-label>
                <q-item-label caption>{{ document.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <!-- Placeholder query -->

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
            haha
            <DBUploader
              label="Auto Uploader"
              auto-upload
              url="http://localhost:4444/upload"
              multiple
            />
          </q-dialog>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from "vue";
import { useKnowledgeDBStore } from "src/stores/knowledge-db";

const knowledgeDb = useKnowledgeDBStore();

// Columns for the table displaying documents
const columns = [
  { name: "title", label: "Title", field: "title" },
  { name: "description", label: "Description", field: "description" },
];

// Documents data source
const documents = computed(() => knowledgeDb.documents());

// Selected document
const selectedDocument = ref(null);

// Show form for adding or editing a document
const showForm = ref(false);

// Submitting status for the form
const submitting = ref(false);

// Edited document object
const editedDocument = ref({ title: "", description: "" });

// Form title based on whether we're adding or editing a document
const formTitle = computed(() =>
  selectedDocument.value ? "Edit Document" : "Add Document",
);

// On row click event handler for the table
function onRowClick(evt, row) {
  selectedDocument.value = row;
}

// Open the add/edit document form
function openForm() {
  showForm.value = true;
}

// Test with a PDF of the communist manifesto
function searchDefault() {
  let query = "why is the sky blue?";
  console.log("Searching: ", query);
  knowledgeDb.searchDocuments(query).then((results) => {
    console.log("Results: ", results);
  });
}

// Submit the add/edit document form
async function onSubmit() {
  submitting.value = true;
  try {
    if (selectedDocument.value) {
      // await knowledgeDBStore.updateDocument(
      //   selectedDocument.value,
      //   editedDocument.value
      // );
      console.log("TODO: Implement update document");
    } else {
      // await knowledgeDBStore.addDocument(editedDocument.value);
      await knowledgeDb.addDocument(editedDocument.value);
    }
    showForm.value = false;
  } catch (error) {
    console.error("Error adding or updating document:", error);
  } finally {
    submitting.value = false;
  }
}

// Handle file changes for the document file input field
function onFileChange(files) {
  editedDocument.value.file = files[0];
}
</script>
