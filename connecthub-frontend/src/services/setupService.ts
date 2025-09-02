import type { SetupData } from '../types/setup'
import type { AppUser } from '../types/user'


export class SetupService {
  static async updateUserProfile(userId: number, setupData: SetupData): Promise<AppUser> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
    
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        bio: setupData.bio || 'New to the app!',
        interests: setupData.interests || [],
        photos: setupData.photos
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update profile')
    }
    
    const result = await response.json()
    return result.data
  }

  static validateSetupData(data: SetupData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Photos validation
    if (!data.photos || data.photos.length === 0) {
      errors.push('At least one photo is required')
    }
    
    // Bio validation
    if (!data.bio || data.bio.trim().length < 10) {
      errors.push('Bio must be at least 10 characters')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}