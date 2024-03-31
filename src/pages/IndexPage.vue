<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    />
    <button v-on:click="counter.counter++">
      Count is: {{ counter.counter }}
    </button>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useCounterStore } from '../stores/example-store';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const counter = useCounterStore();
    // const count = ref(0)
    return { counter };
  },
});
</script>
