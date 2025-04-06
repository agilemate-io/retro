export interface RetroTemplate {
  id: string
  name: string
  description: string
  columns: {
    id: string
    title: string
    description: string
    color: string
    icon: string
    prompt: string
  }[]
  timeBoxes: {
    phase: 'feedback' | 'grouping' | 'voting' | 'action-items' | 'complete'
    durationMinutes: number
    description: string
  }[]
  maxVotesPerUser: number
  allowMultipleVotesPerItem: boolean
}

export const RETRO_TEMPLATES: RetroTemplate[] = [
  // ... existing templates ...
  {
    id: 'starfish',
    name: 'Starfish Retrospective',
    description: 'Five aspects of team activities and processes',
    columns: [
      {
        id: 'keep',
        title: 'Keep Doing',
        description: 'What should we continue?',
        color: 'success',
        icon: 'mdi-star',
        prompt: 'What practices are working well?'
      },
      {
        id: 'more',
        title: 'More Of',
        description: 'What should we do more?',
        color: 'info',
        icon: 'mdi-plus-circle',
        prompt: 'What should we increase?'
      },
      {
        id: 'less',
        title: 'Less Of',
        description: 'What should we reduce?',
        color: 'warning',
        icon: 'mdi-minus-circle',
        prompt: 'What should we decrease?'
      },
      {
        id: 'start',
        title: 'Start Doing',
        description: 'What should we begin?',
        color: 'primary',
        icon: 'mdi-play-circle',
        prompt: 'What new things should we try?'
      },
      {
        id: 'stop',
        title: 'Stop Doing',
        description: 'What should we cease?',
        color: 'error',
        icon: 'mdi-stop-circle',
        prompt: 'What should we eliminate?'
      }
    ],
    timeBoxes: [
      { phase: 'feedback', durationMinutes: 15, description: 'Share your thoughts in each category' },
      { phase: 'grouping', durationMinutes: 10, description: 'Group similar items' },
      { phase: 'voting', durationMinutes: 8, description: 'Vote on important items' },
      { phase: 'action-items', durationMinutes: 12, description: 'Create action items' }
    ],
    maxVotesPerUser: 10,
    allowMultipleVotesPerItem: true
  },
  {
    id: 'sailboat',
    name: 'Sailboat Retrospective',
    description: 'Visualize your team as a sailboat navigating challenges',
    columns: [
      {
        id: 'wind',
        title: 'Wind (Helping Forces)',
        description: 'What is pushing us forward?',
        color: 'success',
        icon: 'mdi-weather-windy',
        prompt: 'What is helping us succeed?'
      },
      {
        id: 'anchor',
        title: 'Anchor (Holding Forces)',
        description: 'What is holding us back?',
        color: 'error',
        icon: 'mdi-anchor',
        prompt: 'What is slowing us down?'
      },
      {
        id: 'rocks',
        title: 'Rocks (Risks)',
        description: 'What risks do we face?',
        color: 'warning',
        icon: 'mdi-alert',
        prompt: 'What potential problems do we see?'
      },
      {
        id: 'island',
        title: 'Island (Goal)',
        description: 'Where do we want to go?',
        color: 'info',
        icon: 'mdi-island',
        prompt: 'What are our objectives?'
      }
    ],
    timeBoxes: [
      { phase: 'feedback', durationMinutes: 12, description: 'Share your thoughts' },
      { phase: 'grouping', durationMinutes: 8, description: 'Group similar items' },
      { phase: 'voting', durationMinutes: 5, description: 'Vote on important items' },
      { phase: 'action-items', durationMinutes: 10, description: 'Create action items' }
    ],
    maxVotesPerUser: 8,
    allowMultipleVotesPerItem: false
  },
  {
    id: '4ls',
    name: '4Ls Retrospective',
    description: 'What we Liked, Learned, Lacked, and Longed for',
    columns: [
      {
        id: 'liked',
        title: 'Liked',
        description: 'What went well?',
        color: 'success',
        icon: 'mdi-heart',
        prompt: 'What did you enjoy or appreciate?'
      },
      {
        id: 'learned',
        title: 'Learned',
        description: 'What did we discover?',
        color: 'info',
        icon: 'mdi-lightbulb',
        prompt: 'What new insights did you gain?'
      },
      {
        id: 'lacked',
        title: 'Lacked',
        description: 'What was missing?',
        color: 'warning',
        icon: 'mdi-alert-circle',
        prompt: 'What could have been better?'
      },
      {
        id: 'longed',
        title: 'Longed For',
        description: 'What do we wish for?',
        color: 'primary',
        icon: 'mdi-star',
        prompt: 'What do you hope for in the future?'
      }
    ],
    timeBoxes: [
      { phase: 'feedback', durationMinutes: 15, description: 'Share your thoughts in each category' },
      { phase: 'grouping', durationMinutes: 10, description: 'Group similar items' },
      { phase: 'voting', durationMinutes: 8, description: 'Vote on important items' },
      { phase: 'action-items', durationMinutes: 12, description: 'Create action items' }
    ],
    maxVotesPerUser: 8,
    allowMultipleVotesPerItem: true
  },
  {
    id: 'mad-sad-glad',
    name: 'Mad/Sad/Glad',
    description: 'Emotional reflection on team experiences',
    columns: [
      {
        id: 'mad',
        title: 'Mad',
        description: 'What frustrated you?',
        color: 'error',
        icon: 'mdi-emoticon-angry',
        prompt: 'What made you angry or frustrated?'
      },
      {
        id: 'sad',
        title: 'Sad',
        description: 'What disappointed you?',
        color: 'warning',
        icon: 'mdi-emoticon-sad',
        prompt: 'What made you feel disappointed?'
      },
      {
        id: 'glad',
        title: 'Glad',
        description: 'What made you happy?',
        color: 'success',
        icon: 'mdi-emoticon-happy',
        prompt: 'What made you feel happy or satisfied?'
      }
    ],
    timeBoxes: [
      { phase: 'feedback', durationMinutes: 12, description: 'Share your emotional experiences' },
      { phase: 'grouping', durationMinutes: 8, description: 'Group similar items' },
      { phase: 'voting', durationMinutes: 5, description: 'Vote on important items' },
      { phase: 'action-items', durationMinutes: 10, description: 'Create action items' }
    ],
    maxVotesPerUser: 6,
    allowMultipleVotesPerItem: true
  },
  {
    id: 'start-stop-continue',
    name: 'Start/Stop/Continue',
    description: 'Simple and effective three-category retrospective',
    columns: [
      {
        id: 'start',
        title: 'Start',
        description: 'What should we begin?',
        color: 'primary',
        icon: 'mdi-play-circle',
        prompt: 'What new practices should we adopt?'
      },
      {
        id: 'stop',
        title: 'Stop',
        description: 'What should we cease?',
        color: 'error',
        icon: 'mdi-stop-circle',
        prompt: 'What practices should we eliminate?'
      },
      {
        id: 'continue',
        title: 'Continue',
        description: 'What should we keep?',
        color: 'success',
        icon: 'mdi-check-circle',
        prompt: 'What practices are working well?'
      }
    ],
    timeBoxes: [
      { phase: 'feedback', durationMinutes: 10, description: 'Share your thoughts in each category' },
      { phase: 'grouping', durationMinutes: 8, description: 'Group similar items' },
      { phase: 'voting', durationMinutes: 5, description: 'Vote on important items' },
      { phase: 'action-items', durationMinutes: 10, description: 'Create action items' }
    ],
    maxVotesPerUser: 6,
    allowMultipleVotesPerItem: true
  },
  {
    id: 'lean-coffee',
    name: 'Lean Coffee',
    description: 'Structured discussion format with democratic topic selection',
    columns: [
      {
        id: 'to-discuss',
        title: 'To Discuss',
        description: 'Topics to cover',
        color: 'primary',
        icon: 'mdi-comment-question',
        prompt: 'What topics should we discuss?'
      },
      {
        id: 'discussing',
        title: 'Discussing',
        description: 'Current topic',
        color: 'info',
        icon: 'mdi-comment-processing',
        prompt: 'What are we currently discussing?'
      },
      {
        id: 'discussed',
        title: 'Discussed',
        description: 'Completed topics',
        color: 'success',
        icon: 'mdi-comment-check',
        prompt: 'What have we covered?'
      }
    ],
    timeBoxes: [
      { phase: 'feedback', durationMinutes: 5, description: 'Propose discussion topics' },
      { phase: 'voting', durationMinutes: 3, description: 'Vote on topics' },
      { phase: 'feedback', durationMinutes: 25, description: 'Discuss topics' },
      { phase: 'action-items', durationMinutes: 7, description: 'Create action items' }
    ],
    maxVotesPerUser: 5,
    allowMultipleVotesPerItem: true
  }
] 