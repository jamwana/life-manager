import { useState } from 'react'
import { AppProvider } from './store'
import HomePage from './components/HomePage'
import SchedulePage from './components/SchedulePage'
import ExpensePage from './components/ExpensePage'

function HomeIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path d="M3 12L12 3l9 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      {active ? (
        <>
          <rect x="3" y="4" width="18" height="18" rx="3" fill="currentColor" />
          <rect x="8" y="2" width="2" height="4" rx="1" fill="white" />
          <rect x="14" y="2" width="2" height="4" rx="1" fill="white" />
          <rect x="3" y="9" width="18" height="1.5" fill="white" />
        </>
      ) : (
        <>
          <rect x="3" y="4" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 2v4M16 2v4M3 10h18" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

function WalletIcon({ active }) {
  return (
    <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      {active ? (
        <>
          <rect x="1" y="6" width="22" height="15" rx="3" fill="currentColor" />
          <path d="M1 10h22" stroke="white" strokeWidth="1.5" />
          <circle cx="17" cy="15" r="2" fill="white" />
          <rect x="3" y="3" width="14" height="4" rx="1.5" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="1" y="6" width="22" height="15" rx="3" />
          <path d="M1 10h22M17 15h.01" strokeLinecap="round" />
          <path d="M4 6V4a1 1 0 011-1h14a1 1 0 011 1v2" />
        </>
      )}
    </svg>
  )
}

const TABS = [
  { key: 'home',     label: '首页',   Icon: HomeIcon },
  { key: 'schedule', label: '日程',   Icon: CalIcon },
  { key: 'expense',  label: '消费',   Icon: WalletIcon },
]

function Shell() {
  const [tab, setTab] = useState('home')

  return (
    <div className="app-shell">
      <div className="page-content">
        {tab === 'home'     && <HomePage />}
        {tab === 'schedule' && <SchedulePage />}
        {tab === 'expense'  && <ExpensePage />}
      </div>

      <nav className="bottom-nav">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} className={`nav-item${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>
            <Icon active={tab === key} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
