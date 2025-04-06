export type TeamRole = 'owner' | 'admin' | 'member'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  joinedAt: string
}

export interface TeamSettings {
  defaultRetroTemplate: string
  defaultTimeBoxes: {
    feedback: number
    grouping: number
    voting: number
    actionItems: number
  }
  maxVotesPerUser: number
  allowAnonymousFeedback: boolean
  requireActionItems: boolean
  integrations: Record<string, any>
}

export interface Team {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  members: TeamMember[]
}

export interface TeamInvitation {
  id: string
  teamId: string
  email: string
  role: TeamRole
  createdAt: Date
  createdBy: string
  status: 'pending' | 'accepted' | 'rejected'
} 