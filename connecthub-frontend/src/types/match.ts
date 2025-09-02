import type { AppUser } from './user'

export interface Match {
  id: string
  user_id: number
  matched_user_id: number
  user: AppUser
  matched_at: string
  last_message?: {
    text: string
    sent_at: string
    is_from_current_user: boolean
  }
  is_new_match: boolean
}

export interface MatchStatus {
  matches: Match[]
  totalCount: number
}