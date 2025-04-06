<template>
  <v-dialog v-model="dialog" max-width="600">
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" color="primary">
        Create Team
      </v-btn>
    </template>

    <v-card>
      <v-card-title>Create New Team</v-card-title>
      <v-card-text>
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="teamData.name"
            label="Team Name"
            :rules="[v => !!v || 'Team name is required']"
            required
          />
          <v-textarea
            v-model="teamData.description"
            label="Description"
            rows="3"
          />
          <v-select
            v-model="teamData.settings.defaultRetroTemplate"
            :items="retroTemplates"
            label="Default Retrospective Template"
            required
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey-darken-1" variant="text" @click="dialog = false">
          Cancel
        </v-btn>
        <v-btn color="primary" @click="handleSubmit" :loading="loading">
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useTeamStore } from '@/stores/teamStore'
import type { Team, TeamSettings } from '@/types/team'

const dialog = ref(false)
const loading = ref(false)
const form = ref()

const teamStore = useTeamStore()

const retroTemplates = [
  { title: 'Mad, Sad, Glad', value: 'mad-sad-glad' },
  { title: 'Start, Stop, Continue', value: 'start-stop-continue' },
  { title: 'Went Well, To Improve, Action Items', value: 'well-improve-action' }
]

const teamData = reactive<Partial<Team>>({
  name: '',
  description: '',
  settings: {
    defaultRetroTemplate: 'mad-sad-glad',
    defaultTimeBoxes: {
      feedback: 10,
      grouping: 5,
      voting: 5,
      actionItems: 10
    },
    maxVotesPerUser: 5,
    allowAnonymousFeedback: false,
    requireActionItems: true,
    integrations: {}
  } as TeamSettings
})

const handleSubmit = async () => {
  const { valid } = await form.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await teamStore.createTeam(teamData)
    dialog.value = false
  } catch (error) {
    console.error('Failed to create team:', error)
  } finally {
    loading.value = false
  }
}
</script> 