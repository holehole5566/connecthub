import type { Match, MatchStatus } from '../types/match'


export class MatchService {


  static async getMatches(): Promise<MatchStatus> {
    // Use API service for backend calls
    const { apiService } = await import('./apiService')
    const response = await apiService.getMatches()
    const matchData = response.data
    if (Array.isArray(matchData)) {
      return { matches: matchData, totalCount: matchData.length }
    } else {
      return { matches: matchData?.items || [], totalCount: matchData?.total || 0 }
    }
  }

  static async addLike(targetUserId: number, type: 'like' | 'super' = 'like'): Promise<{ isMatch: boolean; match?: Match }> {
    // Use API service for backend calls
    const { apiService } = await import('./apiService')
    const response = await apiService.sendLike({ target_user_id: targetUserId, like_type: type })
    const data = response.data
    return {
      isMatch: data?.is_match || false,
      match: data?.match
    }
  }

  // Legacy method for backward compatibility
  static async addMatch( targetUserId: number): Promise<Match> {
    const result = await this.addLike( targetUserId, 'like')
    if (result.match) {
      return result.match
    }
    throw new Error('No match created')
  }
}