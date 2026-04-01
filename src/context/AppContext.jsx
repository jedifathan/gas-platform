import { createContext, useReducer, useCallback } from 'react'

export const AppContext = createContext(null)

// Derive current month dynamically so the dashboard always opens on today's period
function currentPeriod() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const initialState = {
  toasts:       [],
  globalPeriod: currentPeriod(),   // ← was hardcoded '2025-02'
  sidebarOpen:  true,
}

function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] }
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) }
    case 'SET_PERIOD':
      return { ...state, globalPeriod: action.payload }
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } })
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), duration)
  }, [])

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id })
  }, [])

  const setPeriod = useCallback((period) => {
    dispatch({ type: 'SET_PERIOD', payload: period })
  }, [])

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' })
  }, [])

  return (
    <AppContext.Provider value={{ ...state, addToast, removeToast, setPeriod, toggleSidebar }}>
      {children}
    </AppContext.Provider>
  )
}
