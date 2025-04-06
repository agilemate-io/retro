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
          <v-card-title>Retrospective Analytics</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-card variant="tonal">
                  <v-card-text>
                    <div class="text-h6">{{ retroStats.totalRetros }}</div>
                    <div class="text-caption">Total Retrospectives</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6">
                <v-card variant="tonal">
                  <v-card-text>
                    <div class="text-h6">{{ retroStats.avgFeedbackPerRetro }}</div>
                    <div class="text-caption">Avg. Feedback/Retro</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-chart
              :option="retroTrendChart"
              autoresize
              class="mt-4"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Action Item Analytics</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-card variant="tonal">
                  <v-card-text>
                    <div class="text-h6">{{ actionStats.completionRate }}%</div>
                    <div class="text-caption">Completion Rate</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6">
                <v-card variant="tonal">
                  <v-card-text>
                    <div class="text-h6">{{ actionStats.avgCompletionTime }} days</div>
                    <div class="text-caption">Avg. Completion Time</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-chart
              :option="actionTrendChart"
              autoresize
              class="mt-4"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Feedback Distribution</v-card-title>
          <v-card-text>
            <v-chart
              :option="feedbackDistributionChart"
              autoresize
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Team Participation</v-card-title>
          <v-card-text>
            <v-chart
              :option="participationChart"
              autoresize
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAnalyticsStore } from '@/stores/analyticsStore'

const analyticsStore = useAnalyticsStore()

const retroStats = computed(() => analyticsStore.retroAnalytics)
const actionStats = computed(() => analyticsStore.actionItemAnalytics)

const retroTrendChart = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: retroStats.value.trend.map(t => t.date)
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: retroStats.value.trend.map(t => t.count),
    type: 'line',
    smooth: true,
    name: 'Retrospectives'
  }]
}))

const actionTrendChart = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: actionStats.value.trend.map(t => t.date)
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: actionStats.value.trend.map(t => t.completed),
    type: 'line',
    smooth: true,
    name: 'Completed'
  }, {
    data: actionStats.value.trend.map(t => t.created),
    type: 'line',
    smooth: true,
    name: 'Created'
  }]
}))

const feedbackDistributionChart = computed(() => ({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [{
    type: 'pie',
    radius: '50%',
    data: [
      { value: retroStats.value.sentiment.positive, name: 'Positive' },
      { value: retroStats.value.sentiment.negative, name: 'Negative' },
      { value: retroStats.value.sentiment.neutral, name: 'Neutral' }
    ],
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }]
}))

const participationChart = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['Participation Rate']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'value'
  },
  yAxis: {
    type: 'category',
    data: Object.keys(retroStats.value.participationRate)
  },
  series: [{
    name: 'Participation Rate',
    type: 'bar',
    data: Object.values(retroStats.value.participationRate)
  }]
}))
</script> 