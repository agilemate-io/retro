<template>
  <v-container>
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <template v-else-if="retrospective">
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <h1 class="text-h4">{{ retrospective.title }}</h1>
                <div class="text-subtitle-1">
                  {{ formatDate(retrospective.createdAt) }}
                </div>
              </div>
              <v-chip
                :color="getStatusColor(retrospective.status)"
                class="ml-2"
              >
                {{ retrospective.status }}
              </v-chip>
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-card outlined>
                    <v-card-title>Template</v-card-title>
                    <v-card-text>
                      <v-chip
                        :color="getTemplateColor(retrospective.template)"
                        class="mr-2"
                      >
                        <v-icon left>{{ getTemplateIcon(retrospective.template) }}</v-icon>
                        {{ retrospective.template }}
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card outlined>
                    <v-card-title>Participants</v-card-title>
                    <v-card-text>
                      <v-chip-group>
                        <v-chip
                          v-for="participant in retrospective.participants"
                          :key="participant.id"
                          class="mr-2"
                        >
                          {{ participant.name }}
                        </v-chip>
                      </v-chip-group>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>Feedback Items</v-card-title>
            <v-card-text>
              <v-expansion-panels>
                <v-expansion-panel
                  v-for="(items, category) in groupedFeedbackItems"
                  :key="category"
                >
                  <v-expansion-panel-header>
                    {{ category }}
                    <template v-slot:actions>
                      <v-chip small class="ml-2">
                        {{ items.length }}
                      </v-chip>
                    </template>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-list>
                      <v-list-item
                        v-for="item in items"
                        :key="item.id"
                        class="mb-2"
                      >
                        <v-list-item-content>
                          <v-list-item-title>{{ item.content }}</v-list-item-title>
                          <v-list-item-subtitle>
                            Added by {{ item.author }} on {{ formatDate(item.createdAt) }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Action Items</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="item in retrospective.actionItems"
                  :key="item.id"
                  class="mb-2"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ item.description }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <div class="d-flex align-center">
                        <v-chip
                          small
                          :color="getStatusColor(item.status)"
                          class="mr-2"
                        >
                          {{ item.status }}
                        </v-chip>
                        <span v-if="item.dueDate">
                          Due: {{ formatDate(item.dueDate) }}
                        </span>
                      </div>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-alert type="error">
          Retrospective not found
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRetroStore } from '@/stores/retroStore'
import { Retrospective } from '@/types/retrospective'

const route = useRoute()
const retroStore = useRetroStore()
const loading = ref(true)
const retrospective = ref<Retrospective | null>(null)

const groupedFeedbackItems = computed(() => {
  if (!retrospective.value) return {}
  
  return retrospective.value.feedbackItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof retrospective.value.feedbackItems>)
})

onMounted(async () => {
  const retroId = route.params.id as string
  try {
    retrospective.value = await retroStore.getRetrospective(retroId)
  } catch (error) {
    console.error('Error loading retrospective:', error)
  } finally {
    loading.value = false
  }
})

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success'
    case 'in progress':
      return 'warning'
    case 'pending':
      return 'info'
    default:
      return 'grey'
  }
}

const getTemplateColor = (template: string) => {
  switch (template.toLowerCase()) {
    case 'start stop continue':
      return 'primary'
    case 'mad sad glad':
      return 'secondary'
    case '4ls':
      return 'accent'
    default:
      return 'grey'
  }
}

const getTemplateIcon = (template: string) => {
  switch (template.toLowerCase()) {
    case 'start stop continue':
      return 'mdi-play-pause'
    case 'mad sad glad':
      return 'mdi-emoticon'
    case '4ls':
      return 'mdi-format-list-checks'
    default:
      return 'mdi-format-list-bulleted'
  }
}
</script> 