import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import SetupView from './SetupView'
import './auth.css'

interface LandingPageProps {
  onAuthSuccess: (user: any) => void
}

export default function LandingPage({ onAuthSuccess }: LandingPageProps) {
  const [mode, setMode] = useState<'landing' | 'login' | 'register' | 'setup'>('landing')
  const [setupUserId, setSetupUserId] = useState<number | null>(null)

  if (mode === 'login') {
    return <LoginForm onSuccess={onAuthSuccess} onBack={() => setMode('landing')} />
  }

  if (mode === 'register') {
    return (
      <RegisterForm 
        onSuccess={onAuthSuccess} 
        onBack={() => setMode('landing')}
        onSetupNeeded={(userId) => {
          setSetupUserId(userId)
          setMode('setup')
        }}
      />
    )
  }

  if (mode === 'setup' && setupUserId) {
    return (
      <SetupView 
        userId={setupUserId}
        onSetupComplete={onAuthSuccess}
      />
    )
  }

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>Welcome to TTininder</h1>
        <p>Find your perfect match</p>
        
        <div className="auth-buttons">
          <button 
            className="btn-primary"
            onClick={() => setMode('login')}
          >
            Login
          </button>
          
          <button 
            className="btn-secondary"
            onClick={() => setMode('register')}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}