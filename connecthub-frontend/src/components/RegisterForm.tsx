import { useState } from 'react'
import { authService } from '../services/authService'
import './auth.css'

interface RegisterFormProps {
  onSuccess: (user: any) => void
  onBack: () => void
  onSetupNeeded: (userId: number) => void
}

export default function RegisterForm({  onBack, onSetupNeeded }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    email: '',
    birthday: '',
    gender: 'male'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const registerData = {
        ...formData,
        bio: '',
        interests: [],
        photos: ['https://via.placeholder.com/400x600?text=Photo']
      }
      await authService.register(registerData)
      
      const userResponse = await authService.getCurrentUser()
      onSetupNeeded(userResponse.data.id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="auth-form">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <h2>Create Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="text"
            placeholder="First Name"
            value={formData.first_name}
            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="date"
            placeholder="Birthday"
            value={formData.birthday}
            onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
            required
          />
        </div>
        
        <div className="form-group">
          <select
            value={formData.gender}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            required
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}