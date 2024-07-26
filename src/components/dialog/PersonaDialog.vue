<template>
  <q-dialog class="q-pa-lg text-light" label="Customize" style="flex-grow: 1">
    <q-card class="q-pa-md">
      <q-card-actions :class="`flex flex-left text-semibold ${$q.dark.mode ? '' : 'text-purple700'}`">
        {{ title }}
        <q-space />
        <q-btn
          v-close-popup
          :icon="`img:icons/svg/close${$q.dark.mode ? '_lighten' : ''}.svg`"
          flat
          size="sm"
          unelevated
        />
      </q-card-actions>

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
        <q-input
          v-model="description"
          autogrow
          bg-color="secondary"
          input-class="text-light"
          outlined
          type="textarea"
        />
      </q-card-section>
      <q-card-section class="text-primary" horizontal>
        <q-btn v-close-popup class="q-px-xl tw-py-1" label="Close" rounded />
        <q-space />
        <q-btn
          v-close-popup
          class="bg-primary q-px-xl tw-py-1"
          label="Confirm"
          rounded
          text-color="white"
          @click="emit('savePersona', { ...basePersona, name, role, description, avatar: toRaw(avatar) })"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { PropType, ref, toRaw, watch } from 'vue';
import AlephAvatar from 'components/AlephAvatar.vue';
import { BasePersonaEdition, defaultBasePersona } from 'src/types/personas';

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
</script>
