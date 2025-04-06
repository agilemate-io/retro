<template>
  <v-snackbar
    v-for="notification in notifications"
    :key="notification.id"
    :value="true"
    :color="notification.type"
    :timeout="notification.timeout"
    location="top right"
    class="mt-4"
  >
    {{ notification.message }}
    
    <template #actions>
      <v-btn
        icon="mdi-close"
        variant="text"
        @click="removeNotification(notification.id)"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { useNotifications } from '@/composables/useNotifications'

const { notifications, removeNotification } = useNotifications()
</script> 