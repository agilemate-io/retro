<template>
  <v-container fluid>
    <!-- Welcome Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="welcome-card" elevation="2">
          <v-card-text>
            <div class="d-flex align-center">
              <div>
                <div class="text-h5 mb-2">
                  Welcome{{ currentUser ? `, ${currentUser.displayName}` : '' }}!
                </div>
                <p class="text-subtitle-1">
                  {{ getWelcomeMessage() }}
                </p>
              </div>
              <v-spacer />
              <v-btn
                v-if="currentTeam"
                color="primary"
                size="large"
                prepend-icon="mdi-plus"
                @click="router.push('/new-retro')"
              >
                New Retrospective
              </v-btn>
              <v-btn
                v-else
                color="primary"
                size="large"
                prepend-icon="mdi-account-group"
                @click="showCreateTeamDialog = true"
              >
                Create Team
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions and Stats -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex flex-column align-center">
              <v-icon size="48" color="primary" class="mb-2">
                mdi-calendar-check
              </v-icon>
              <div class="text-h4 mb-1">{{ recentRetros.length }}</div>
              <div class="text-subtitle-1">Recent Retros</div>
    </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex flex-column align-center">
              <v-icon size="48" color="success" class="mb-2">
                mdi-check-circle
              </v-icon>
              <div class="text-h4 mb-1">{{ completedActionItems }}</div>
              <div class="text-subtitle-1">Completed Actions</div>
            </div>
          </v-card-text>
        </v-card>
          </v-col>

      <v-col cols="12" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex flex-column align-center">
              <v-icon size="48" color="warning" class="mb-2">
                mdi-clock
              </v-icon>
              <div class="text-h4 mb-1">{{ pendingActionItems }}</div>
              <div class="text-subtitle-1">Pending Actions</div>
            </div>
          </v-card-text>
        </v-card>
          </v-col>

      <v-col cols="12" md="3">
        <v-card class="stats-card" elevation="2">
          <v-card-text>
            <div class="d-flex flex-column align-center">
              <v-icon size="48" color="info" class="mb-2">
                mdi-account-group
              </v-icon>
              <div class="text-h4 mb-1">{{ teamMembers.length }}</div>
              <div class="text-subtitle-1">Team Members</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content -->
    <v-row>
      <!-- Recent Retrospectives -->
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            Recent Retrospectives
            <v-spacer />
            <v-btn
              variant="text"
              color="primary"
              @click="router.push('/past-retros')"
            >
              View All
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list lines="two">
              <v-list-item
                v-for="retro in recentRetros"
                :key="retro.id"
                :title="retro.title"
                :subtitle="formatDate(retro.createdAt)"
                @click="router.push(`/retro/${retro.id}`)"
              >
                <template #prepend>
                  <v-avatar :color="getTemplateColor(retro.templateId)">
                    <v-icon>{{ getTemplateIcon(retro.templateId) }}</v-icon>
                  </v-avatar>
                </template>
                <template #append>
                  <v-chip
                    size="small"
                    :color="getStatusColor(retro.status)"
                  >
                    {{ retro.status }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Action Items -->
      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title>Pending Action Items</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="item in pendingActionItemsList"
                :key="item.id"
                :title="item.title"
                :subtitle="`Assigned to: ${item.assignee}`"
              >
                <template #prepend>
                  <v-checkbox
                    v-model="item.completed"
                    @change="updateActionItem(item)"
                  />
                </template>
                <template #append>
                  <v-chip
                    size="small"
                    :color="getDueDateColor(item.dueDate)"
                  >
                    {{ formatDueDate(item.dueDate) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Tips -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Agile Tips</v-card-title>
          <v-card-text>
            <v-carousel
              hide-delimiters
              height="200"
              show-arrows="hover"
            >
              <v-carousel-item
                v-for="(tip, i) in agileTips"
                :key="i"
              >
                <div class="d-flex flex-column align-center justify-center h-100 text-center pa-4">
                  <v-icon size="48" color="primary" class="mb-4">
                    {{ tip.icon }}
                  </v-icon>
                  <div class="text-h6 mb-2">{{ tip.title }}</div>
                  <div class="text-body-1">{{ tip.description }}</div>
                </div>
              </v-carousel-item>
            </v-carousel>
          </v-card-text>
        </v-card>
          </v-col>
        </v-row>

    <!-- Create Team Dialog -->
    <create-team-dialog
      v-model="showCreateTeamDialog"
      @team-created="onTeamCreated"
    />
      </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useTeamStore } from '@/stores/teamStore'
import { useRetroStore } from '@/stores/retroStore'
import CreateTeamDialog from '@/components/team/CreateTeamDialog.vue'

const router = useRouter()
const { currentUser } = useAuth()
const teamStore = useTeamStore()
const retroStore = useRetroStore()

const showCreateTeamDialog = ref(false)
const currentTeam = computed(() => teamStore.currentTeam)
const teamMembers = computed(() => currentTeam.value?.members || [])

const recentRetros = computed(() => retroStore.recentRetrospectives)
const completedActionItems = computed(() => retroStore.completedActionItemsCount)
const pendingActionItems = computed(() => retroStore.pendingActionItemsCount)
const pendingActionItemsList = computed(() => retroStore.pendingActionItems)

onMounted(async () => {
  await Promise.all([
    teamStore.loadTeams(),
    retroStore.loadRetrospectives()
  ])
})

const getWelcomeMessage = () => {
  if (!currentUser.value) return 'Please sign in to get started.'
  if (!currentTeam.value) return 'Create a team to start your first retrospective.'
  return 'Ready for your next retrospective?'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const formatDueDate = (date: Date | undefined) => {
  if (!date) return 'No due date'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

const getTemplateColor = (templateId: string) => {
  const colors: Record<string, string> = {
    'mad-sad-glad': 'primary',
    'start-stop-continue': 'success',
    'well-improve-action': 'info'
  }
  return colors[templateId] || 'grey'
}

const getTemplateIcon = (templateId: string) => {
  const icons: Record<string, string> = {
    'mad-sad-glad': 'mdi-emoticon',
    'start-stop-continue': 'mdi-play-pause',
    'well-improve-action': 'mdi-trending-up'
  }
  return icons[templateId] || 'mdi-help-circle'
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'active': 'success',
    'completed': 'info',
    'draft': 'warning'
  }
  return colors[status] || 'grey'
}

const getDueDateColor = (date: Date | undefined) => {
  if (!date) return 'grey'
  const now = new Date()
  const dueDate = new Date(date)
  const diff = dueDate.getTime() - now.getTime()
  const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24))
  
  if (daysLeft < 0) return 'error'
  if (daysLeft <= 2) return 'warning'
  return 'success'
}

const updateActionItem = async (item: any) => {
  // TODO: Implement action item update
  console.log('Updating action item:', item)
}

const onTeamCreated = async () => {
  await teamStore.loadTeams()
  showCreateTeamDialog.value = false
}

const agileTips = [
  {
    icon: 'mdi-lightbulb',
    title: 'Focus on Solutions',
    description: 'Instead of dwelling on problems, encourage the team to think about potential solutions.'
  },
  {
    icon: 'mdi-account-voice',
    title: 'Equal Participation',
    description: 'Ensure everyone has a chance to speak and share their thoughts.'
  },
  {
    icon: 'mdi-target',
    title: 'Stay Focused',
    description: 'Keep discussions relevant and actionable to make the most of your retrospective time.'
  }
]
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.stats-card {
  transition: transform 0.2s;
}

.stats-card:hover {
  transform: translateY(-4px);
}

.v-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: var(--v-surface-variant);
}
</style>