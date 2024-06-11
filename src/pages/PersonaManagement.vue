<template>
  <section class="q-ml-xl">
    <h4 class="text-h4 text-semibold">Persona Management</h4>
    <p>Click on a persona to edit</p>

    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 xl:tw-grid-cols-3 tw-gap-y-4 tw-gap-x-4">
      <q-card
        v-for="persona of personas"
        :key="persona.id"
        class="persona-card tw-shadow-none tw-bg-white tw-rounded-2xl tw-justify-center tw-text-center"
      >
        <q-avatar class="tw-w-24 tw-h-24 tw-mx-auto">
          <img :src="persona.avatarUrl" alt="avatar" />
        </q-avatar>
        <q-card-section class="text-bold">{{ persona.name }}</q-card-section>
      </q-card>
    </div>
  </section>
</template>

<script setup>
import { usePersonasStore } from 'stores/personas-store';

const personas = usePersonasStore().personas;
</script>

<style scoped>
.persona-card {
  border: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
