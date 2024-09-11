<template>
  <div class="avatar-wrapper" @click="($refs.userAvatarUpload as any).click()">
    <q-avatar>
      <input
        ref="userAvatarUpload"
        accept="image/*"
        hidden
        type="file"
        @change="
          async (event) => {
            const target = event.target as HTMLInputElement;
            const file = (target.files as FileList)[0];
            if (!file) {
              return;
            }
            if (accountStore.alephStorage === null) {
              $q.notify({
                message: 'Connect your wallet to upload an avatar',
                color: 'negative',
              });
              return;
            }
            const uploadedFileMessage = await accountStore.alephStorage.uploadFile(file);
            emit('editAvatar', {
              item_hash: uploadedFileMessage.item_hash,
              ipfs_hash: uploadedFileMessage.content.item_hash,
            });
          }
        "
      />

      <img :src="getPersonaAvatarUrl(ipfsHash)" alt="avatar" />
    </q-avatar>
  </div>
</template>

<script lang="ts" setup>
import { getPersonaAvatarUrl } from 'src/utils/personas';
import { useAccountStore } from 'stores/account';

const accountStore = useAccountStore();

const { ipfsHash } = defineProps({
  ipfsHash: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['editAvatar']);
</script>

<style lang="postcss" scoped>
.avatar-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.avatar-wrapper:hover:after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  background: url('/icons/edit.svg') center no-repeat;
  background-size: 25px;
}

.avatar-wrapper:hover img {
  opacity: 0.4;
}
</style>
