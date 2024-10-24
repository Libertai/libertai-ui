<template>
  <ltai-dialog
    :title="title"
    @save="
      emit('savePersona', {
        ...basePersona,
        name,
        role,
        description,
        avatar: toRaw(avatar),
        knowledgeBases: toRaw(selectedKnowledgeBases),
      })
    "
  >
    <q-card-section horizontal>
      <q-card-section class="tw-my-auto">
        <aleph-avatar :ipfs-hash="avatar.ipfs_hash" @edit-avatar="(newAvatar) => (avatar = newAvatar)" />
      </q-card-section>
      <q-card-section>
        <span>Persona name</span>
        <q-input v-model="name" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
      </q-card-section>
    </q-card-section>

    <q-card-section>
      <span>Persona role</span>
      <q-input v-model="role" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
    </q-card-section>
    <q-card-section>
      <span>Persona Description</span>
      <q-input v-model="description" autogrow bg-color="secondary" input-class="text-light" outlined type="textarea" />
    </q-card-section>
    <q-card-section>
      <span>Knowledge bases</span>
      <knowledge-bases-selector v-model="selectedKnowledgeBases" />
    </q-card-section>
  </ltai-dialog>
</template>

<script lang="ts" setup>
import AlephAvatar from 'components/AlephAvatar.vue';
import LtaiDialog from 'components/libertai/LtaiDialog.vue';
import KnowledgeBasesSelector from 'components/select/KnowledgeBasesSelector.vue';
import { BasePersonaEdition, defaultBasePersona } from 'src/types/personas';
import { PropType, ref, toRaw, watch } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Customize persona',
  },
  basePersona: {
    type: Object as PropType<BasePersonaEdition>,
    required: false,
    default: defaultBasePersona,
  },
});
const emit = defineEmits<{ savePersona: [value: BasePersonaEdition] }>();

// Form values
const name = ref(props.basePersona.name);
const role = ref(props.basePersona.role);
const description = ref(props.basePersona.description);
const avatar = ref(props.basePersona.avatar);
const selectedKnowledgeBases = ref<string[]>([]);

watch(
  () => props.basePersona.name,
  () => (name.value = props.basePersona.name),
);
watch(
  () => props.basePersona.role,
  () => (role.value = props.basePersona.role),
);
watch(
  () => props.basePersona.description,
  () => (description.value = props.basePersona.description),
);
watch(
  () => props.basePersona.avatar,
  () => (avatar.value = props.basePersona.avatar),
);
watch(
  () => props.basePersona.knowledgeBases,
  () => (selectedKnowledgeBases.value = JSON.parse(JSON.stringify(props.basePersona.knowledgeBases))),
);
</script>
