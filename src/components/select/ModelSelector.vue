<template>
  <q-btn-dropdown
    :label="selectedModel.name"
    class="text-semibold icon-md border-primary-highlight"
    color="primary"
    dropdown-icon="img:icons/svg/chevron-down_lighten.svg"
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
            <img v-if="model.premium" alt="premium" src="../../assets/star.svg" width="16" />
            <q-tooltip v-if="model.premium && accountStore.ltaiBalance < 100"
              >Premium model ({{ tokenGatingMessage }})
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
