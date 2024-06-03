<template>
  <q-btn
    :icon="darkmode ? 'img:icons/svg/light_mode.svg' : 'img:icons/svg/dark_mode.svg'"
    class="q-pa-xs"
    flat
    @click="darkmode = !darkmode"
  />
</template>

<script setup>
import { useSettingsStore } from 'src/stores/settings';
import { ref, toRef, watch } from 'vue';
import { useQuasar } from 'quasar';

const settings = useSettingsStore();
const $q = useQuasar();
const darkmode = ref(settings.darkmode);
$q.dark.set(settings.darkmode);

// Update the theme when the store value changes (might be updated by Aleph settings fetching)
watch(toRef(settings, 'darkmode'), () => {
  $q.dark.set(settings.darkmode);
});

watch(
  () => darkmode.value,
  async (value) => {
    settings.update({ darkmode: value });
  },
);
</script>
