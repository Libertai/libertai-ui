<template>
  <q-btn-dropdown
    :label="selectedModel.name"
    class="text-semibold icon-md border-primary-highlight"
    color="primary"
    dropdown-icon="img:icons/chevron-down_lighten.svg"
    no-caps
    rounded
    size="md"
    unelevated
  >
    <q-list>
      <q-item
        v-for="model in modelsStore.models"
        :key="model.name"
        v-close-popup
        :disable="model.premium && accountStore.ltaiBalance < 100"
        clickable
        @click="emit('selectModel', model)"
      >
        <q-item-section>
          <q-item-label class="tw-flex tw-space-x-1">
            <span>{{ model.name }}</span>
            <ltai-icon v-if="model.premium" name="svguse:icons.svg#star" size="xs" />
            <q-tooltip v-if="model.premium && accountStore.ltaiBalance < 100">
              Premium model ({{ tokenGatingMessage }})
            </q-tooltip>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script lang="ts" setup>
import { useModelsStore } from 'stores/models';
import { useAccountStore } from 'stores/account';
import { computed, PropType } from 'vue';
import { getTokenGatingMessage } from 'src/utils/messages';
import { UIModel } from 'src/utils/models';
import LtaiIcon from 'components/libertai/LtaiIcon.vue';

const modelsStore = useModelsStore();
const accountStore = useAccountStore();

const { selectedModel } = defineProps({
  selectedModel: {
    type: Object as PropType<UIModel>,
    required: true,
  },
});

const emit = defineEmits<{ selectModel: [value: UIModel] }>();

const tokenGatingMessage = computed(() => getTokenGatingMessage(accountStore.ltaiBalance, 100));
</script>
