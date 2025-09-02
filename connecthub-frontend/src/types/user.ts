export interface AppUser {
  id: number
  telegram_user_id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  
  email: string
  birthday: string
  gender: 'male' | 'female' | 'other'
  age: number
  bio: string
  interests: string[]
  
  photo_url?: string
  photos: string[]
  distance: number
  
  location?: {
    latitude: number
    longitude: number
    city: string
  }
  
  is_active: boolean
  last_seen: string
  created_at: string
  updated_at: string
  
  is_verified: boolean
  report_count: number
}