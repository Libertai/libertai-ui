<template>
  <authenticated-page>
    <section class="max-sm:tw-mx-4 sm:tw-mx-10 tw-my-5">
      <div class="tw-flex tw-mb-5 tw-items-center tw-space-x-2">
        <h4 class="text-h4 text-semibold">Agents</h4>
        <a href="https://docs.libertai.io/chat/documents/knowledge-base.html" target="_blank">
          <ltai-icon name="help_outline" size="xs" />
        </a>
      </div>

      <p>Manage your agents</p>

      <q-linear-progress v-if="!agentStore.isLoaded" indeterminate />
      <div v-else-if="agentStore.agents.length === 0">
        <empty-state
          description="Contact the team if you wish to access the private beta"
          image-alt="No agents"
          image-link="/assets/empty-states/agents.png"
          title="No agents"
        />

        <div class="tw-mx-auto tw-w-fit tw-mt-2">
          <a href="https://t.me/libertai" target="_blank">
            <q-btn no-caps rounded>Telegram</q-btn>
          </a>
        </div>
      </div>

      <div v-else class="tw-mt-5 tw-space-y-4">
        <div v-for="agent of agentStore.agents" :key="agent.id">
          <p>Agent {{ agent.id }}</p>
          <a v-if="agent.vm_hash" :href="`https://aleph.sh/vm/${agent.vm_hash}`"
            >https://aleph.sh/vm/{{ agent.vm_hash }}</a
          >
          <p v-else>Not yet deployed</p>
          <p>Last update: {{ dayjs().to(dayjs.unix(agent.last_update)) }}</p>
          <p v-if="agent.secret">Secret: {{ agent.secret }}</p>
          <q-btn no-caps rounded @click="getAgentSecret(agent.id)">Get secret</q-btn>
        </div>
      </div>
    </section>
  </authenticated-page>
</template>

<script lang="ts" setup>
import EmptyState from 'components/EmptyState.vue';
import LtaiIcon from 'components/libertai/LtaiIcon.vue';
import dayjs from 'dayjs';
import AuthenticatedPage from 'layouts/AuthenticatedPage.vue';
import { useQuasar } from 'quasar';
import { useAgentStore } from 'stores/agent';

const $q = useQuasar();
const agentStore = useAgentStore();

const getAgentSecret = async (agentId: string) => {
  try {
    await agentStore.getAgentSecret(agentId);
  } catch (error) {
    $q.notify({
      message: (error as Error)?.message ?? 'Unable to get the agent secret',
      color: 'negative',
    });
  }
};
</script>
