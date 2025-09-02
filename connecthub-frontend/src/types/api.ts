// Production-ready API interfaces

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// User Management
export interface CreateUserRequest {
  telegram_user_id: number
  first_name: string
  email: string
  birthday: string // ISO date string
  gender: 'male' | 'female' | 'other'
  bio: string
  interests: string[]
  photos: string[] // Base64 or URLs
  location?: {
    latitude: number
    longitude: number
    city: string
  }
}

export interface UpdateUserRequest {
  first_name?: string
  last_name?: string
  bio?: string
  interests?: string[]
  photos?: string[]
  location?: {
    latitude: number
    longitude: number
    city: string
  }
}

// Discovery
export interface DiscoverRequest {
  age_min: number
  age_max: number
  max_distance: number
  limit?: number
  exclude_user_ids?: number[]
}

export interface DiscoverResponse {
  users: AppUser[]
  has_more: boolean
}

// Likes & Matches
export interface LikeRequest {
  target_user_id: number
  like_type: 'like' | 'super'
}

export interface LikeResponse {
  is_match: boolean
  match?: Match
  likes_remaining?: number
  super_likes_remaining?: number
}

// Chat
export interface SendMessageRequest {
  match_id: string
  text: string
}

export interface ChatHistoryRequest {
  match_id: string
  limit?: number
  before?: string
}

// Settings
export interface UpdateSettingsRequest {
  max_distance?: number
  age_range?: {
    min: number
    max: number
  }
  show_me_in_discovery?: boolean
  is_paused?: boolean
}

// Import existing types
import type { AppUser } from './user'
import type { Match } from './match'