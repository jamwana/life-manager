import { useState, useEffect, createContext, useContext } from 'react'
import { v4 as uuidv4 } from 'uuid'

const AppContext = createContext(null)

const SCHEDULE_KEY = 'lm_schedules'
const EXPENSE_KEY = 'lm_expenses'

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function AppProvider({ children }) {
  const [schedules, setSchedules] = useState(() => load(SCHEDULE_KEY, []))
  const [expenses, setExpenses] = useState(() => load(EXPENSE_KEY, []))

  useEffect(() => save(SCHEDULE_KEY, schedules), [schedules])
  useEffect(() => save(EXPENSE_KEY, expenses), [expenses])

  // ── Schedule operations ──────────────────────────────────────────
  function addSchedule(item) {
    setSchedules(prev => [...prev, { ...item, id: uuidv4() }])
  }
  function updateSchedule(id, patch) {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }
  function deleteSchedule(id) {
    setSchedules(prev => prev.filter(s => s.id !== id))
  }
  function toggleScheduleDone(id) {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s))
  }

  // ── Expense operations ───────────────────────────────────────────
  function addExpense(item) {
    setExpenses(prev => [...prev, { ...item, id: uuidv4() }])
  }
  function updateExpense(id, patch) {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e))
  }
  function deleteExpense(id) {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  return (
    <AppContext.Provider value={{
      schedules, addSchedule, updateSchedule, deleteSchedule, toggleScheduleDone,
      expenses, addExpense, updateExpense, deleteExpense
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
