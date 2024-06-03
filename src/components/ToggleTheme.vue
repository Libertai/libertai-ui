<template>
  <q-btn
    :icon="darkmode ? 'img:icons/svg/light_mode.svg' : 'img:icons/svg/dark_mode.svg'"
    class="q-pa-xs"
    flat
    @click="darkmode = !darkmode"
  />
</template>

<script>
import { useSettingsStore } from 'src/stores/settings';
import { defineComponent, ref, watch } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'ToggleTheme',
  setup() {
    const settings = useSettingsStore();
    const $q = useQuasar();
    console.log('settings', settings.darkmode);
    const darkmode = ref(settings.darkmode);
    $q.dark.set(settings.darkmode);
    console.log('Dark mode', $q.dark.isActive); // true, false

    watch(
      () => darkmode.value,
      async (value) => {
        console.log('update storage');
        //$q.dark.set(darkmode.value);
        $q.dark.set(value);
        settings.darkmode = value;
      },
    );
    return {
      darkmode,
    };
  },
});
</script>
