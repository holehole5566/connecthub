import type { TelegramWebApp } from '../types/telegram'
import { mockNewTelegramUser, mockExistingTelegramUser } from '../data/mockTelegram'

export class MockService {
  static createMockWebApp(): TelegramWebApp {
    
    // Switch between users using environment variable
    // Set VITE_MOCK_USER=new in .env.local to use new user
    const useNewUser = import.meta.env.VITE_MOCK_USER === 'new'
    const mock_user = useNewUser ? mockNewTelegramUser : mockExistingTelegramUser
    console.log('MockService: Creating mock WebApp with user:', useNewUser ? 'NEW' : 'EXISTING', mock_user)
    
    return {
      initData: `user=${encodeURIComponent(JSON.stringify(mock_user))}&auth_date=${Date.now()}&hash=mock_hash`,
      initDataUnsafe: {
        user: mock_user,
        chat_instance: 'mock_chat_instance',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'mock_hash'
      },
      version: '6.0',
      platform: 'web',
      colorScheme: 'light',
      themeParams: {
        bg_color: '#ffffff',
        text_color: '#000000',
        hint_color: '#999999',
        link_color: '#2481cc',
        button_color: '#2481cc',
        button_text_color: '#ffffff'
      },
      isExpanded: true,
      viewportHeight: window.innerHeight,
      viewportStableHeight: window.innerHeight,
      headerColor: '#2481cc',
      backgroundColor: '#ffffff',
      isClosingConfirmationEnabled: false,
      ready: () => console.log('Telegram WebApp ready (mock)'),
      expand: () => console.log('Telegram WebApp expand (mock)'),
      close: () => console.log('Telegram WebApp close (mock)'),
      MainButton: {
        text: 'Continue',
        color: '#2481cc',
        textColor: '#ffffff',
        isVisible: false,
        isActive: true,
        show: () => console.log('MainButton show (mock)'),
        hide: () => console.log('MainButton hide (mock)'),
        enable: () => console.log('MainButton enable (mock)'),
        disable: () => console.log('MainButton disable (mock)'),
        setText: (text: string) => console.log(`MainButton setText: ${text} (mock)`),
        onClick: (callback: () => void) => console.log('MainButton onClick (mock)', callback),
        offClick: (callback: () => void) => console.log('MainButton offClick (mock)', callback)
      },
      BackButton: {
        isVisible: false,
        show: () => console.log('BackButton show (mock)'),
        hide: () => console.log('BackButton hide (mock)'),
        onClick: (callback: () => void) => console.log('BackButton onClick (mock)', callback),
        offClick: (callback: () => void) => console.log('BackButton offClick (mock)', callback)
      },
      HapticFeedback: {
        impactOccurred: (style) => console.log(`HapticFeedback impact: ${style} (mock)`),
        notificationOccurred: (type) => console.log(`HapticFeedback notification: ${type} (mock)`),
        selectionChanged: () => console.log('HapticFeedback selection changed (mock)')
      }
    }
  }

  static initMockEnvironment(): void {
    
    console.log('MockService: [MOCK] Initializing mock environment')
    const mockWebApp = this.createMockWebApp()
    console.log('MockService: Created WebApp with initDataUnsafe:', mockWebApp.initDataUnsafe)
    
    // Always override to ensure mock data is used
    window.Telegram = {
      WebApp: mockWebApp
    }
  }
}