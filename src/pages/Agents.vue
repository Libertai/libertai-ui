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

      <empty-state
        description="Contact a team member to get access to the private beta"
        image-alt="No agents"
        image-link="/assets/empty-states/knowledge-base.png"
        title="No agents"
      />
    </section>
  </authenticated-page>
</template>

<script lang="ts" setup>
import EmptyState from 'components/EmptyState.vue';
import LtaiIcon from 'components/libertai/LtaiIcon.vue';
import AuthenticatedPage from 'layouts/AuthenticatedPage.vue';
</script>
