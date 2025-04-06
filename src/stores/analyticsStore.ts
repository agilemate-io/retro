import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  RetroAnalytics,
  ActionItemAnalytics,
  TeamAnalytics,
  SentimentTrend,
  CompletionTrend
} from '@/types/analytics'
import { useFirestore } from '@/composables/useFirestore'
import { useTeamStore } from '@/stores/teamStore'

export const useAnalyticsStore = defineStore('analytics', () => {
  const { queryCollection } = useFirestore()
  const teamStore = useTeamStore()

  const retroAnalytics = ref<RetroAnalytics | null>(null)
  const actionItemAnalytics = ref<ActionItemAnalytics | null>(null)
  const teamAnalytics = ref<TeamAnalytics | null>(null)
  const dateRange = ref<[Date, Date]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    new Date()
  ])

  const loadAnalytics = async () => {
    if (!teamStore.currentTeam) return

    const [startDate, endDate] = dateRange.value
    const retros = await queryCollection('retrospectives', [
      { field: 'teamId', operator: '==', value: teamStore.currentTeam.id },
      { field: 'createdAt', operator: '>=', value: startDate },
      { field: 'createdAt', operator: '<=', value: endDate }
    ])

    // Calculate retro analytics
    retroAnalytics.value = calculateRetroAnalytics(retros)

    // Calculate action item analytics
    const actionItems = await queryCollection('actionItems', [
      { field: 'teamId', operator: '==', value: teamStore.currentTeam.id },
      { field: 'createdAt', operator: '>=', value: startDate },
      { field: 'createdAt', operator: '<=', value: endDate }
    ])
    actionItemAnalytics.value = calculateActionItemAnalytics(actionItems)

    // Calculate team analytics
    teamAnalytics.value = calculateTeamAnalytics(retros, actionItems)
  }

  const calculateRetroAnalytics = (retros: any[]): RetroAnalytics => {
    const totalFeedbackItems = retros.reduce(
      (sum, retro) => sum + retro.columns.reduce(
        (colSum: number, col: any) => colSum + col.items.length,
        0
      ),
      0
    )

    const templateCounts = retros.reduce((counts: Record<string, number>, retro) => {
      counts[retro.templateId] = (counts[retro.templateId] || 0) + 1
      return counts
    }, {})

    const mostUsedTemplate = Object.entries(templateCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || ''

    return {
      totalRetros: retros.length,
      totalFeedbackItems,
      totalActionItems: retros.reduce(
        (sum, retro) => sum + retro.actionItems.length,
        0
      ),
      completedActionItems: retros.reduce(
        (sum, retro) => sum + retro.actionItems.filter(
          (item: any) => item.status === 'completed'
        ).length,
        0
      ),
      averageParticipants: retros.reduce(
        (sum, retro) => sum + retro.participants.length,
        0
      ) / retros.length,
      averageFeedbackPerPerson: totalFeedbackItems / (
        retros.reduce(
          (sum, retro) => sum + retro.participants.length,
          0
        )
      ),
      averageVotesPerPerson: retros.reduce(
        (sum, retro) => sum + retro.columns.reduce(
          (colSum: number, col: any) => colSum + col.items.reduce(
            (itemSum: number, item: any) => itemSum + item.votes,
            0
          ),
          0
        ),
        0
      ) / (
        retros.reduce(
          (sum, retro) => sum + retro.participants.length,
          0
        )
      ),
      mostUsedTemplate,
      categoryDistribution: calculateCategoryDistribution(retros),
      sentimentTrend: calculateSentimentTrend(retros),
      participationRate: calculateParticipationRate(retros),
      averageDuration: calculateAverageDuration(retros)
    }
  }

  const calculateActionItemAnalytics = (
    actionItems: any[]
  ): ActionItemAnalytics => {
    const completed = actionItems.filter(item => item.status === 'completed')
    const inProgress = actionItems.filter(item => item.status === 'in-progress')
    const pending = actionItems.filter(item => item.status === 'pending')

    return {
      total: actionItems.length,
      completed: completed.length,
      inProgress: inProgress.length,
      pending: pending.length,
      averageCompletionTime: calculateAverageCompletionTime(completed),
      assigneeDistribution: calculateAssigneeDistribution(actionItems),
      categoryDistribution: calculateActionItemCategories(actionItems),
      completionTrend: calculateCompletionTrend(actionItems)
    }
  }

  const calculateTeamAnalytics = (
    retros: any[],
    actionItems: any[]
  ): TeamAnalytics => {
    return {
      participationRate: calculateTeamParticipationRate(retros),
      contributionDistribution: calculateContributionDistribution(retros),
      engagementScore: calculateEngagementScore(retros),
      feedbackQuality: calculateFeedbackQuality(retros),
      actionItemEffectiveness: calculateActionItemEffectiveness(actionItems)
    }
  }

  const calculateCategoryDistribution = (retros: any[]) => {
    const distribution: Record<string, number> = {}
    retros.forEach(retro => {
      retro.feedback.forEach((item: any) => {
        const category = item.category || 'uncategorized'
        distribution[category] = (distribution[category] || 0) + 1
      })
    })
    return distribution
  }

  const calculateSentimentTrend = (retros: any[]): SentimentTrend[] => {
    return retros.map(retro => ({
      date: new Date(retro.createdAt),
      positive: retro.feedback.filter((item: any) => item.sentiment > 0).length,
      negative: retro.feedback.filter((item: any) => item.sentiment < 0).length,
      neutral: retro.feedback.filter((item: any) => item.sentiment === 0).length
    }))
  }

  const calculateParticipationRate = (retros: any[]) => {
    const totalParticipants = new Set()
    retros.forEach(retro => {
      retro.participants.forEach((p: string) => totalParticipants.add(p))
    })
    return totalParticipants.size / retros.length
  }

  const calculateAverageDuration = (retros: any[]) => {
    const durations = retros.map(retro => {
      const start = new Date(retro.startedAt || retro.createdAt)
      const end = new Date(retro.completedAt || new Date())
      return (end.getTime() - start.getTime()) / (1000 * 60) // in minutes
    })
    return durations.reduce((a, b) => a + b, 0) / durations.length
  }

  const calculateAverageCompletionTime = (completedItems: any[]) => {
    const times = completedItems.map(item => {
      const start = new Date(item.createdAt)
      const end = new Date(item.completedAt || new Date())
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) // in days
    })
    return times.reduce((a, b) => a + b, 0) / times.length
  }

  const calculateAssigneeDistribution = (actionItems: any[]) => {
    const distribution: Record<string, number> = {}
    actionItems.forEach(item => {
      const assignee = item.assignedTo || 'unassigned'
      distribution[assignee] = (distribution[assignee] || 0) + 1
    })
    return distribution
  }

  const calculateActionItemCategories = (actionItems: any[]) => {
    const distribution: Record<string, number> = {}
    actionItems.forEach(item => {
      const category = item.category || 'uncategorized'
      distribution[category] = (distribution[category] || 0) + 1
    })
    return distribution
  }

  const calculateCompletionTrend = (actionItems: any[]): CompletionTrend[] => {
    const trendMap = new Map<string, { completed: number; created: number }>()
    actionItems.forEach(item => {
      const date = new Date(item.createdAt).toISOString().split('T')[0]
      const trend = trendMap.get(date) || { completed: 0, created: 0 }
      trend.created++
      if (item.status === 'completed') {
        trend.completed++
      }
      trendMap.set(date, trend)
    })
    return Array.from(trendMap.entries()).map(([date, data]) => ({
      date: new Date(date),
      ...data
    }))
  }

  const calculateTeamParticipationRate = (retros: any[]): Record<string, number> => {
    const participation: Record<string, number> = {}
    retros.forEach(retro => {
      retro.participants.forEach((p: string) => {
        participation[p] = (participation[p] || 0) + 1
      })
    })
    return participation
  }

  const calculateContributionDistribution = (retros: any[]) => {
    const distribution: Record<string, number> = {}
    retros.forEach(retro => {
      retro.participants.forEach((p: string) => {
        distribution[p] = (distribution[p] || 0) + 1
      })
    })
    return distribution
  }

  const calculateEngagementScore = (retros: any[]) => {
    const scores = retros.map(retro => {
      const feedbackPerPerson = retro.feedback.length / retro.participants.length
      const votePerPerson = retro.feedback.reduce((sum: number, item: any) => sum + item.votes, 0) / retro.participants.length
      return (feedbackPerPerson + votePerPerson) / 2
    })
    return scores.reduce((a, b) => a + b, 0) / scores.length
  }

  const calculateFeedbackQuality = (retros: any[]) => {
    const qualityScores = retros.map(retro => {
      const avgVotes = retro.feedback.reduce((sum: number, item: any) => sum + item.votes, 0) / retro.feedback.length
      const avgLength = retro.feedback.reduce((sum: number, item: any) => sum + item.content.length, 0) / retro.feedback.length
      return (avgVotes + avgLength / 100) / 2
    })
    return qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
  }

  const calculateActionItemEffectiveness = (actionItems: any[]) => {
    const completed = actionItems.filter(item => item.status === 'completed')
    return completed.length / actionItems.length
  }

  return {
    retroAnalytics,
    actionItemAnalytics,
    teamAnalytics,
    dateRange,
    loadAnalytics
  }
}) 