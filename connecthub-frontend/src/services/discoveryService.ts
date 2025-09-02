import type { AppUser } from '../types/user'


export class DiscoveryService {
  static async getDiscoverUsers(age_min: number = 18, age_max: number = 35, max_distance: number = 50): Promise<AppUser[]> {
    // Use API service for backend calls
    const { apiService } = await import('./apiService')
    const response = await apiService.getDiscoverUsers({ age_min, age_max, max_distance })
    return response.data?.users || []
  }
}