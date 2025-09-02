interface BottomNavProps {
  activeView: 'discover' | 'profile' | 'matches' | 'settings'
  setActiveView: (view: 'discover' | 'profile' | 'matches' | 'settings') => void
}

export default function BottomNav({ activeView, setActiveView }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <button 
        className={`nav-tab ${activeView === 'discover' ? 'active' : ''}`}
        onClick={() => setActiveView('discover')}
      >
        <span className="nav-icon">🔥</span>
        <span className="nav-label">Discover</span>
      </button>
      <button 
        className={`nav-tab ${activeView === 'matches' ? 'active' : ''}`}
        onClick={() => setActiveView('matches')}
      >
        <span className="nav-icon">💬</span>
        <span className="nav-label">Matches</span>
      </button>
      <button 
        className={`nav-tab ${activeView === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveView('profile')}
      >
        <span className="nav-icon">👤</span>
        <span className="nav-label">Profile</span>
      </button>
      <button 
        className={`nav-tab ${activeView === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveView('settings')}
      >
        <span className="nav-icon">⚙️</span>
        <span className="nav-label">Settings</span>
      </button>
    </nav>
  )
}