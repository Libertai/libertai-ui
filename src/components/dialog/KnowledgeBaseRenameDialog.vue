<template>
  <ltai-dialog title="Rename knowledge base" @save="emit('save', newName)">
    <q-card-section horizontal>
      <q-card-section>
        <span>Name</span>
        <q-input v-model="newName" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
      </q-card-section>
    </q-card-section>
  </ltai-dialog>
</template>
<script lang="ts" setup>
import LtaiDialog from 'components/libertai/LtaiDialog.vue';
import { ref, watch } from 'vue';

const props = defineProps<{ name: string }>();

const emit = defineEmits<{ save: [name: string] }>();

// Form values
const newName = ref('');

watch(
  () => props.name,
  () => (newName.value = props.name),
  { immediate: true },
);
</script>
