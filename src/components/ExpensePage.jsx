import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { useApp } from '../store'
import { Trash2, Pencil, TrendingUp, TrendingDown, Plus, Wallet } from 'lucide-react'

export const CATEGORIES = [
  { key: 'food',      label: '餐饮',   emoji: '🍜', color: '#f87171' },
  { key: 'transport', label: '交通',   emoji: '🚌', color: '#fbbf24' },
  { key: 'shopping',  label: '购物',   emoji: '🛍️', color: '#a78bfa' },
  { key: 'ent',       label: '娱乐',   emoji: '🎮', color: '#34d399' },
  { key: 'health',    label: '医疗',   emoji: '💊', color: '#60a5fa' },
  { key: 'housing',   label: '居住',   emoji: '🏠', color: '#f472b6' },
  { key: 'edu',       label: '教育',   emoji: '📚', color: '#fb923c' },
  { key: 'salary',    label: '工资',   emoji: '💰', color: '#34d399' },
  { key: 'invest',    label: '投资',   emoji: '📈', color: '#2dd4bf' },
  { key: 'other',     label: '其他',   emoji: '💡', color: '#94a3b8' },
]

function catInfo(key) {
  return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1]
}

const EMPTY_FORM = {
  type: 'out',
  amount: '',
  category: 'food',
  note: '',
  date: dayjs().format('YYYY-MM-DD'),
}

function ExpenseModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const cats = form.type === 'out'
    ? CATEGORIES.filter(c => !['salary', 'invest'].includes(c.key))
    : CATEGORIES.filter(c => ['salary', 'invest', 'other'].includes(c.key))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{initial?.id ? '编辑记录' : '添加记录'}</div>

        <div className="type-toggle">
          <button className={`type-btn${form.type === 'out' ? ' active' : ''}`} onClick={() => set('type', 'out')}>支出</button>
          <button className={`type-btn${form.type === 'in' ? ' active' : ''}`} onClick={() => set('type', 'in')}>收入</button>
        </div>

        <div className="form-group">
          <label className="form-label">金额 (¥)</label>
          <input
            className="form-input"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            placeholder="0.00"
            style={{ fontSize: 20, fontWeight: 700 }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">分类</label>
          <div className="cat-pills">
            {cats.map(c => (
              <button
                key={c.key}
                className={`cat-pill${form.category === c.key ? ' active' : ''}`}
                onClick={() => set('category', c.key)}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">日期</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">备注（选填）</label>
            <input className="form-input" value={form.note} onChange={e => set('note', e.target.value)} placeholder="备注..." />
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
          <button
            className="btn btn-primary"
            onClick={() => { if (form.amount && parseFloat(form.amount) > 0) onSave(form) }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

const CHART_TOOLTIP_STYLE = {
  background: '#1a1d27', border: '1px solid #2e3250', borderRadius: 8, color: '#e2e8f0', fontSize: 12
}

export default function ExpensePage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [viewMonth, setViewMonth] = useState(dayjs().format('YYYY-MM'))
  const [chartTab, setChartTab] = useState('bar') // bar | pie

  const monthExpenses = useMemo(() =>
    expenses.filter(e => e.date.startsWith(viewMonth))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, viewMonth]
  )

  const stats = useMemo(() => {
    const income  = monthExpenses.filter(e => e.type === 'in').reduce((s, e) => s + parseFloat(e.amount), 0)
    const expense = monthExpenses.filter(e => e.type === 'out').reduce((s, e) => s + parseFloat(e.amount), 0)
    return { income, expense, balance: income - expense }
  }, [monthExpenses])

  // Daily bar chart data (last 14 days of selected month)
  const barData = useMemo(() => {
    const days = []
    const base = dayjs(viewMonth + '-01')
    const daysInMonth = base.daysInMonth()
    for (let i = 1; i <= daysInMonth; i++) {
      const d = base.date(i).format('YYYY-MM-DD')
      const day = expenses.filter(e => e.date === d)
      days.push({
        name: String(i),
        支出: parseFloat(day.filter(e => e.type === 'out').reduce((s, e) => s + parseFloat(e.amount), 0).toFixed(2)),
        收入: parseFloat(day.filter(e => e.type === 'in').reduce((s, e) => s + parseFloat(e.amount), 0).toFixed(2)),
      })
    }
    return days
  }, [expenses, viewMonth])

  // Pie chart: expense by category
  const pieData = useMemo(() => {
    const map = {}
    monthExpenses.filter(e => e.type === 'out').forEach(e => {
      map[e.category] = (map[e.category] || 0) + parseFloat(e.amount)
    })
    return Object.entries(map).map(([key, value]) => ({
      name: catInfo(key).label,
      value: parseFloat(value.toFixed(2)),
      color: catInfo(key).color,
    }))
  }, [monthExpenses])

  function handleSave(form) {
    const data = { ...form, amount: parseFloat(parseFloat(form.amount).toFixed(2)) }
    if (form.id) updateExpense(form.id, data)
    else addExpense(data)
    setShowModal(false); setEditItem(null)
  }

  function fmt(n) { return '¥' + Math.abs(n).toFixed(2) }

  // Group by date for display
  const grouped = useMemo(() => {
    const map = {}
    monthExpenses.forEach(e => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [monthExpenses])

  const cursorMonth = dayjs(viewMonth + '-01')

  return (
    <>
      <div className="section-header">
        <span className="section-title">消费记录</span>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowModal(true) }}>
          <Plus size={14} /> 添加
        </button>
      </div>

      {/* Month selector */}
      <div className="cal-header" style={{ marginBottom: 16 }}>
        <button className="cal-nav" onClick={() => setViewMonth(cursorMonth.subtract(1, 'month').format('YYYY-MM'))}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{cursorMonth.format('YYYY年 M月')}</span>
        <button className="cal-nav" onClick={() => setViewMonth(cursorMonth.add(1, 'month').format('YYYY-MM'))}>›</button>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-label">收入</div>
          <div className="stat-value income">{fmt(stats.income)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">支出</div>
          <div className="stat-value expense">{fmt(stats.expense)}</div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="stat-label">结余</div>
        <div className="stat-value balance" style={{ fontSize: 28 }}>
          {stats.balance >= 0 ? '+' : '-'}{fmt(stats.balance)}
        </div>
      </div>

      {/* Chart */}
      {monthExpenses.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="type-toggle" style={{ marginBottom: 12 }}>
            <button className={`type-btn${chartTab === 'bar' ? ' active' : ''}`} onClick={() => setChartTab('bar')}>每日趋势</button>
            <button className={`type-btn${chartTab === 'pie' ? ' active' : ''}`} onClick={() => setChartTab('pie')}>分类占比</button>
          </div>
          {chartTab === 'bar' ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="支出" fill="#f87171" radius={[3,3,0,0]} maxBarSize={12} />
                  <Bar dataKey="收入" fill="#34d399" radius={[3,3,0,0]} maxBarSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : pieData.length > 0 ? (
            <div className="chart-wrap" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" outerRadius={75} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={v => `¥${v}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 20 }}><p>暂无支出数据</p></div>
          )}
        </div>
      )}

      {/* List */}
      {grouped.length === 0 ? (
        <div className="empty-state">
          <Wallet size={48} />
          <p>本月暂无记录<br />点击右上角添加</p>
        </div>
      ) : (
        grouped.map(([date, items]) => {
          const dayOut = items.filter(e => e.type === 'out').reduce((s, e) => s + parseFloat(e.amount), 0)
          const dayIn  = items.filter(e => e.type === 'in').reduce((s, e) => s + parseFloat(e.amount), 0)
          return (
            <div key={date} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ fontWeight: 700 }}>{dayjs(date).format('M月D日 dddd')}</span>
                <span style={{ color: 'var(--text2)' }}>
                  {dayIn > 0 && <span style={{ color: 'var(--green)', marginRight: 8 }}>+{fmt(dayIn)}</span>}
                  {dayOut > 0 && <span style={{ color: 'var(--red)' }}>-{fmt(dayOut)}</span>}
                </span>
              </div>
              {items.map(e => {
                const cat = catInfo(e.category)
                return (
                  <div key={e.id} className="expense-item">
                    <div className="expense-icon" style={{ background: cat.color + '22' }}>
                      {cat.emoji}
                    </div>
                    <div className="expense-body">
                      <div className="expense-name">{e.note || cat.label}</div>
                      <div className="expense-cat">{cat.label}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`expense-amount ${e.type}`}>
                        {e.type === 'in' ? '+' : '-'}{fmt(e.amount)}
                      </span>
                      <button className="icon-btn" onClick={() => { setEditItem(e); setShowModal(true) }}><Pencil size={13} /></button>
                      <button className="icon-btn" style={{ color: 'var(--red)' }} onClick={() => deleteExpense(e.id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })
      )}

      {showModal && (
        <ExpenseModal
          initial={editItem ? { ...editItem } : null}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null) }}
        />
      )}
    </>
  )
}
