<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Past Retrospectives</h1>
      </v-col>
    </v-row>

    <v-alert
      v-if="!teamStore.currentTeam"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      Please select a team to view past retrospectives.
    </v-alert>

    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-card-title>Past Retrospectives</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="retrospectives"
              :loading="loading"
              :items-per-page="10"
              class="elevation-1"
            >
              <template v-slot:item.name="{ item }">
                <router-link :to="`/retrospective/${item.id}`">
                  {{ item.name }}
                </router-link>
              </template>

              <template v-slot:item.date="{ item }">
                {{ formatDate(item.date) }}
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                >
                  {{ item.status }}
                </v-chip>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  variant="text"
                  color="primary"
                  :to="`/retrospective/${item.id}`"
                >
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRetrospectiveStore } from '@/stores/retrospective'
import { useTeamStore } from '@/stores/team'
import { format } from 'date-fns'
import type { Retrospective } from '@/types/retrospective'

const retrospectiveStore = useRetrospectiveStore()
const teamStore = useTeamStore()

const loading = ref(false)
const retrospectives = ref<Retrospective[]>([])

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Date', key: 'date' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const loadRetrospectives = async () => {
  if (!teamStore.currentTeam?.id) return

  try {
    loading.value = true
    const data = await retrospectiveStore.getTeamRetrospectives(teamStore.currentTeam.id)
    retrospectives.value = data.filter(retro => retro.status === 'completed')
  } catch (error) {
    console.error('Failed to load retrospectives:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return format(new Date(date), 'PPP')
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in-progress':
      return 'warning'
    case 'scheduled':
      return 'info'
    default:
      return 'grey'
  }
}

onMounted(() => {
  loadRetrospectives()
})
</script> 