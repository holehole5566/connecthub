import { useState } from 'react'
import { authService } from '../services/authService'
import './auth.css'

interface LoginFormProps {
  onSuccess: (user: any) => void
  onBack: () => void
}

export default function LoginForm({ onSuccess, onBack }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await authService.login({ username, password })
      const userResponse = await authService.getCurrentUser()
      onSuccess(userResponse.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <h2>Login</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}