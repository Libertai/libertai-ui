<template>
  <section class="max-sm:tw-mx-4 md:tw-mx-10 tw-my-5">
    <h4 class="text-h4 text-semibold tw-mb-5">Knowledge base</h4>
    <p>Manage your knowledge bases</p>
    <div class="tw-mt-4 tw-mb-8 tw-flex md:tw-justify-end">
      <q-btn class="border-primary-highlight" no-caps rounded unelevated @click="createKnowledgeDialog = true">
        <ltai-icon left name="svguse:icons.svg#add" />
        <span>Create knowledge base</span>
      </q-btn>
      <knowledge-base-creation-dialog v-model="createKnowledgeDialog" @create="createKnowledgeBase" />
    </div>

    <div class="tw-space-y-4">
      <RouterLink
        v-for="knowledgeBase of knowledgeStore.knowledgeBases"
        :key="knowledgeBase.id"
        :to="`/knowledge-base/${knowledgeBase.id}`"
        class="tw-block"
      >
        <div class="tw-flex tw-border tw-items-center tw-rounded-lg tw-p-4">
          <ltai-icon class="tw-h-5 tw-w-5 tw-mr-4" name="svguse:icons.svg#folder" />
          <p class="tw-font-bold tw-text-base">{{ knowledgeBase.name }}</p>
          <div class="tw-ml-auto tw-flex tw-gap-4">
            <p>{{ knowledgeBase.documents.length }} File{{ knowledgeBase.documents.length !== 1 ? 's' : '' }}</p>
            <p class="max-sm:tw-hidden">Last updated: {{ dayjs(knowledgeBase.lastUpdatedAt).format('LL') }}</p>
            <ltai-icon class="tw-w-5 tw-h-5" name="svguse:icons.svg#chevron-right" />
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import KnowledgeBaseCreationDialog from 'components/dialog/KnowledgeBaseCreationDialog.vue';
import { useKnowledgeStore } from 'stores/knowledge';
import LtaiIcon from 'components/libertai/LtaiIcon.vue';
import dayjs from 'dayjs';

const knowledgeStore = useKnowledgeStore();

const createKnowledgeDialog = ref(false);

const createKnowledgeBase = (name: string) => {
  knowledgeStore.createKnowledgeBase(name);
};
</script>
