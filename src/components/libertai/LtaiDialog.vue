<template>
  <q-dialog class="q-pa-lg text-light tw-flex-grow">
    <q-card class="q-pa-md">
      <q-card-actions :class="`flex flex-left text-semibold ${$q.dark.mode ? '' : 'text-purple-700'}`">
        {{ title }}
        <q-space />
        <q-btn
          v-close-popup
          :icon="`img:icons/svg/close${$q.dark.mode ? '_lighten' : ''}.svg`"
          flat
          size="sm"
          unelevated
        />
      </q-card-actions>

      <slot />

      <q-card-section class="text-primary tw-mt-4" horizontal>
        <q-btn v-close-popup class="q-px-xl tw-py-1" label="Close" rounded />
        <q-space />
        <q-btn
          v-close-popup
          class="bg-primary q-px-xl tw-py-1"
          label="Confirm"
          rounded
          text-color="white"
          @click="emit('save')"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script lang="ts" setup>
const { title } = defineProps<{ title: string }>();

const emit = defineEmits<{ save: [] }>();
</script>
