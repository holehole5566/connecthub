export interface SetupData {
  photos: string[]
  bio: string
  interests: string[]
}

export interface SetupValidation {
  photos: boolean
  bio: boolean
  isValid: boolean
}