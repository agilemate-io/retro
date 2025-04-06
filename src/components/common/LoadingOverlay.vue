<template>
  <v-overlay
    :model-value="loading"
    class="align-center justify-center"
  >
    <v-progress-circular
      size="64"
      color="primary"
      indeterminate
    />
  </v-overlay>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
}>()
</script> 