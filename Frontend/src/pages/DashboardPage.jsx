import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import {
  Calendar, BookOpen, AlertTriangle, GraduationCap, Users, School, Megaphone,
  ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, PartyPopper, CalendarDays
} from 'lucide-react';

// ─── Circular Progress ────────────────────────────────────────────────────────
function CircularProgress({ percentage, size = 80, color = 'var(--clr-primary)' }) {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox="0 0 70 70" role="img" aria-label={`${percentage}%`}>
      <circle cx="35" cy="35" r={r} fill="none" stroke="var(--clr-border)" strokeWidth="6" />
      <circle
        cx="35" cy="35" r={r} fill="none"
        stroke={color} strokeWidth="6"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 35 35)"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="35" y="40" textAnchor="middle"
        fill="var(--clr-text-primary)"
        fontSize="12" fontWeight="700" fontFamily="Outfit, sans-serif"
      >
        {percentage}%
      </text>
    </svg>
  );
}

// ─── Shared config ────────────────────────────────────────────────────────────
const holidayTypeConfig = {
  national: { label: 'National', color: '#ef4444', bg: '#fee2e2' },
  regional: { label: 'Regional', color: '#f97316', bg: '#ffedd5' },
  school:   { label: 'School',   color: '#8b5cf6', bg: '#ede9fe' },
  exam:     { label: 'Exam',     color: '#0ea5e9', bg: '#e0f2fe' },
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function toLocalISODate(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDurationDays(startDate, endDate) {
  return Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
}

// ─── Mini Holiday Calendar ────────────────────────────────────────────────────
function HolidayCalendar({ isAdmin }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [holidays, setHolidays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [form, setForm] = useState({ title: '', startDate: '', endDate: '', description: '', type: 'school' });
  const [saving, setSaving] = useState(false);

  const fetchHolidays = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/holiday?year=${viewYear}&month=${viewMonth + 1}`);
      if (res.ok) {
        const data = await res.json();
        setHolidays(data.holidays || []);
      }
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
    }
  }, [viewYear, viewMonth]);

  useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

  // Build day → holidays map (range-aware, clamped to view month)
  const holidayDayMap = {};
  holidays.forEach(h => {
    const start = new Date(h.startDate);
    const end = new Date(h.endDate);
    const clampStart = new Date(Math.max(start.getTime(), new Date(viewYear, viewMonth, 1).getTime()));
    const clampEnd   = new Date(Math.min(end.getTime(),   new Date(viewYear, viewMonth + 1, 0).getTime()));
    for (let d = new Date(clampStart); d <= clampEnd; d.setDate(d.getDate() + 1)) {
      const dayNum = d.getDate();
      if (!holidayDayMap[dayNum]) holidayDayMap[dayNum] = [];
      holidayDayMap[dayNum].push(h);
    }
  });

  const firstDay   = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayKey   = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const handlePrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const handleNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day) => {
    setSelectedDay({ day, date: new Date(viewYear, viewMonth, day), holidays: holidayDayMap[day] || [] });
    setShowModal(true);
  };

  const openAddForm = (startDateStr = '') => {
    setEditingHoliday(null);
    setForm({ title: '', startDate: startDateStr, endDate: startDateStr, description: '', type: 'school' });
    setShowForm(true);
    setShowModal(false);
  };

  const openEditForm = (holiday) => {
    setEditingHoliday(holiday);
    setForm({
      title: holiday.title,
      startDate: toLocalISODate(holiday.startDate),
      endDate: toLocalISODate(holiday.endDate),
      description: holiday.description || '',
      type: holiday.type || 'school',
    });
    setShowForm(true);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this holiday?')) return;
    try {
      const res = await apiFetch(`/api/holiday/${id}`, { method: 'DELETE' });
      if (res.ok) { fetchHolidays(); setShowModal(false); }
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.endDate < form.startDate) { alert('End date must be on or after start date.'); return; }
    setSaving(true);
    try {
      const url = editingHoliday ? `/api/holiday/${editingHoliday._id}` : '/api/holiday';
      const method = editingHoliday ? 'PATCH' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { fetchHolidays(); setShowForm(false); setEditingHoliday(null); }
      else { const err = await res.json(); alert(err.message || 'Failed to save'); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Calendar size={20} strokeWidth={1.5} /> School Calendar
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button className="btn-icon" onClick={handlePrev} id="cal-prev-btn" aria-label="Previous month">
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '0.82rem', minWidth: '110px', textAlign: 'center', color: 'var(--clr-text-primary)' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button className="btn-icon" onClick={handleNext} id="cal-next-btn" aria-label="Next month">
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {DAY_NAMES.map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: i === 0 ? 'var(--clr-danger)' : 'var(--clr-text-muted)', padding: '3px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />;
          const key = `${viewYear}-${viewMonth}-${day}`;
          const dayHolidays = holidayDayMap[day] || [];
          const isToday = key === todayKey;
          const isSunday = (idx % 7) === 0;
          const hasHoliday = dayHolidays.length > 0;
          const primaryCfg = hasHoliday ? (holidayTypeConfig[dayHolidays[0].type] || holidayTypeConfig.school) : null;

          // Range border-radius
          const isRangeStart = hasHoliday && dayHolidays.some(h => {
            const s = new Date(h.startDate);
            return s.getFullYear() === viewYear && s.getMonth() === viewMonth && s.getDate() === day;
          });
          const isRangeEnd = hasHoliday && dayHolidays.some(h => {
            const e = new Date(h.endDate);
            return e.getFullYear() === viewYear && e.getMonth() === viewMonth && e.getDate() === day;
          });
          let borderRadius = '8px';
          if (hasHoliday && !isRangeStart && !isRangeEnd) borderRadius = '0';
          else if (hasHoliday && isRangeStart && !isRangeEnd) borderRadius = '8px 0 0 8px';
          else if (hasHoliday && !isRangeStart && isRangeEnd) borderRadius = '0 8px 8px 0';

          return (
            <div
              key={day}
              id={`cal-day-${viewYear}-${viewMonth + 1}-${day}`}
              onClick={() => handleDayClick(day)}
              style={{
                aspectRatio: '1',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRadius,
                cursor: 'pointer',
                background: hasHoliday ? primaryCfg.bg : isToday ? 'var(--clr-primary)' : 'transparent',
                border: isToday && !hasHoliday ? '2px solid var(--clr-primary)' : '2px solid transparent',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.93)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleDayClick(day)}
              title={hasHoliday ? dayHolidays.map(h => h.title).join(', ') : undefined}
            >
              <span style={{
                fontSize: '0.72rem',
                fontWeight: isToday || hasHoliday ? 700 : 500,
                color: hasHoliday ? primaryCfg.color : isToday ? 'white' : isSunday ? 'var(--clr-danger)' : 'var(--clr-text-primary)',
              }}>
                {day}
              </span>
              {hasHoliday && isRangeStart && (
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: primaryCfg.color, marginTop: '2px' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--clr-border)' }}>
        {Object.entries(holidayTypeConfig).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '2px', background: val.color }} />
            <span style={{ fontSize: '0.62rem', color: 'var(--clr-text-muted)' }}>{val.label}</span>
          </div>
        ))}
      </div>

      {/* Day detail modal */}
      {showModal && selectedDay && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} strokeWidth={1.5} />
                {selectedDay.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close"><X size={18} /></button>
            </div>

            {selectedDay.holidays.length === 0 ? (
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem', padding: '8px 0' }}>No events on this day.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedDay.holidays.map(h => {
                  const cfg = holidayTypeConfig[h.type] || holidayTypeConfig.school;
                  const duration = getDurationDays(h.startDate, h.endDate);
                  return (
                    <div key={h._id} style={{ padding: '12px 14px', borderRadius: '10px', background: cfg.bg, borderLeft: `3px solid ${cfg.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text-primary)' }}>{h.title}</div>
                          <div style={{ fontSize: '0.74rem', color: cfg.color, marginTop: '2px', fontWeight: 600 }}>
                            {new Date(h.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            {duration > 1 && ` – ${new Date(h.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                            {duration > 1 && ` · ${duration} days`}
                          </div>
                          {h.description && <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-secondary)', marginTop: '4px' }}>{h.description}</div>}
                          <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: cfg.color, color: 'white' }}>
                            {cfg.label}
                          </span>
                        </div>
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEditForm(h)} id={`edit-holiday-${h._id}`} aria-label="Edit">
                              <Pencil size={13} strokeWidth={1.5} />
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(h._id)} id={`delete-holiday-${h._id}`} aria-label="Delete" style={{ color: 'var(--clr-danger)' }}>
                              <Trash2 size={13} strokeWidth={1.5} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {isAdmin && (
              <div style={{ marginTop: '12px' }}>
                <button
                  id="add-holiday-from-day-btn"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                  onClick={() => {
                    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(selectedDay.day).padStart(2, '0')}`;
                    openAddForm(iso);
                  }}
                >
                  <Plus size={14} strokeWidth={2} /> Add Holiday / Exam
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="holiday-form-title" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="holiday-form-title">
                {editingHoliday ? 'Edit Holiday / Exam' : 'Add Holiday / Exam'}
              </h2>
              <button className="btn-icon" onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="hol-title">Title *</label>
                <input id="hol-title" className="form-input" placeholder="e.g. Diwali / Final Exams" required
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              {/* Date range */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="hol-start">Start Date *</label>
                  <input id="hol-start" type="date" className="form-input" required
                    value={form.startDate}
                    onChange={e => {
                      const val = e.target.value;
                      setForm(f => ({ ...f, startDate: val, endDate: f.endDate < val ? val : f.endDate }));
                    }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="hol-end">End Date *</label>
                  <input id="hol-end" type="date" className="form-input" required
                    min={form.startDate}
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>

              {/* Duration preview */}
              {form.startDate && form.endDate && form.endDate >= form.startDate && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '0.76rem', color: 'var(--clr-text-secondary)',
                  background: 'var(--clr-bg)', borderRadius: '8px', padding: '7px 12px',
                  marginBottom: '14px', marginTop: '-4px',
                }}>
                  <CalendarDays size={13} strokeWidth={1.5} color="var(--clr-primary)" />
                  <strong style={{ color: 'var(--clr-primary)' }}>
                    {getDurationDays(form.startDate, form.endDate)} day{getDurationDays(form.startDate, form.endDate) !== 1 ? 's' : ''}
                  </strong>
                  &nbsp;·&nbsp;
                  {new Date(form.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {form.startDate !== form.endDate && ` – ${new Date(form.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="hol-type">Type</label>
                  <select id="hol-type" className="form-select" value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="national">National Holiday</option>
                    <option value="regional">Regional Holiday</option>
                    <option value="school">School Holiday</option>
                    <option value="exam">Exam Period</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="hol-desc">Description (optional)</label>
                <input id="hol-desc" className="form-input" placeholder="Brief note…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" id="submit-holiday-btn" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editingHoliday ? 'Save Changes' : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Upcoming Holidays widget ─────────────────────────────────────────────────
function UpcomingHolidays() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const now = new Date();
    apiFetch(`/api/holiday?year=${now.getFullYear()}&month=${now.getMonth() + 1}`)
      .then(res => res.json())
      .then(data => {
        const upcoming = (data.holidays || [])
          .filter(h => new Date(h.endDate) >= now)
          .slice(0, 3);
        setHolidays(upcoming);
      })
      .catch(console.error);
  }, []);

  if (holidays.length === 0) return null;

  return (
    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--clr-border)' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Upcoming Holidays
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {holidays.map(h => {
          const cfg = holidayTypeConfig[h.type] || holidayTypeConfig.school;
          const start = new Date(h.startDate);
          const duration = getDurationDays(h.startDate, h.endDate);
          return (
            <div key={h._id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                flexShrink: 0, width: 38, height: 38, borderRadius: '8px',
                background: cfg.bg, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: cfg.color, lineHeight: 1, textTransform: 'uppercase' }}>
                  {start.toLocaleString('en-IN', { month: 'short' })}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
                  {start.getDate()}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {h.title}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)' }}>
                  {cfg.label}{duration > 1 ? ` · ${duration} days` : ''}
                </div>
              </div>
              <PartyPopper size={13} strokeWidth={1.5} style={{ color: cfg.color, opacity: 0.6, flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Student Dashboard ────────────────────────────────────────────────────────
function StudentDashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/student/dashboard?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } })
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading Dashboard...</div>;
  }

  const attendanceDetails = data?.attendanceDetails || [];
  const attendanceWarnings = data?.attendanceWarnings || [];
  const recentNotices = data?.recentNotices || [];
  const latestNotice = recentNotices.length > 0 ? recentNotices[0] : null;
  const overallAttendance = attendanceDetails.length > 0
    ? Math.round(attendanceDetails.reduce((a, b) => a + b.percentage, 0) / attendanceDetails.length)
    : 0;

  return (
    <div className="fade-in-up">
      <div className="dashboard-banner-wrap" style={{
        background: 'linear-gradient(135deg, var(--clr-primary), #155fa0)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px',
        marginBottom: '28px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Good Morning,</p>
          <h2 className="dashboard-banner-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
            {user?.name}
          </h2>
          <p style={{ opacity: 0.75, fontSize: '0.88rem' }}>
            You have <strong style={{ color: '#fbbf24' }}>{attendanceWarnings.length} subject{attendanceWarnings.length !== 1 ? 's' : ''}</strong> with low attendance. Stay on track!
          </p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Overall Attendance', value: `${overallAttendance}%`, icon: <Calendar size={24} strokeWidth={1.5} />, color: '#e8f4fd' },
          { label: 'Subjects Enrolled', value: attendanceDetails.length, icon: <BookOpen size={24} strokeWidth={1.5} />, color: '#d1fae5' },
          { label: 'Attendance Warnings', value: attendanceWarnings.length, icon: <AlertTriangle size={24} strokeWidth={1.5} />, color: '#fef3c7' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} strokeWidth={1.5} /> Attendance Summary
            </h3>
            {attendanceWarnings.length > 0 && (
              <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} strokeWidth={2} /> {attendanceWarnings.length} Low
              </span>
            )}
          </div>
          {attendanceDetails.length === 0 ? (
            <p style={{ padding: '20px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }}>No attendance records found</p>
          ) : (
            attendanceDetails.map((item, i) => {
              const color = item.percentage >= 75 ? 'var(--clr-secondary)' : 'var(--clr-danger)';
              return (
                <div className="attendance-item" key={i}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--clr-text-primary)', minWidth: '140px' }}>{item.subjectName}</span>
                  <div className="attendance-bar-wrap">
                    <div className="attendance-bar-bg">
                      <div className="attendance-bar-fill" style={{ width: `${item.percentage}%`, background: color }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color, minWidth: '48px', textAlign: 'right' }}>{item.percentage}%</span>
                </div>
              );
            })
          )}
        </div>

        {/* Notice Board */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={20} strokeWidth={1.5} /> Notice Board
            </h3>
          </div>

          {!latestNotice ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: '10px' }}>
              <div style={{ opacity: 0.2 }}><Megaphone size={40} strokeWidth={1} /></div>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>No active notices at this time</p>
            </div>
          ) : (
            <div style={{
              borderRadius: '12px',
              border: `1px solid var(--clr-primary)30`,
              borderLeft: `4px solid var(--clr-primary)`,
              padding: '16px',
              background: 'var(--clr-bg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                  background: `var(--clr-primary-light)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--clr-primary)',
                }}>
                  <Megaphone size={20} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--clr-text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                    {latestNotice.title}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
                    {latestNotice.description.slice(0, 200)}{latestNotice.description.length > 200 ? '…' : ''}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
                      {new Date(latestNotice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {latestNotice.expiresAt && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px', borderRadius: '20px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                        Expires: {new Date(latestNotice.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Admin / Faculty Dashboard ────────────────────────────────────────────────
function AdminDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    apiFetch('/api/admin/dashboard-stats')
      .then(res => { if (!res.ok) throw new Error('Failed to fetch'); return res.json(); })
      .then(data => { setStats(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading Dashboard...</div>;
  }

  const { totalStudents = 0, totalFaculty = 0, totalClasses = 0, averageAttendance = 0, recentNotices = [] } = stats || {};
  const latestNotice = recentNotices.length > 0 ? recentNotices[0] : null;

  const audienceConfig = {
    all:     { label: 'Everyone', cls: 'badge-primary', color: 'var(--clr-primary)' },
    student: { label: 'Students', cls: 'badge-success', color: 'var(--clr-secondary)' },
    faculty: { label: 'Faculty',  cls: 'badge-accent',  color: 'var(--clr-accent)' },
  };

  const cards = [
    { label: 'Total Students', value: totalStudents, icon: <GraduationCap size={24} strokeWidth={1.5} />, color: '#e8f4fd' },
    { label: 'Total Faculty', value: totalFaculty, icon: <Users size={24} strokeWidth={1.5} />, color: '#d1fae5' },
    { label: 'Total Classes', value: totalClasses, icon: <School size={24} strokeWidth={1.5} />, color: '#ede9fe' },
    { label: 'Avg Attendance', value: `${averageAttendance}%`, icon: <Calendar size={24} strokeWidth={1.5} />, color: '#fef3c7' },
  ];

  return (
    <div className="fade-in-up">
      {/* Banner */}
      <div className="dashboard-banner-wrap" style={{
        background: 'linear-gradient(135deg, #155fa0, #8b5cf6)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px',
        marginBottom: '28px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '4px' }}>Welcome back,</p>
          <h2 className="dashboard-banner-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
            {user?.name}
          </h2>
          <p style={{ opacity: 0.75, fontSize: '0.88rem' }}>Managing {totalStudents} students across {totalClasses} classes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {cards.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid: Calendar + Notice */}
      <div className="dashboard-grid">
        {/* School Calendar */}
        <HolidayCalendar isAdmin={isAdmin} />

        {/* Notice Board */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Megaphone size={20} strokeWidth={1.5} /> Notice Board
            </h3>
            {latestNotice && (
              <span className={`badge ${audienceConfig[latestNotice.audience]?.cls || 'badge-primary'}`}>
                {audienceConfig[latestNotice.audience]?.label}
              </span>
            )}
          </div>

          {!latestNotice ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: '10px' }}>
              <div style={{ opacity: 0.2 }}><Megaphone size={40} strokeWidth={1} /></div>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>No active notices at this time</p>
            </div>
          ) : (
            <div style={{
              borderRadius: '12px',
              border: `1px solid ${audienceConfig[latestNotice.audience]?.color || 'var(--clr-border)'}30`,
              borderLeft: `4px solid ${audienceConfig[latestNotice.audience]?.color || 'var(--clr-primary)'}`,
              padding: '16px',
              background: 'var(--clr-bg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                  background: `${audienceConfig[latestNotice.audience]?.color || 'var(--clr-primary)'}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: audienceConfig[latestNotice.audience]?.color || 'var(--clr-primary)',
                }}>
                  <Megaphone size={20} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--clr-text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                    {latestNotice.title}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
                    {latestNotice.description.slice(0, 200)}{latestNotice.description.length > 200 ? '…' : ''}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
                      {new Date(latestNotice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {latestNotice.expiresAt && (
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 7px', borderRadius: '20px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                        Expires: {new Date(latestNotice.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <UpcomingHolidays />
        </div>
      </div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  return user?.role === 'student'
    ? <StudentDashboard user={user} />
    : <AdminDashboard user={user} />;
}
