import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { authApiService, PartnerProfile } from '@/services/auth/auth'

const TOKEN_KEY = 'partner_token'

interface AuthState {
  partner: PartnerProfile | null
  isLoading: boolean
  error: string | null

  register: (payload: {
    firstName: string
    lastName: string
    contactNumber: string
    password: string
    email?: string
    city?: string
    dob?: string
  }) => Promise<void>
  login: (payload: { contactNumber: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  /** Validates the stored token against the backend and rehydrates `partner`.
   *  Clears the token and returns false if there is none, or it's no longer valid. */
  hydrate: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>((set) => ({
  partner: null,
  isLoading: false,
  error: null,

  register: async (payload) => {
    console.log('[authStore] register() called with', { ...payload, password: '***' })
    set({ isLoading: true, error: null })
    try {
      const response = await authApiService.register(payload)
      console.log('[authStore] register() succeeded')
      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token)
      set({ partner: response.data.partner, isLoading: false })
    } catch (err: any) {
      console.log('[authStore] register() failed:', err.message)
      const message = err.response?.data?.message || 'Could not create partner account'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApiService.login(payload)
      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token)
      set({ partner: response.data.partner, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid contact number or password'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    set({ partner: null, error: null })
  },

  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY)
    if (!token) {
      set({ partner: null })
      return false
    }

    try {
      const response = await authApiService.getMe()
      set({ partner: response.data })
      return true
    } catch (err) {
      // Token is missing/expired/invalid — clear it so the app doesn't
      // keep treating this device as logged in.
      await SecureStore.deleteItemAsync(TOKEN_KEY)
      set({ partner: null })
      return false
    }
  },
}))
