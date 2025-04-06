import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Team, TeamInvitation, TeamMember, TeamRole } from '@/types/team'
import { useFirestore } from '@/composables/useFirestore'
import { useAuth } from '@/composables/useAuth'

export const useTeamStore = defineStore('team', () => {
  const { addDoc, updateDoc, deleteDoc, queryCollection } = useFirestore()
  const { currentUser } = useAuth()

  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const teamMembers = ref<TeamMember[]>([])
  const invitations = ref<TeamInvitation[]>([])

  const userTeams = computed(() => {
    return teams.value.filter(team =>
      team.members.some(member => member.userId === currentUser.value?.uid)
    )
  })

  const userRole = computed(() => {
    if (!currentTeam.value || !currentUser.value) return null
    const member = currentTeam.value.members.find(
      m => m.userId === currentUser.value?.uid
    )
    return member?.role || null
  })

  const canManageTeam = computed(() => {
    return ['owner', 'admin'].includes(userRole.value || '')
  })

  const loadTeams = async () => {
    if (!currentUser.value) return

    const userTeams = await queryCollection<Team>('teams', [
      {
        field: 'members',
        operator: 'array-contains',
        value: currentUser.value.uid
      }
    ])

    teams.value = userTeams
  }

  const createTeam = async (teamData: Partial<Team>) => {
    if (!currentUser.value) throw new Error('User not authenticated')

    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: teamData.name || '',
      createdAt: new Date(),
      createdBy: currentUser.value.uid,
      members: [{
        id: crypto.randomUUID(),
        userId: currentUser.value.uid,
        name: currentUser.value.displayName || '',
        email: currentUser.value.email || '',
        role: 'owner',
        joinedAt: new Date()
      }],
      settings: {
        defaultRetroTemplate: 'mad-sad-glad',
        defaultTimeBoxes: {
          feedback: 10,
          grouping: 5,
          voting: 5,
          actionItems: 10
        },
        maxVotesPerUser: 5,
        allowAnonymousFeedback: false,
        requireActionItems: true,
        integrations: {}
      },
      ...teamData
    }

    const docRef = await addDoc('teams', newTeam)
    teams.value.push({ ...newTeam, id: docRef.id })
    return { ...newTeam, id: docRef.id }
  }

  const updateTeam = async (teamId: string, data: Partial<Team>) => {
    if (!canManageTeam.value) throw new Error('Insufficient permissions')

    await updateDoc(`teams/${teamId}`, data)
    const index = teams.value.findIndex(t => t.id === teamId)
    if (index !== -1) {
      teams.value[index] = { ...teams.value[index], ...data }
    }
  }

  const deleteTeam = async (teamId: string) => {
    if (!canManageTeam.value) throw new Error('Insufficient permissions')

    await deleteDoc(`teams/${teamId}`)
    teams.value = teams.value.filter(t => t.id !== teamId)
    if (currentTeam.value?.id === teamId) {
      currentTeam.value = null
    }
  }

  const inviteMember = async (teamId: string, email: string, role: TeamRole) => {
    if (!canManageTeam.value) throw new Error('Insufficient permissions')

    const invitation: TeamInvitation = {
      id: crypto.randomUUID(),
      teamId,
      email,
      role,
      createdAt: new Date(),
      createdBy: currentUser.value?.uid || '',
      status: 'pending'
    }

    await addDoc('teamInvitations', invitation)
    // Send invitation email using Firebase Functions
    await fetch('/api/sendTeamInvitation', {
      method: 'POST',
      body: JSON.stringify(invitation)
    })
  }

  const updateMemberRole = async (
    teamId: string,
    memberId: string,
    newRole: TeamRole
  ) => {
    if (!canManageTeam.value) throw new Error('Insufficient permissions')

    const team = teams.value.find(t => t.id === teamId)
    if (!team) throw new Error('Team not found')

    const memberIndex = team.members.findIndex(m => m.id === memberId)
    if (memberIndex === -1) throw new Error('Member not found')

    // Don't allow changing the owner's role
    if (team.members[memberIndex].role === 'owner') {
      throw new Error('Cannot change owner\'s role')
    }

    team.members[memberIndex].role = newRole
    await updateDoc(`teams/${teamId}`, { members: team.members })
  }

  const removeMember = async (teamId: string, memberId: string) => {
    if (!canManageTeam.value) throw new Error('Insufficient permissions')

    const team = teams.value.find(t => t.id === teamId)
    if (!team) throw new Error('Team not found')

    const memberIndex = team.members.findIndex(m => m.id === memberId)
    if (memberIndex === -1) throw new Error('Member not found')

    // Don't allow removing the owner
    if (team.members[memberIndex].role === 'owner') {
      throw new Error('Cannot remove team owner')
    }

    team.members = team.members.filter(m => m.id !== memberId)
    await updateDoc(`teams/${teamId}`, { members: team.members })
  }

  return {
    teams,
    currentTeam,
    teamMembers,
    invitations,
    userTeams,
    userRole,
    canManageTeam,
    loadTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMember,
    updateMemberRole,
    removeMember
  }
}) 