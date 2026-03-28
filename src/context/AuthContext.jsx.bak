import { createContext, useReducer, useEffect } from 'react'

export const AuthContext = createContext(null)

const SESSION_KEY = 'gas_session'

const initialState = {
  session: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { session: action.payload, isAuthenticated: true, isLoading: false }
    case 'LOGOUT':
      return { session: null, isAuthenticated: false, isLoading: false }
    case 'HYDRATED':
      return { ...state, isLoading: false }
    case 'UPDATE_SESSION':
      return { ...state, session: { ...state.session, ...action.payload } }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) {
        dispatch({ type: 'LOGIN', payload: JSON.parse(stored) })
      } else {
        dispatch({ type: 'HYDRATED' })
      }
    } catch {
      dispatch({ type: 'HYDRATED' })
    }
  }, [])

  function login(sessionData) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
    dispatch({ type: 'LOGIN', payload: sessionData })
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    dispatch({ type: 'LOGOUT' })
  }

  function updateSession(updates) {
    const updated = { ...state.session, ...updates }
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
    dispatch({ type: 'UPDATE_SESSION', payload: updates })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateSession }}>
      {children}
    </AuthContext.Provider>
  )
}
