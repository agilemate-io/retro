import { useNotifications } from '@/composables/useNotifications'

export interface ErrorResponse {
  code: string
  message: string
  details?: any
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleError(error: unknown) {
  const { addNotification } = useNotifications()
  
  if (error instanceof AppError) {
    addNotification({
      type: 'error',
      message: error.message,
      timeout: 8000
    })
    return
  }

  if (error instanceof Error) {
    addNotification({
      type: 'error',
      message: error.message,
      timeout: 8000
    })
    return
  }

  addNotification({
    type: 'error',
    message: 'An unexpected error occurred',
    timeout: 8000
  })
} 