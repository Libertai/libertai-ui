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

      <!--      <q-card-section>-->
      <!--        <span>Your name</span>-->
      <!--        <q-input v-model="username" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>-->
      <!--      </q-card-section>-->
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
        <q-btn v-close-popup class="q-px-xl q-py-xs" label="Close" rounded />
        <q-space />
        <q-btn
          v-close-popup
          class="bg-primary q-px-xl q-py-xs"
          label="Confirm"
          rounded
          text-color="white"
          @click="emit('savePersona', { ...basePersona, name, description, avatar: toRaw(avatar) })"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { PropType, ref, toRaw, watch } from 'vue';
import AlephAvatar from 'components/AlephAvatar.vue';
import { UIPersona } from 'src/utils/personas';

export type BasePersonaDialogProp = Partial<Pick<UIPersona, 'name' | 'description' | 'avatar'>>;

const props = defineProps({
  title: {
    type: String,
    default: 'Customize persona',
  },
  basePersona: {
    type: Object as PropType<BasePersonaDialogProp>,
    required: false,
    default: undefined,
  },
});
const emit = defineEmits(['savePersona']);

// Form values
// const username = ref(settingsStore.username);
const name = ref(props.basePersona?.name ?? '');
const description = ref(props.basePersona?.description ?? '');
const avatar = ref(
  props.basePersona?.avatar ?? {
    item_hash: '90db3237796d27118e0b9e21dae10a4b1179878f869cb6c0058d0d7c00b0440d',
    ipfs_hash: 'QmQMBfgnmuxcQ4kptR1oPE9guYxG13GpASjYVeFQSxNxjE',
  },
);

// Update the name input when the store changes  (might be updated by Aleph settings fetching)
// watch(toRef(settingsStore, 'username'), () => {
//   username.value = settingsStore.username;
// });

watch(
  () => props.basePersona?.name,
  () => (name.value = props.basePersona?.name ?? ''),
);
watch(
  () => props.basePersona?.description,
  () => (description.value = props.basePersona?.description ?? ''),
);
watch(
  () => props.basePersona?.avatar,
  () =>
    (avatar.value = props.basePersona?.avatar ?? {
      item_hash: '90db3237796d27118e0b9e21dae10a4b1179878f869cb6c0058d0d7c00b0440d',
      ipfs_hash: 'QmQMBfgnmuxcQ4kptR1oPE9guYxG13GpASjYVeFQSxNxjE',
    }),
);
</script>
