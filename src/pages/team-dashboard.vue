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
          <v-card-title>Team Statistics</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="tonal">
                  <v-card-text>
                    <div class="text-h6">{{ teamStats.totalMembers }}</div>
                    <div class="text-caption">Team Members</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="tonal">
                  <v-card-text>
                    <div class="text-h6">{{ teamStats.totalRetros }}</div>
                    <div class="text-caption">Retrospectives</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="tonal">
                  <v-card-text>
                    <div class="text-h6">{{ teamStats.avgFeedbackPerRetro }}</div>
                    <div class="text-caption">Avg. Feedback/Retro</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card variant="tonal">
                  <v-card-text>
                    <div class="text-h6">{{ teamStats.actionCompletionRate }}%</div>
                    <div class="text-caption">Action Completion</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title>Recent Activity</v-card-title>
          <v-card-text>
            <v-timeline density="compact">
              <v-timeline-item
                v-for="activity in recentActivity"
                :key="activity.id"
                :dot-color="activity.color"
                size="small"
              >
                <template v-slot:opposite>
                  {{ formatDate(activity.timestamp) }}
                </template>
                <div class="text-body-2">{{ activity.description }}</div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Team Members</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="member in teamMembers"
                :key="member.id"
              >
                <template v-slot:prepend>
                  <v-avatar>
                    <v-img
                      v-if="member.photoURL"
                      :src="member.photoURL"
                      :alt="member.displayName"
                    />
                    <v-icon v-else>mdi-account</v-icon>
                  </v-avatar>
                </template>

                <v-list-item-title>{{ member.displayName }}</v-list-item-title>
                <v-list-item-subtitle>{{ member.role }}</v-list-item-subtitle>

                <template v-slot:append>
                  <v-chip
                    :color="getRoleColor(member.role)"
                    size="small"
                  >
                    {{ member.role }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              @click="showInviteDialog = true"
            >
              Invite Member
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card class="mt-4">
          <v-card-title>Participation Trends</v-card-title>
          <v-card-text>
            <v-chart
              :option="participationChart"
              autoresize
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showInviteDialog" max-width="500">
      <v-card>
        <v-card-title>Invite Team Member</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleInvite">
            <v-text-field
              v-model="inviteEmail"
              label="Email"
              type="email"
              required
              :error-messages="inviteError"
            />
            <v-select
              v-model="inviteRole"
              :items="roleOptions"
              label="Role"
              required
            />
            <v-textarea
              v-model="inviteMessage"
              label="Personal Message"
              rows="3"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            @click="handleInvite"
            :loading="inviteLoading"
          >
            Send Invite
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTeamStore } from '@/stores/teamStore'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import { formatDate } from '@/utils/format'
import type { TeamMember } from '@/types/team'

const teamStore = useTeamStore()
const analyticsStore = useAnalyticsStore()

const showInviteDialog = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('member')
const inviteMessage = ref('')
const inviteLoading = ref(false)
const inviteError = ref('')

const roleOptions = [
  { title: 'Member', value: 'member' },
  { title: 'Admin', value: 'admin' }
]

const teamStats = computed(() => analyticsStore.teamAnalytics)
const teamMembers = computed(() => teamStore.teamMembers)
const recentActivity = computed(() => teamStore.recentActivity)

const participationChart = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: teamStats.value.participationTrend.map(t => t.date)
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: teamStats.value.participationTrend.map(t => t.count),
    type: 'line',
    smooth: true
  }]
}))

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'primary'
    case 'member':
      return 'success'
    default:
      return 'grey'
  }
}

const handleInvite = async () => {
  if (!inviteEmail.value) {
    inviteError.value = 'Email is required'
    return
  }

  try {
    inviteLoading.value = true
    inviteError.value = ''
    await teamStore.inviteMember({
      email: inviteEmail.value,
      role: inviteRole.value,
      message: inviteMessage.value
    })
    showInviteDialog.value = false
    inviteEmail.value = ''
    inviteRole.value = 'member'
    inviteMessage.value = ''
  } catch (error) {
    inviteError.value = error instanceof Error ? error.message : 'Failed to send invite'
  } finally {
    inviteLoading.value = false
  }
}
</script> 