// Production API service layer
import type {
  ApiResponse,
  PaginatedResponse,
  CreateUserRequest,
  UpdateUserRequest,
  DiscoverRequest,
  DiscoverResponse,
  LikeRequest,
  LikeResponse,
  ChatHistoryRequest,
  UpdateSettingsRequest
} from '../types/api'
import type { AppUser } from '../types/user'
import type { Match } from '../types/match'
import type { ChatMessage } from '../types/chat'
import type { UserSettings } from '../types/settings'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-domain.com/api'
console.log('API_BASE_URL:', API_BASE_URL)

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include',
      ...options
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed')
      }
      
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // User Management
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<AppUser>> {
    return this.request<AppUser>('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async updateUser(userId: number, userData: UpdateUserRequest): Promise<ApiResponse<AppUser>> {
    return this.request<AppUser>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
  }

  async getUser(userId: number): Promise<ApiResponse<AppUser>> {
    return this.request<AppUser>(`/users/${userId}`)
  }

  // Discovery
  async getDiscoverUsers(params: DiscoverRequest): Promise<ApiResponse<DiscoverResponse>> {
    const queryParams = new URLSearchParams({
      age_min: params.age_min.toString(),
      age_max: params.age_max.toString(),
      max_distance: params.max_distance.toString(),
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.exclude_user_ids && { excludeUserIds: params.exclude_user_ids.join(',') })
    })
    
    return this.request<DiscoverResponse>(`/discover?${queryParams}`)
  }

  // Likes & Matches
  async sendLike(likeData: LikeRequest): Promise<ApiResponse<LikeResponse>> {
    return this.request<LikeResponse>('/matches/like', {
      method: 'POST',
      body: JSON.stringify(likeData)
    })
  }

  async getMatches(): Promise<ApiResponse<PaginatedResponse<Match>>> {
    return this.request<PaginatedResponse<Match>>(`/matches`)
  }



  async getChatHistory(params: ChatHistoryRequest): Promise<ApiResponse<PaginatedResponse<ChatMessage>>> {
    const queryParams = new URLSearchParams({
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.before && { before: params.before })
    })
    
    return this.request<PaginatedResponse<ChatMessage>>(`/chat/${params.match_id}/messages?${queryParams}`)
  }

  // Settings
  async getSettings(userId: number): Promise<ApiResponse<UserSettings>> {
    return this.request<UserSettings>(`/settings/${userId}`)
  }

  async updateSettings(userId: number, settings: UpdateSettingsRequest): Promise<ApiResponse<UserSettings>> {
    return this.request<UserSettings>(`/settings/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
  }

  async pauseAccount(userId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/settings/${userId}/pause`, {
      method: 'POST'
    })
  }

  async reactivateAccount(userId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/settings/${userId}/reactivate`, {
      method: 'POST'
    })
  }

  async deleteAccount(userId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${userId}`, {
      method: 'DELETE'
    })
  }
}

export const apiService = new ApiService()
export default apiService