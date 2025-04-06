<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Analytics Dashboard</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Retrospective Overview</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-card variant="outlined">
                  <v-card-text class="text-center">
                    <div class="text-h4">{{ totalRetros }}</div>
                    <div class="text-body-2">Total Retrospectives</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card variant="outlined">
                  <v-card-text class="text-center">
                    <div class="text-h4">{{ activeRetros }}</div>
                    <div class="text-body-2">Active Retrospectives</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Team Participation</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="member in teamStore.currentTeam?.members"
                :key="member.id"
              >
                <template v-slot:prepend>
                  <v-avatar color="primary">
                    {{ member.name.charAt(0) }}
                  </v-avatar>
                </template>
                <v-list-item-title>{{ member.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ member.participationCount || 0 }} participations
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Recent Retrospectives</v-card-title>
          <v-card-text>
            <v-table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Participants</th>
                  <th>Action Items</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="retro in recentRetros" :key="retro.id">
                  <td>{{ retro.title }}</td>
                  <td>{{ formatDate(retro.createdAt) }}</td>
                  <td>
                    <v-chip
                      :color="retro.status === 'active' ? 'success' : 'default'"
                      size="small"
                    >
                      {{ retro.status }}
                    </v-chip>
                  </td>
                  <td>{{ retro.participants?.length || 0 }}</td>
                  <td>{{ retro.actionItems?.length || 0 }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRetroStore } from '@/stores/retroStore'
import { useTeamStore } from '@/stores/teamStore'
import { format } from 'date-fns'

const retroStore = useRetroStore()
const teamStore = useTeamStore()

const totalRetros = ref(0)
const activeRetros = ref(0)
const recentRetros = ref([])

onMounted(async () => {
  if (teamStore.currentTeam?.id) {
    await loadAnalytics()
  }
})

const loadAnalytics = async () => {
  try {
    const retros = await retroStore.getTeamRetrospectives(teamStore.currentTeam?.id)
    totalRetros.value = retros.length
    activeRetros.value = retros.filter(r => r.status === 'active').length
    recentRetros.value = retros
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  } catch (error) {
    console.error('Failed to load analytics:', error)
  }
}

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM d, yyyy')
}
</script> 