import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { authApiService, UserProfile } from '@/services/auth/auth'

const TOKEN_KEY = 'user_token'

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  error: string | null
  /** Flips true once `hydrate()` has resolved (either way) — lets screens
   *  distinguish "haven't checked session yet" from "checked, logged out". */
  isHydrated: boolean

  register: (payload: {
    firstname: string
    lastname: string
    email: string
    contact: string
    city: string
    dob: string
    password: string
  }) => Promise<void>
  login: (payload: { identifier: string; password: string }) => Promise<void>
  updateProfile: (payload: {
    firstname?: string
    lastname?: string
    email?: string
    city?: string
    dob?: string
  }) => Promise<void>
  logout: () => Promise<void>
  /** Validates the stored token against the backend and rehydrates `user`.
   *  Clears the token and returns false if there is none, or it's no longer valid. */
  hydrate: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isHydrated: false,

  register: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApiService.register(payload)
      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token)
      set({ user: response.data.user, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not create account'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApiService.login(payload)
      await SecureStore.setItemAsync(TOKEN_KEY, response.data.token)
      set({ user: response.data.user, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid email/contact or password'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  updateProfile: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authApiService.updateProfile(payload)
      set({ user: response.data, isLoading: false })
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not update profile'
      set({ error: message, isLoading: false })
      throw new Error(message)
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    set({ user: null, error: null })
  },

  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY)
    if (!token) {
      set({ user: null, isHydrated: true })
      return false
    }

    try {
      const response = await authApiService.getMe()
      set({ user: response.data, isHydrated: true })
      return true
    } catch (err) {
      // Token is missing/expired/invalid — clear it so the app doesn't
      // keep treating this device as logged in.
      await SecureStore.deleteItemAsync(TOKEN_KEY)
      set({ user: null, isHydrated: true })
      return false
    }
  },
}))
