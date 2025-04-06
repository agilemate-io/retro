export type RetroPhase = 'feedback' | 'grouping' | 'voting' | 'action-items' | 'complete'

export interface FeedbackItem {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  votes: number
  category?: string
}

export interface ActionItem {
  id: string
  content: string
  assignedTo?: string
  dueDate?: Date
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: Date
  completedAt?: Date
}

export interface Retrospective {
  id: string
  title: string
  teamId: string
  phase: RetroPhase
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  feedback: FeedbackItem[]
  actionItems: ActionItem[]
  participants: string[]
  settings: {
    template: string
    timeBoxes: {
      feedback: number
      grouping: number
      voting: number
      actionItems: number
    }
    maxVotesPerUser: number
    allowAnonymousFeedback: boolean
  }
} 