<template>
  <q-dialog class="q-pa-lg text-light" label="Customize" style="flex-grow: 1">
    <q-card class="q-pa-md">
      <q-card-actions :class="`flex flex-left text-semibold ${$q.dark.mode ? '' : 'text-purple700'}`">
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
          <q-avatar @click="$refs.userAvatarUpload.click()">
            <input
              ref="userAvatarUpload"
              accept="image/*"
              hidden
              type="file"
              @change="
                async (event) => {
                  const file = event.target.files[0];
                  if (!file) {
                    return;
                  }
                  if (accountStore.alephStorage === null) {
                    $q.notify({
                      message: 'Connect your wallet to upload an avatar',
                      color: 'red',
                    });
                    return;
                  }
                  const uploadedFileMessage = await accountStore.alephStorage.uploadFile(file);
                  console.log(uploadedFileMessage);
                  avatar = {
                    item_hash: uploadedFileMessage.item_hash,
                    ipfs_hash: uploadedFileMessage.content.item_hash,
                  };
                }
              "
            />

            <img :src="getPersonaAvatarUrl(avatar.ipfs_hash)" alt="avatar" />
          </q-avatar>
        </q-card-section>
        <q-card-section>
          <span>Your name</span>
          <q-input v-model="username" bg-color="secondary" input-class="text-light q-px-sm" outlined></q-input>
        </q-card-section>
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
          @click="
            () => {
              settingsStore.update({ username, avatar: toRaw(avatar) });
            }
          "
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useSettingsStore } from 'stores/settings';
import { ref, toRef, watch } from 'vue';
import { useAccountStore } from 'stores/account';
import { getPersonaAvatarUrl } from 'src/utils/personas';

const settingsStore = useSettingsStore();
const accountStore = useAccountStore();

// Form values
const username = ref(settingsStore.username);
const avatar = ref(settingsStore.avatar);

// Update the inputs when the store changes (might be updated by Aleph settings fetching)
watch(toRef(settingsStore, 'username'), () => {
  username.value = settingsStore.username;
});
watch(toRef(settingsStore, 'avatar'), () => {
  avatar.value = settingsStore.avatar;
});
</script>
