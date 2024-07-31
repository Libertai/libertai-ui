<template>
  <q-dialog class="q-pa-lg text-light" label="Customize" style="flex-grow: 1">
    <q-card class="q-pa-md">
      <q-card-actions :class="`flex flex-left text-semibold ${$q.dark.mode ? '' : 'text-purple-700'}`">
        User settings
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
          <span>Your name</span>
          <q-input v-model="username" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
        </q-card-section>
      </q-card-section>

      <q-card-section horizontal>
        <q-toggle v-model="darkmode" checked-icon="dark_mode" label="Dark mode" unchecked-icon="lightbulb" />
      </q-card-section>

      <q-card-section horizontal>
        <q-toggle
          v-model="isSignatureHashStored"
          checked-icon="check"
          color="green"
          label="Save the signature hash in your browser (unsafe)"
          unchecked-icon="clear"
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
          @click="updateSettings"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useSettingsStore } from 'stores/settings';
import { ref, toRef, watch } from 'vue';
import AlephAvatar from 'components/AlephAvatar.vue';

const settingsStore = useSettingsStore();

// Form values
const username = ref(settingsStore.username);
const avatar = ref(settingsStore.avatar);
const darkmode = ref(settingsStore.darkmode);
const isSignatureHashStored = ref(settingsStore.isSignatureHashStored);

// Update the inputs when the store changes (might be updated by Aleph settings fetching)
watch(toRef(settingsStore, 'username'), () => {
  username.value = settingsStore.username;
});
watch(toRef(settingsStore, 'avatar'), () => {
  avatar.value = settingsStore.avatar;
});
watch(toRef(settingsStore, 'darkmode'), () => {
  darkmode.value = settingsStore.darkmode;
});
watch(toRef(settingsStore, 'isSignatureHashStored'), () => {
  isSignatureHashStored.value = settingsStore.isSignatureHashStored;
});

const updateSettings = () => {
  settingsStore.update({
    username: username.value,
    avatar: avatar.value,
    darkmode: darkmode.value,
    isSignatureHashStored: isSignatureHashStored.value,
  });
};
</script>
