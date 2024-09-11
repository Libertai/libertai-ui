<template>
  <ltai-dialog title="Create knowledge base" @save="createKnowledgeBase">
    <q-card-section horizontal>
      <q-card-section>
        <span>Name</span>
        <q-input v-model="name" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
      </q-card-section>
    </q-card-section>
  </ltai-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import LtaiDialog from 'components/libertai/LtaiDialog.vue';

const emit = defineEmits<{ create: [name: string] }>();

// Form values
const name = ref('');

const createKnowledgeBase = () => {
  emit('create', name.value);
};
</script>
