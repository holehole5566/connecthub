const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-domain.com'

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  first_name: string
  last_name?: string
  email: string
  birthday: string
  gender: string
  bio: string
  interests: string[]
  photos: string[]
  location?: {
    latitude: number
    longitude: number
    city: string
  }
}

class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }
    
    return response.json()
  }

  async register(data: RegisterData) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Registration failed')
    }
    
    return response.json()
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Not authenticated')
    }
    
    return response.json()
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    
    return response.ok
  }
}

export const authService = new AuthService()