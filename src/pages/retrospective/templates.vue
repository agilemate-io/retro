<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Retrospective Templates</h1>
      </v-col>
    </v-row>

    <v-alert
      v-if="!teamStore.currentTeam"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      Please select a team before creating templates.
    </v-alert>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Create New Template</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createTemplate">
              <v-text-field
                v-model="newTemplate.name"
                label="Template Name"
                required
                variant="solo-filled"
                :error-messages="errors.name"
                :disabled="!teamStore.currentTeam"
              />

              <v-textarea
                v-model="newTemplate.description"
                label="Description"
                rows="3"
                variant="solo-filled"
                :error-messages="errors.description"
                :disabled="!teamStore.currentTeam"
              />

              <v-divider class="my-4" />

              <div class="d-flex align-center mb-4">
                <h3 class="text-h6">Columns</h3>
                <v-spacer />
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="addColumn"
                  :disabled="!teamStore.currentTeam"
                >
                  Add Column
                </v-btn>
              </div>

              <v-card
                v-for="(column, index) in newTemplate.columns"
                :key="index"
                variant="outlined"
                class="mb-4"
              >
                <v-card-text>
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="column.title"
                        label="Column Title"
                        required
                        variant="solo-filled"
                        :error-messages="errors[`column-${index}-title`]"
                        :disabled="!teamStore.currentTeam"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="column.description"
                        label="Description"
                        variant="solo-filled"
                        :error-messages="errors[`column-${index}-description`]"
                        :disabled="!teamStore.currentTeam"
                      />
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="column.icon"
                        :items="iconOptions"
                        label="Icon"
                        required
                        variant="solo-filled"
                        :error-messages="errors[`column-${index}-icon`]"
                        :disabled="!teamStore.currentTeam"
                      >
                        <template v-slot:item="{ props, item }">
                          <v-list-item v-bind="props">
                            <template v-slot:prepend>
                              <v-icon :icon="item.raw"></v-icon>
                            </template>
                          </v-list-item>
                        </template>
                      </v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-color-picker
                        v-model="column.color"
                        mode="hex"
                        label="Color"
                        variant="solo-filled"
                        :error-messages="errors[`column-${index}-color`]"
                        :disabled="!teamStore.currentTeam"
                      />
                    </v-col>
                  </v-row>

                  <v-btn
                    color="error"
                    variant="text"
                    prepend-icon="mdi-delete"
                    @click="removeColumn(index)"
                    :disabled="!teamStore.currentTeam"
                  >
                    Remove Column
                  </v-btn>
                </v-card-text>
              </v-card>

              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
                block
                class="mt-4"
                :disabled="!teamStore.currentTeam"
              >
                Create Template
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Available Templates</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="template in templates"
                :key="template.id"
              >
                <template v-slot:prepend>
                  <v-icon :color="template.columns[0]?.color">
                    {{ template.columns[0]?.icon }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ template.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ template.description }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn
                    icon
                    variant="text"
                    color="error"
                    @click="deleteTemplate(template.id)"
                    :disabled="!teamStore.currentTeam"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTemplateStore } from '@/stores/templateStore'
import { useTeamStore } from '@/stores/teamStore'
import type { RetroTemplate } from '@/types/retrospective'

const templateStore = useTemplateStore()
const teamStore = useTeamStore()
const loading = ref(false)

const newTemplate = ref<Partial<RetroTemplate>>({
  name: '',
  description: '',
  columns: []
})

const errors = ref<Record<string, string>>({})

const iconOptions = [
  'mdi-emoticon-happy',
  'mdi-emoticon-sad',
  'mdi-lightbulb',
  'mdi-alert',
  'mdi-check',
  'mdi-close',
  'mdi-help',
  'mdi-star',
  'mdi-heart',
  'mdi-thumb-up',
  'mdi-thumb-down',
  'mdi-comment',
  'mdi-pencil',
  'mdi-delete',
  'mdi-plus',
  'mdi-minus',
  'mdi-arrow-up',
  'mdi-arrow-down',
  'mdi-arrow-left',
  'mdi-arrow-right'
]

const templates = computed(() => templateStore.customTemplates)

onMounted(async () => {
  if (teamStore.currentTeam?.id) {
    await templateStore.loadCustomTemplates(teamStore.currentTeam.id)
  }
})

const addColumn = () => {
  newTemplate.value.columns?.push({
    id: crypto.randomUUID(),
    title: '',
    description: '',
    icon: 'mdi-help',
    color: '#1976D2'
  })
}

const removeColumn = (index: number) => {
  newTemplate.value.columns?.splice(index, 1)
}

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!newTemplate.value.name) {
    errors.value.name = 'Name is required'
    isValid = false
  }

  if (!newTemplate.value.columns?.length) {
    errors.value.columns = 'At least one column is required'
    isValid = false
  }

  newTemplate.value.columns?.forEach((column, index) => {
    if (!column.title) {
      errors.value[`column-${index}-title`] = 'Title is required'
      isValid = false
    }
    if (!column.icon) {
      errors.value[`column-${index}-icon`] = 'Icon is required'
      isValid = false
    }
    if (!column.color) {
      errors.value[`column-${index}-color`] = 'Color is required'
      isValid = false
    }
  })

  return isValid
}

const createTemplate = async () => {
  if (!teamStore.currentTeam?.id) {
    errors.value.general = 'Please select a team before creating a template'
    return
  }

  if (!validateForm()) return

  try {
    loading.value = true
    const templateData: Omit<RetroTemplate, 'id'> = {
      name: newTemplate.value.name || '',
      description: newTemplate.value.description || '',
      columns: newTemplate.value.columns || [],
      timeBoxes: [
        { phase: 'feedback', durationMinutes: 15, description: 'Share your thoughts' },
        { phase: 'grouping', durationMinutes: 10, description: 'Group similar items' },
        { phase: 'voting', durationMinutes: 8, description: 'Vote on important items' },
        { phase: 'action-items', durationMinutes: 12, description: 'Create action items' }
      ],
      maxVotesPerUser: 5,
      allowMultipleVotesPerItem: true
    }

    console.log('Creating template with data:', templateData)
    const newTemplate = await templateStore.createTemplate(templateData, teamStore.currentTeam.id)
    console.log('Template created successfully:', newTemplate)

    // Reset form
    newTemplate.value = {
      name: '',
      description: '',
      columns: []
    }

    // Reload templates
    await templateStore.loadCustomTemplates(teamStore.currentTeam.id)
  } catch (error) {
    console.error('Failed to create template:', error)
    if (error instanceof Error) {
      errors.value.general = error.message
    } else {
      errors.value.general = 'Failed to create template'
    }
  } finally {
    loading.value = false
  }
}

const deleteTemplate = async (id: string) => {
  try {
    if (teamStore.currentTeam?.id) {
      await templateStore.deleteTemplate(teamStore.currentTeam.id, id)
    }
  } catch (error) {
    console.error('Failed to delete template:', error)
  }
}
</script> 