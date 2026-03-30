import { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import { useApp } from '../store'
import { Pencil, Trash2, Check, Plus, Calendar, Clock, Flag } from 'lucide-react'

const DAYS_OF_WEEK = ['日', '一', '二', '三', '四', '五', '六']
const PRIORITIES = [
  { value: 'high', label: '高', cls: 'pri-high' },
  { value: 'mid',  label: '中', cls: 'pri-mid' },
  { value: 'low',  label: '低', cls: 'pri-low' },
]

function MiniCalendar({ selected, onSelect, schedules }) {
  const [cursor, setCursor] = useState(dayjs(selected).startOf('month'))

  const days = useMemo(() => {
    const start = cursor.startOf('month').day()
    const daysInMonth = cursor.daysInMonth()
    const prev = cursor.subtract(1, 'month')
    const prevDays = prev.daysInMonth()
    const cells = []
    for (let i = start - 1; i >= 0; i--) {
      cells.push({ d: prev.date(prevDays - i), current: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ d: cursor.date(i), current: true })
    }
    const remaining = 42 - cells.length
    const next = cursor.add(1, 'month')
    for (let i = 1; i <= remaining; i++) {
      cells.push({ d: next.date(i), current: false })
    }
    return cells
  }, [cursor])

  const hasEvent = (d) => schedules.some(s => s.date === d.format('YYYY-MM-DD'))

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="cal-header">
        <button className="cal-nav" onClick={() => setCursor(c => c.subtract(1, 'month'))}>‹</button>
        <span className="month-label">{cursor.format('YYYY年 M月')}</span>
        <button className="cal-nav" onClick={() => setCursor(c => c.add(1, 'month'))}>›</button>
      </div>
      <div className="cal-grid">
        {DAYS_OF_WEEK.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {days.map(({ d, current }, i) => {
          const key = d.format('YYYY-MM-DD')
          const isToday = d.isSame(dayjs(), 'day')
          const isSelected = key === selected
          return (
            <div
              key={i}
              className={`cal-day${!current ? ' other-month' : ''}${isToday && !isSelected ? ' today' : ''}${isSelected ? ' selected' : ''}`}
              onClick={() => onSelect(key)}
            >
              {d.date()}
              {hasEvent(d) && !isSelected && <span className="dot" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const EMPTY_FORM = { title: '', date: dayjs().format('YYYY-MM-DD'), time: '', priority: 'mid', note: '' }

function ScheduleModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{initial?.id ? '编辑日程' : '添加日程'}</div>

        <div className="form-group">
          <label className="form-label">标题</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="日程标题" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">日期</label>
            <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">时间（选填）</label>
            <input className="form-input" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">优先级</label>
          <div className="cat-pills">
            {PRIORITIES.map(p => (
              <button key={p.value} className={`cat-pill${form.priority === p.value ? ' active' : ''}`} onClick={() => set('priority', p.value)}>
                {p.label}优先
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">备注（选填）</label>
          <textarea className="form-input" rows={3} value={form.note} onChange={e => set('note', e.target.value)} placeholder="备注信息..." style={{ resize: 'none' }} />
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={() => { if (form.title.trim()) onSave(form) }}>保存</button>
        </div>
      </div>
    </div>
  )
}

export default function SchedulePage() {
  const { schedules, addSchedule, updateSchedule, deleteSchedule, toggleScheduleDone } = useApp()
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)

  const daySchedules = useMemo(() =>
    schedules
      .filter(s => s.date === selectedDate)
      .sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time)
        if (a.time) return -1
        if (b.time) return 1
        const order = { high: 0, mid: 1, low: 2 }
        return order[a.priority] - order[b.priority]
      }),
    [schedules, selectedDate]
  )

  function handleSave(form) {
    if (form.id) updateSchedule(form.id, form)
    else addSchedule(form)
    setShowModal(false)
    setEditItem(null)
  }

  function openEdit(item) { setEditItem(item); setShowModal(true) }

  const priCls = { high: 'pri-high', mid: 'pri-mid', low: 'pri-low' }
  const priLabel = { high: '高', mid: '中', low: '低' }

  return (
    <>
      <div className="section-header">
        <span className="section-title">日程安排</span>
        <button className="btn btn-primary btn-sm" onClick={() => { setEditItem(null); setShowModal(true) }}>
          <Plus size={14} /> 添加
        </button>
      </div>

      <MiniCalendar selected={selectedDate} onSelect={setSelectedDate} schedules={schedules} />

      <div className="card">
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, fontWeight: 600 }}>
          {dayjs(selectedDate).format('M月D日')} · {daySchedules.length} 项日程
        </div>

        {daySchedules.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>当天暂无日程<br />点击右上角添加</p>
          </div>
        ) : (
          daySchedules.map(s => (
            <div className="schedule-item" key={s.id}>
              <button
                className={`schedule-check${s.done ? ' done' : ''}`}
                onClick={() => toggleScheduleDone(s.id)}
              >
                {s.done && <Check size={12} color="#fff" strokeWidth={3} />}
              </button>
              <div className="schedule-body">
                <div className={`schedule-title${s.done ? ' done' : ''}`}>{s.title}</div>
                <div className="schedule-meta">
                  {s.time && <><Clock size={11} />{s.time}</>}
                  <span className={priCls[s.priority]}>
                    <Flag size={11} style={{ display: 'inline', marginRight: 2 }} />{priLabel[s.priority]}
                  </span>
                  {s.note && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{s.note}</span>}
                </div>
              </div>
              <div className="schedule-actions">
                <button className="icon-btn" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                <button className="icon-btn" style={{ color: 'var(--red)' }} onClick={() => deleteSchedule(s.id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <ScheduleModal
          initial={editItem ? { ...editItem } : { ...EMPTY_FORM, date: selectedDate }}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null) }}
        />
      )}
    </>
  )
}
