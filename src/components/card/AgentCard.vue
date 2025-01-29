<template>
  <q-card
    :class="[$q.dark.isActive ? ' tw-border-white/40' : ' tw-border-black/10']"
    class="tw-w-fit tw-shadow-none tw-rounded-2xl tw-border"
  >
    <q-card-section>
      <img alt="Agent" class="tw-mx-auto tw-w-44 tw-h-44" src="/assets/agent.png" />
    </q-card-section>
    <q-card-section class="tw-font-bold tw-text-lg tw-py-0 tw-text-center">Agent</q-card-section>
    <q-card-section class="tw-space-y-2">
      <q-input v-model="agentIdRef" borderless class="tw-min-w-[22.5rem]" label="Public ID" outlined readonly>
        <template #append>
          <q-icon class="tw-cursor-pointer" name="content_copy" @click="copyText(agent.id, 'Public ID')" />
        </template>
      </q-input>
      <q-input
        v-if="agent.secret"
        :model-value="agent.secret"
        borderless
        class="tw-min-w-[22.5rem]"
        label="Secret key"
        outlined
        readonly
      >
        <template #append>
          <q-icon class="tw-cursor-pointer" name="content_copy" @click="copyText(agent.secret, 'Secret key')" />
        </template>
      </q-input>

      <div class="tw-flex tw-justify-center">
        <q-btn
          v-if="!agent.secret"
          :loading="isLoadingSecret"
          class="border-primary-highlight"
          no-caps
          rounded
          text-color="dark-mode-text"
          unelevated
          @click="getAgentSecret"
        >
          Show secret key
        </q-btn>
      </div>

      <div v-if="agent.instance_ip" class="tw-flex tw-justify-center">
        <q-btn
          :href="`http://[${agent.instance_ip}]:8000/docs`"
          color="primary"
          label="View the instance"
          no-caps
          outline
          target="_blank"
          unelevated
        />
      </div>
      <p v-else>Not yet deployed</p>

      <p>Last updated {{ dayjs().to(dayjs.unix(agent.last_update)) }}</p>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';
import { copyToClipboard, useQuasar } from 'quasar';
import { UIAgent } from 'src/types/agent';
import { useAgentStore } from 'stores/agent';
import { ref } from 'vue';

const { agent } = defineProps<{ agent: UIAgent }>();

const agentIdRef = ref(agent.id);
const isLoadingSecret = ref(false);

const $q = useQuasar();
const agentStore = useAgentStore();

const getAgentSecret = async () => {
  isLoadingSecret.value = true;
  try {
    await agentStore.getAgentSecret(agent.id);
  } catch (error) {
    $q.notify({
      message: (error as Error)?.message ?? 'Unable to get the agent secret',
      color: 'negative',
    });
  } finally {
    isLoadingSecret.value = false;
  }
};

const copyText = async (content: string, name: string) => {
  await copyToClipboard(content);
  $q.notify({
    message: `${name} copied to clipboard`,
    color: 'positive',
  });
};
</script>
