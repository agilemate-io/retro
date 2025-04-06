<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Create New Retrospective</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="title"
                label="Retrospective Title"
                required
                variant="solo-filled"
                :error-messages="errors.title"
              />

              <v-select
                v-model="template"
                :items="allTemplates"
                item-title="name"
                item-value="id"
                label="Template"
                required
                variant="solo-filled"
                :error-messages="errors.template"
              >
                <template v-slot:append>
                  <v-btn
                    icon
                    variant="text"
                    to="/retrospective/templates"
                    title="Manage Templates"
                  >
                    <v-icon>mdi-cog</v-icon>
                  </v-btn>
                </template>
              </v-select>

              <v-textarea
                v-model="description"
                label="Description"
                rows="3"
                variant="solo-filled"
                :error-messages="errors.description"
              />

              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="timeBox"
                    label="Time Box (minutes)"
                    type="number"
                    min="15"
                    variant="solo-filled"
                    :error-messages="errors.timeBox"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="maxVotes"
                    label="Max Votes Per User"
                    type="number"
                    min="1"
                    variant="solo-filled"
                    :error-messages="errors.maxVotes"
                  />
                </v-col>
              </v-row>

              <v-switch
                v-model="allowMultipleVotes"
                label="Allow Multiple Votes Per Item"
                color="primary"
              />

              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
                block
                class="mt-4"
              >
                Create Retrospective
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Template Preview</v-card-title>
          <v-card-text>
            <template v-if="selectedTemplate">
              <h3 class="text-h6 mb-2">{{ selectedTemplate.name }}</h3>
              <p class="text-body-2 mb-4">{{ selectedTemplate.description }}</p>
              
              <v-list>
                <v-list-item
                  v-for="column in selectedTemplate.columns"
                  :key="column.id"
                >
                  <template v-slot:prepend>
                    <v-icon :color="column.color">{{ column.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ column.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ column.description }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </template>
            <p v-else class="text-body-2 text-medium-emphasis">
              Select a template to see its details
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRetroStore } from '@/stores/retroStore'
import { useTeamStore } from '@/stores/teamStore'
import { useTemplateStore } from '@/stores/templateStore'
import type { Retrospective } from '@/types/retrospective'

const router = useRouter()
const retroStore = useRetroStore()
const teamStore = useTeamStore()
const templateStore = useTemplateStore()

const title = ref('')
const template = ref('')
const description = ref('')
const timeBox = ref(60)
const maxVotes = ref(3)
const allowMultipleVotes = ref(false)
const loading = ref(false)

const errors = ref({
  title: '',
  template: '',
  description: '',
  timeBox: '',
  maxVotes: ''
})

const allTemplates = computed(() => templateStore.allTemplates)
const selectedTemplate = computed(() => 
  allTemplates.value.find(t => t.id === template.value)
)

onMounted(async () => {
  if (teamStore.currentTeam?.id) {
    await templateStore.loadCustomTemplates(teamStore.currentTeam.id)
  }
})

const validateForm = () => {
  let isValid = true
  errors.value = {
    title: '',
    template: '',
    description: '',
    timeBox: '',
    maxVotes: ''
  }

  if (!title.value) {
    errors.value.title = 'Title is required'
    isValid = false
  }

  if (!template.value) {
    errors.value.template = 'Template is required'
    isValid = false
  }

  if (!timeBox.value || timeBox.value < 15) {
    errors.value.timeBox = 'Time box must be at least 15 minutes'
    isValid = false
  }

  if (!maxVotes.value || maxVotes.value < 1) {
    errors.value.maxVotes = 'Max votes must be at least 1'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    const newRetro: Partial<Retrospective> = {
      title: title.value,
      templateId: template.value,
      description: description.value,
      timeBox: timeBox.value,
      maxVotesPerUser: maxVotes.value,
      allowMultipleVotesPerItem: allowMultipleVotes.value,
      teamId: teamStore.currentTeam?.id,
      status: 'active',
      createdAt: new Date(),
      createdBy: retroStore.currentUser?.uid
    }

    const retroId = await retroStore.createRetrospective(newRetro)
    router.push(`/retrospective/${retroId}`)
  } catch (error) {
    console.error('Failed to create retrospective:', error)
  } finally {
    loading.value = false
  }
}
</script> 