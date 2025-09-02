import type { TelegramUser } from "../types/telegram";

export const mockNewTelegramUser : TelegramUser = {
  id: 999999999, // New user ID not in mockAppUsers
  first_name: 'New',
  last_name: 'User',
  username: 'newuser_tg',
  language_code: 'en',
  is_premium: false
}

export const mockExistingTelegramUser : TelegramUser = {
  id: 111111111, // Existing user ID in mockAppUsers
  first_name: 'Alice',
  last_name: 'Smith',
  username: 'alice_smith',
  language_code: 'en',
  is_premium: true
}