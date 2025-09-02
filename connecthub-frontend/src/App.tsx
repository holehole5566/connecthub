import { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import './App.css'
import DiscoverView from './components/DiscoverView'
import ProfileView from './components/ProfileView'
import MatchList from './components/MatchList'
import ChatRoom from './components/ChatRoom'
import SettingsView from './components/SettingsView'
import UserDetailModal from './components/UserDetailModal'
import BottomNav from './components/BottomNav'
import LandingPage from './components/LandingPage'
import type { Match } from './types/match'
import { setUser, setLoading } from './store/userSlice'
import { useDispatch, useSelector } from 'react-redux'
import { authService } from './services/authService'
import { store } from './store'
import type { RootState } from './store'

function AppContent() {
  const dispatch = useDispatch()
  const { currentUser: user, isLoading } = useSelector((state: RootState) => state.user)
  const [activeView, setActiveView] = useState<'discover' | 'profile' | 'matches' | 'chat' | 'settings'>('discover')
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authService.getCurrentUser()
        dispatch(setUser(response.data))
      } catch (error) {
        dispatch(setUser(null))
      } finally {
        dispatch(setLoading(false))
      }
    }
    
    checkAuth()
  }, [])

  if (isLoading) {
    return <div className="app">Loading...</div>
  }
  
  if (!user) {
    return (
      <div className="app">
        <LandingPage onAuthSuccess={(user) => dispatch(setUser(user))} />
      </div>
    )
  }
  
  const handleLogout = async () => {
    await authService.logout()
    dispatch(setUser(null))
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>Coonecthub</h1>
        {user && (
          <div style={{ fontSize: '12px', opacity: 0.7, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Welcome, {user.first_name}!
            <button onClick={handleLogout} style={{ fontSize: '10px', padding: '2px 6px' }}>Logout</button>
          </div>
        )}
      </header>

      <main>
        {activeView === 'discover' && <DiscoverView />}
        {activeView === 'matches' && (
          <MatchList onChatClick={(match: Match) => {
            setSelectedMatch(match)
            setActiveView('chat')
          }} />
        )}
        {activeView === 'chat' && selectedMatch && (
          <ChatRoom 
            match={selectedMatch} 
            onBack={() => {
              setActiveView('matches')
              setSelectedMatch(null)
            }}
            onProfileClick={(user) => {
              setSelectedUser(user)
            }}
          />
        )}
        {activeView === 'profile' && <ProfileView />}
        {activeView === 'settings' && <SettingsView />}
      </main>
      
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSwipe={() => setSelectedUser(null)}
        />
      )}

      <div id="log" className="log"></div>
      {activeView !== 'chat' && (
        <BottomNav activeView={activeView} setActiveView={setActiveView} />
      )}
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App