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
      <empty-state
        v-else-if="agentStore.agents.length === 0"
        description="Contact a team member to get access to the private beta"
        image-alt="No agents"
        image-link="/assets/empty-states/knowledge-base.png"
        title="No agents"
      />
      <div v-else class="tw-mt-5 tw-space-y-4">
        <div v-for="agent of agentStore.agents" :key="agent.id">
          <p>Agent {{ agent.id }}</p>
          <a v-if="agent.vm_hash" :href="`https://aleph.sh/vm/${agent.vm_hash}`"
            >https://aleph.sh/vm/{{ agent.vm_hash }}</a
          >
          <p v-else>Not yet deployed</p>
          <p>Last update: {{ dayjs.unix(agent.last_update) }}</p>
          <p v-if="agent.secret">Secret: {{ agent.secret }}</p>
          <q-btn no-caps rounded @click="agentStore.getAgentSecret(agent.id)">Get secret</q-btn>
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
import { useAgentStore } from 'stores/agent';

const agentStore = useAgentStore();
</script>
