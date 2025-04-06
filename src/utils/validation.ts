export interface ValidationRule {
  (value: any): boolean | string
}

export const required = (value: any): boolean | string => {
  return !!value || 'This field is required'
}

export const email = (value: string): boolean | string => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || 'Invalid email address'
}

export const minLength = (min: number): ValidationRule => {
  return (value: string): boolean | string => {
    return value.length >= min || `Minimum length is ${min} characters`
  }
}

export const maxLength = (max: number): ValidationRule => {
  return (value: string): boolean | string => {
    return value.length <= max || `Maximum length is ${max} characters`
  }
}

export const numeric = (value: string): boolean | string => {
  return /^\d+$/.test(value) || 'Must be a number'
}

export const url = (value: string): boolean | string => {
  try {
    new URL(value)
    return true
  } catch {
    return 'Invalid URL'
  }
} 