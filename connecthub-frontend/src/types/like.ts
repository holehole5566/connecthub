export interface LikeData {
  id: string
  from_user_id: number
  to_user_id: number
  type: 'like' | 'super'
  created_at: string
}