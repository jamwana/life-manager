import { useMemo } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useApp } from '../store'
import { CATEGORIES } from './ExpensePage'

dayjs.locale('zh-cn')

function catInfo(key) {
  return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1]
}

export default function HomePage() {
  const { schedules, expenses } = useApp()
  const today = dayjs().format('YYYY-MM-DD')
  const thisMonth = dayjs().format('YYYY-MM')

  const todaySchedules = useMemo(() =>
    schedules.filter(s => s.date === today).sort((a, b) => {
      if (a.time && b.time) return a.time.localeCompare(b.time)
      if (a.time) return -1; if (b.time) return 1; return 0
    }),
    [schedules, today]
  )

  const monthStats = useMemo(() => {
    const me = expenses.filter(e => e.date.startsWith(thisMonth))
    const income  = me.filter(e => e.type === 'in').reduce((s, e) => s + parseFloat(e.amount), 0)
    const expense = me.filter(e => e.type === 'out').reduce((s, e) => s + parseFloat(e.amount), 0)
    return { income, expense, balance: income - expense }
  }, [expenses, thisMonth])

  const todayExpenses = useMemo(() =>
    expenses.filter(e => e.date === today).slice(0, 5),
    [expenses, today]
  )

  const doneCount   = todaySchedules.filter(s => s.done).length
  const totalCount  = todaySchedules.length
  const progress    = totalCount > 0 ? (doneCount / totalCount) : 0

  const priColor = { high: 'var(--red)', mid: 'var(--yellow)', low: 'var(--green)' }

  return (
    <>
      {/* Today header */}
      <div className="today-bar">
        <div>
          <div className="date-big">{dayjs().date()}</div>
        </div>
        <div>
          <div className="date-weekday">{dayjs().format('dddd')}</div>
          <div className="date-detail">{dayjs().format('YYYY年M月')} · 今天</div>
        </div>
      </div>

      {/* Month finance overview */}
      <div className="section-header">
        <span style={{ fontSize: 15, fontWeight: 700 }}>本月财务</span>
      </div>
      <div className="overview-row">
        <div className="overview-chip">
          <div className="chip-label">收入</div>
          <div className="chip-value" style={{ color: 'var(--green)' }}>¥{monthStats.income.toFixed(0)}</div>
        </div>
        <div className="overview-chip">
          <div className="chip-label">支出</div>
          <div className="chip-value" style={{ color: 'var(--red)' }}>¥{monthStats.expense.toFixed(0)}</div>
        </div>
        <div className="overview-chip">
          <div className="chip-label">结余</div>
          <div className="chip-value" style={{ color: 'var(--accent)' }}>
            {monthStats.balance >= 0 ? '+' : ''}¥{monthStats.balance.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Today schedule progress */}
      <div className="section-header" style={{ marginTop: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>今日日程</span>
        <span style={{ fontSize: 12, color: 'var(--text2)' }}>{doneCount}/{totalCount} 完成</span>
      </div>

      {totalCount > 0 && (
        <div style={{ background: 'var(--surface2)', borderRadius: 99, height: 6, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, var(--accent), #a78bfa)',
            borderRadius: 99,
            transition: 'width .4s ease'
          }} />
        </div>
      )}

      {todaySchedules.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text2)', padding: '24px 16px', fontSize: 13 }}>
          今天没有安排，好好休息 ☕
        </div>
      ) : (
        <div className="card">
          {todaySchedules.slice(0, 5).map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: s.done ? 'var(--green)' : priColor[s.priority]
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, textDecoration: s.done ? 'line-through' : 'none', color: s.done ? 'var(--text2)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.title}
                </div>
                {s.time && <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.time}</div>}
              </div>
            </div>
          ))}
          {todaySchedules.length > 5 && (
            <div style={{ fontSize: 12, color: 'var(--text2)', paddingTop: 8, textAlign: 'center' }}>
              还有 {todaySchedules.length - 5} 项...
            </div>
          )}
        </div>
      )}

      {/* Today expenses */}
      <div className="section-header" style={{ marginTop: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>今日消费</span>
      </div>
      {todayExpenses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text2)', padding: '24px 16px', fontSize: 13 }}>
          今天还没有消费记录
        </div>
      ) : (
        <div className="card">
          {todayExpenses.map(e => {
            const cat = catInfo(e.category)
            return (
              <div key={e.id} className="expense-item">
                <div className="expense-icon" style={{ background: cat.color + '22' }}>{cat.emoji}</div>
                <div className="expense-body">
                  <div className="expense-name">{e.note || cat.label}</div>
                  <div className="expense-cat">{cat.label}</div>
                </div>
                <span className={`expense-amount ${e.type}`}>
                  {e.type === 'in' ? '+' : '-'}¥{parseFloat(e.amount).toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
