<template>
  <authenticated-page>
    <div class="tw-flex tw-items-center tw-justify-center tw-min-h-[inherit]">
      <q-card class="tw-m-auto tw-p-5">
        <q-card-actions :class="{ 'text-purple-700': !$q.dark.mode }" class="flex flex-left text-semibold">
          User settings
          <q-space />
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

        <q-card-section class="text-primary tw-mt-4 tw-justify-center" horizontal>
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
    </div>
  </authenticated-page>
</template>

<script lang="ts" setup>
import AlephAvatar from 'components/AlephAvatar.vue';
import AuthenticatedPage from 'layouts/AuthenticatedPage.vue';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import { ref, toRef, watch } from 'vue';

const settingsStore = useSettingsStore();
const $q = useQuasar();

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
  $q.notify({ message: 'Settings successfully updated', color: 'positive' });
};
</script>
