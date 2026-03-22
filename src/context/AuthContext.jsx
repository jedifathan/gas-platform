import { createContext, useReducer, useEffect } from 'react'
import { supabase }           from '../services/supabaseClient'
import { rehydrateSession }   from '../services/authService'

export const AuthContext = createContext(null)

const initialState = {
  session:         null,
  isAuthenticated: false,
  isLoading:       true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { session: action.payload, isAuthenticated: true,  isLoading: false }
    case 'LOGOUT':
      return { session: null,           isAuthenticated: false, isLoading: false }
    case 'HYDRATED':
      return { ...state,                                         isLoading: false }
    case 'UPDATE_SESSION':
      return { ...state, session: { ...state.session, ...action.payload } }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Rehydrate on mount — check if there's an active Supabase session
    rehydrateSession().then(session => {
      if (session) dispatch({ type: 'LOGIN',    payload: session })
      else          dispatch({ type: 'HYDRATED' })
    })

    // Listen for auth changes (token refresh, sign-out from another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        if (event === 'SIGNED_OUT') {
          dispatch({ type: 'LOGOUT' })
        } else if (
          (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
          supabaseSession
        ) {
          const session = await rehydrateSession()
          if (session) dispatch({ type: 'LOGIN', payload: session })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function login(sessionData) {
    // sessionData is already built by authService.login() — just store it
    dispatch({ type: 'LOGIN', payload: sessionData })
  }

  async function logout() {
    await supabase.auth.signOut()
    dispatch({ type: 'LOGOUT' })
  }

  function updateSession(updates) {
    dispatch({ type: 'UPDATE_SESSION', payload: updates })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateSession }}>
      {children}
    </AuthContext.Provider>
  )
}
