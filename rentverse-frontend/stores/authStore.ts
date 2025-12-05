import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, AuthState } from '@/types/auth'
import { AuthApiClient } from '@/utils/authApiClient'
import { setCookie, deleteCookie } from '@/utils/cookies'

interface AuthActions {
  // Login functionality
  setPassword: (password: string) => void
  submitLogIn: () => Promise<void>
  // New direct login action for MFA flow
  login: (user: User, token: string) => void

  // Signup functionality
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
  setBirthdate: (birthdate: string) => void
  setEmail: (email: string) => void
  setPhone: (phone: string) => void
  setSignUpPassword: (password: string) => void
  submitSignUp: () => Promise<void>

  // Email check functionality
  validateEmail: (email: string) => boolean
  submitEmailCheck: () => Promise<{ exists: boolean; isActive: boolean; role: string | null } | null>

  // General auth actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  resetForm: () => void
  isLoginFormValid: () => boolean
  isSignUpFormValid: () => boolean
  
  // Auth persistence
  initializeAuth: () => void
  validateToken: () => Promise<boolean>
  refreshUserData: () => Promise<boolean>
}

interface AuthFormState {
  password: string
  firstName: string
  lastName: string
  birthdate: string
  email: string
  phone: string
  signUpPassword: string
}

type AuthStore = AuthState & AuthFormState & AuthActions

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,

      // Form state
      password: '',
      firstName: '',
      lastName: '',
      birthdate: '',
      email: '',
      phone: '',
      signUpPassword: '',

      // Actions
      setPassword: (password: string) => set({ password }),
      setFirstName: (firstName: string) => set({ firstName }),
      setLastName: (lastName: string) => set({ lastName }),
      setBirthdate: (birthdate: string) => set({ birthdate }),
      setEmail: (email: string) => set({ email }),
      setPhone: (phone: string) => set({ phone }),
      setSignUpPassword: (signUpPassword: string) => set({ signUpPassword }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      validateEmail: (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      },

      isLoginFormValid: () => {
        const { password } = get()
        return password.length >= 6
      },

      isSignUpFormValid: () => {
        const { firstName, lastName, email, signUpPassword, birthdate, phone } = get()
        const { validateEmail } = get()
        return (
          firstName.trim().length > 0 &&
          lastName.trim().length > 0 &&
          validateEmail(email) &&
          signUpPassword.length >= 6 &&
          birthdate.length > 0 &&
          phone.trim().length > 0
        )
      },

      // New login action called by the MFA page
      login: (user: User, token: string) => {
        console.log("✅ AuthStore: Logging in user", user.name);
        // Update state
        set({ 
          user, 
          isLoggedIn: true, 
          error: null 
        });

        // Sync with cookies for server-side middleware usage
        if (typeof window !== 'undefined') {
          setCookie('authToken', token, 7);
        }
      },

      submitLogIn: async () => {
        // Legacy login - MFA Flow uses page.tsx now, but keeping structure for safety
        const { email, password, setLoading, setError } = get()

        if (!get().isLoginFormValid()) {
          setError('Please enter a valid password')
          return
        }
        setLoading(true)
        setError(null)

        try {
          // Note: This fetch might need to be updated to use API_BASE if used directly
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const result = await response.json()

          if (response.ok && result.success) {
             if (result.requireOTP) {
               // Do nothing in store, let UI handle OTP step
               return;
             }
             // Fallback for non-MFA
             get().login(result.data.user, result.data.token);
             window.location.href = '/'
          } else {
            setError(result.message || 'Login failed.')
          }
        } catch (error) {
          setError('Login failed. Please try again.')
        } finally {
          setLoading(false)
        }
      },

      submitSignUp: async () => {
        const { firstName, lastName, email, signUpPassword, birthdate, phone, setLoading, setError } = get()

        if (!get().isSignUpFormValid()) {
          setError('Please fill in all fields correctly')
          return
        }

        setLoading(true)
        setError(null)

        try {
          const result = await AuthApiClient.register({
            email,
            password: signUpPassword,
            firstName,
            lastName,
            dateOfBirth: birthdate,
            phone,
          })

          if (result.success) {
            get().login(result.data.user, result.data.token || '');
            window.location.href = '/'
          } else {
            setError(result.message || 'Sign up failed. Please try again.')
          }
        } catch (error) {
          console.error('Sign up error:', error)
          setError(error instanceof Error ? error.message : 'Sign up failed.')
        } finally {
          setLoading(false)
        }
      },

      submitEmailCheck: async () => {
        const { email, validateEmail, setLoading, setError } = get()

        if (!validateEmail(email)) {
          setError('Please enter a valid email address')
          return null
        }

        setLoading(true)
        setError(null)

        try {
          // Note: Update this URL if your proxy isn't handling /api routes correctly
          const response = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
          const result = await response.json()
          if (response.ok && result.success) return result.data
          setError(result.message || 'Email check failed.')
          return null
        } catch (error) {
          setError('Email check failed.')
          return null
        } finally {
          setLoading(false)
        }
      },

      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
          error: null,
          password: '',
          email: '',
          phone: '',
          signUpPassword: '',
        })
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken') // Clean up legacy keys if any
          deleteCookie('authToken')
        }
      },

      resetForm: () => set({
        password: '',
        firstName: '',
        lastName: '',
        birthdate: '',
        email: '',
        phone: '',
        signUpPassword: '',
        error: null,
      }),

      // Deprecated: Handled by persist middleware now
      initializeAuth: () => {},

      validateToken: async () => {
        // Used for background checks
        // In persisted state, we assume logged in until API fails with 401
        return true; 
      },

      refreshUserData: async () => {
        return true;
      },
    }),
    {
      name: 'rentverse-auth-store', // Unique name for localStorage
      storage: createJSONStorage(() => localStorage), 
      partialize: (state) => ({ 
        user: state.user, 
        isLoggedIn: state.isLoggedIn 
      }), // Only save user and login status
      onRehydrateStorage: () => (state) => {
        console.log('💧 AuthStore Hydrated:', state?.isLoggedIn ? 'User Logged In' : 'Guest Mode');
      }
    }
  )
)

export default useAuthStore