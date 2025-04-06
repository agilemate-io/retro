export interface RetroAnalytics {
  totalRetros: number
  totalFeedbackItems: number
  totalActionItems: number
  completedActionItems: number
  averageParticipants: number
  averageFeedbackPerPerson: number
  averageVotesPerPerson: number
  mostUsedTemplate: string
  categoryDistribution: Record<string, number>
  sentimentTrend: SentimentTrend[]
  participationRate: number
  averageDuration: number
}

export interface SentimentTrend {
  date: Date
  positive: number
  negative: number
  neutral: number
}

export interface ActionItemAnalytics {
  total: number
  completed: number
  inProgress: number
  pending: number
  averageCompletionTime: number
  assigneeDistribution: Record<string, number>
  categoryDistribution: Record<string, number>
  completionTrend: CompletionTrend[]
}

export interface CompletionTrend {
  date: Date
  completed: number
  created: number
}

export interface TeamAnalytics {
  participationRate: Record<string, number>
  contributionDistribution: Record<string, number>
  engagementScore: number
  feedbackQuality: number
  actionItemEffectiveness: number
} 