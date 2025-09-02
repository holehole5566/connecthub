import type { UserSettings } from '../types/settings'
import { store } from '../store'


export class SettingsService {
  static async getSettings(): Promise<UserSettings> {
    // Get user ID from Redux store
    const userId = store.getState().user.currentUser?.id || 1
    
    // Use API service for backend calls
    const { apiService } = await import('./apiService')
    const response = await apiService.getSettings(userId)
    return response.data as UserSettings
  }

  static async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    // Get user ID from Redux store
    const userId = store.getState().user.currentUser?.id || 1
    
    // Use API service for backend calls
    const { apiService } = await import('./apiService')
    const response = await apiService.updateSettings(userId, settings)
    return response.data as UserSettings
  }

  static async pauseAccount(): Promise<void> {
    const userId = store.getState().user.currentUser?.id || 1
    const { apiService } = await import('./apiService')
    await apiService.pauseAccount(userId)
  }

  static async reactivateAccount(): Promise<void> {
    const userId = store.getState().user.currentUser?.id || 1
    const { apiService } = await import('./apiService')
    await apiService.reactivateAccount(userId)
  }

  static async deleteAccount(): Promise<void> {
    const userId = store.getState().user.currentUser?.id || 1
    const { apiService } = await import('./apiService')
    await apiService.deleteAccount(userId)
  }
}