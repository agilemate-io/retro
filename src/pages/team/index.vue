<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Team Dashboard</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Team Members</v-card-title>
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
                <v-list-item-subtitle>{{ member.email }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip
                    :color="member.role === 'admin' ? 'primary' : 'secondary'"
                    size="small"
                  >
                    {{ member.role }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Team Settings</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="updateTeam">
              <v-text-field
                v-model="teamName"
                label="Team Name"
                required
                :error-messages="errors.name"
              />

              <v-textarea
                v-model="teamDescription"
                label="Description"
                rows="3"
                :error-messages="errors.description"
              />

              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
                block
                class="mt-4"
              >
                Update Team
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTeamStore } from '@/stores/teamStore'

const teamStore = useTeamStore()
const loading = ref(false)
const teamName = ref('')
const teamDescription = ref('')

const errors = ref({
  name: '',
  description: ''
})

onMounted(async () => {
  if (teamStore.currentTeam) {
    teamName.value = teamStore.currentTeam.name
    teamDescription.value = teamStore.currentTeam.description || ''
  }
})

const updateTeam = async () => {
  if (!teamStore.currentTeam?.id) return

  try {
    loading.value = true
    await teamStore.updateTeam(teamStore.currentTeam.id, {
      name: teamName.value,
      description: teamDescription.value
    })
  } catch (error) {
    console.error('Failed to update team:', error)
  } finally {
    loading.value = false
  }
}
</script> 