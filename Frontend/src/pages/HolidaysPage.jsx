import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CalendarDays, ChevronLeft, ChevronRight, PartyPopper,
  Plus, Pencil, Trash2, X, Search
} from 'lucide-react';

const holidayTypeConfig = {
  national: { label: 'National', color: '#ef4444', bg: '#fee2e2', badge: 'badge-danger' },
  regional: { label: 'Regional', color: '#f97316', bg: '#ffedd5', badge: 'badge-warning' },
  school:   { label: 'School',   color: '#8b5cf6', bg: '#ede9fe', badge: 'badge-accent' },
  exam:     { label: 'Exam',     color: '#0ea5e9', bg: '#e0f2fe', badge: 'badge-primary' },
};

const monthNames = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const dayNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function toLocalISODate(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateRange(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  const sameDay = s.toDateString() === e.toDateString();
  if (sameDay) {
    return s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return `${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function getDurationDays(startDate, endDate) {
  const diff = new Date(endDate) - new Date(startDate);
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HolidaysPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modal / form state
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [form, setForm] = useState({ title: '', startDate: '', endDate: '', description: '', type: 'school' });
  const [saving, setSaving] = useState(false);

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/holiday?year=${viewYear}&month=${viewMonth + 1}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setHolidays(data.holidays || []);
      }
    } catch (err) {
      console.error('Failed to fetch holidays:', err);
    } finally {
      setLoading(false);
    }
  }, [viewYear, viewMonth]);

  useEffect(() => { fetchHolidays(); }, [fetchHolidays]);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const handlePrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const handleNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // ── Calendar grid helpers ───────────────────────────────────────────────────
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Build a set of days that have holidays spanning them
  // holidayDayMap[dayNum] = array of holidays overlapping that day
  const holidayDayMap = {};
  holidays.forEach(h => {
    const start = new Date(h.startDate);
    const end = new Date(h.endDate);
    // Clamp to current month view
    const clampStart = new Date(Math.max(start, new Date(viewYear, viewMonth, 1)));
    const clampEnd = new Date(Math.min(end, new Date(viewYear, viewMonth + 1, 0)));
    for (let d = new Date(clampStart); d <= clampEnd; d.setDate(d.getDate() + 1)) {
      const dayNum = d.getDate();
      if (!holidayDayMap[dayNum]) holidayDayMap[dayNum] = [];
      holidayDayMap[dayNum].push(h);
    }
  });

  // ── Day click handler ────────────────────────────────────────────────────────
  const handleDayClick = (day) => {
    const dayHolidays = holidayDayMap[day] || [];
    setSelectedDay({ day, date: new Date(viewYear, viewMonth, day), holidays: dayHolidays });
    setShowDayModal(true);
  };

  // ── Form helpers ─────────────────────────────────────────────────────────────
  const openAddForm = (startDateStr = '') => {
    setEditingHoliday(null);
    setForm({ title: '', startDate: startDateStr, endDate: startDateStr, description: '', type: 'school' });
    setShowForm(true);
    setShowDayModal(false);
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
    setShowDayModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this holiday?')) return;
    try {
      const res = await fetch(`/api/holiday/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { fetchHolidays(); setShowDayModal(false); }
      else { const e = await res.json(); alert(e.message || 'Failed'); }
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.endDate < form.startDate) {
      alert('End date must be on or after start date.');
      return;
    }
    setSaving(true);
    try {
      const url = editingHoliday ? `/api/holiday/${editingHoliday._id}` : '/api/holiday';
      const method = editingHoliday ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      if (res.ok) {
        fetchHolidays();
        setShowForm(false);
        setEditingHoliday(null);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save');
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  // ── List filtering ────────────────────────────────────────────────────────────
  const filteredHolidays = holidays.filter(h => {
    const matchType = filterType === 'all' || h.type === filterType;
    const matchSearch = !searchTerm || h.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  // ── Calendar cells ────────────────────────────────────────────────────────────
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="fade-in-up">
      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarDays size={28} strokeWidth={1.5} /> School Holidays
          </h1>
          <p className="page-subtitle">
            {isAdmin ? 'Manage holidays & exam periods with date ranges' : 'View all school holidays and events'}
          </p>
        </div>
        {isAdmin && (
          <button
            id="add-holiday-btn"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            onClick={() => openAddForm()}
          >
            <Plus size={15} strokeWidth={2} /> Add Holiday / Exam
          </button>
        )}
      </div>

      {/* ── Main Layout: responsive grid (side-by-side on desktop, stacked on mobile) ── */}
      <div className="holidays-layout">

        {/* ── Calendar Panel ── */}
        <div className="card holidays-calendar-panel" style={{ padding: '24px' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button className="btn-icon" onClick={handlePrev} id="holidays-cal-prev" aria-label="Previous month">
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--clr-text-primary)' }}>
              {monthNames[viewMonth]} {viewYear}
            </h2>
            <button className="btn-icon" onClick={handleNext} id="holidays-cal-next" aria-label="Next month">
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '6px' }}>
            {dayNames.map((d, i) => (
              <div key={d} style={{
                textAlign: 'center', fontSize: '0.68rem', fontWeight: 700,
                color: i === 0 ? 'var(--clr-danger)' : 'var(--clr-text-muted)',
                padding: '5px 0',
              }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} />;
              const key = `${viewYear}-${viewMonth}-${day}`;
              const dayHolidays = holidayDayMap[day] || [];
              const isToday = key === todayKey;
              const isSunday = (idx % 7) === 0;
              const hasHoliday = dayHolidays.length > 0;
              const primaryCfg = hasHoliday ? (holidayTypeConfig[dayHolidays[0].type] || holidayTypeConfig.school) : null;

              // Determine if this day is start / middle / end of a range
              const isRangeStart = hasHoliday && dayHolidays.some(h => {
                const s = new Date(h.startDate);
                return s.getFullYear() === viewYear && s.getMonth() === viewMonth && s.getDate() === day;
              });
              const isRangeEnd = hasHoliday && dayHolidays.some(h => {
                const e = new Date(h.endDate);
                return e.getFullYear() === viewYear && e.getMonth() === viewMonth && e.getDate() === day;
              });

              let borderRadius = '8px';
              if (hasHoliday && !isRangeStart && !isRangeEnd) borderRadius = '0px'; // middle
              else if (hasHoliday && isRangeStart && !isRangeEnd) borderRadius = '8px 0 0 8px'; // start
              else if (hasHoliday && !isRangeStart && isRangeEnd) borderRadius = '0 8px 8px 0'; // end

              return (
                <div
                  key={day}
                  id={`hol-day-${viewYear}-${viewMonth + 1}-${day}`}
                  onClick={() => handleDayClick(day)}
                  style={{
                    minHeight: '48px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingTop: '6px',
                    borderRadius,
                    cursor: 'pointer',
                    background: hasHoliday
                      ? primaryCfg.bg
                      : isToday ? 'var(--clr-primary)' : 'transparent',
                    border: isToday && !hasHoliday ? '2px solid var(--clr-primary)' : '2px solid transparent',
                    transition: 'filter 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.94)'; }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && handleDayClick(day)}
                  title={hasHoliday ? dayHolidays.map(h => h.title).join(', ') : undefined}
                >
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: isToday || hasHoliday ? 700 : 400,
                    color: hasHoliday
                      ? primaryCfg.color
                      : isToday ? 'white'
                      : isSunday ? 'var(--clr-danger)'
                      : 'var(--clr-text-primary)',
                  }}>
                    {day}
                  </span>
                  {/* Show dots only at range start */}
                  {hasHoliday && isRangeStart && (
                    <div style={{ marginTop: '3px', display: 'flex', gap: '2px' }}>
                      {dayHolidays.slice(0, 2).map((h, hi) => (
                        <div key={hi} style={{
                          width: 4, height: 4, borderRadius: '50%',
                          background: (holidayTypeConfig[h.type] || holidayTypeConfig.school).color,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Type legend */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--clr-border)' }}>
            {Object.entries(holidayTypeConfig).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: 10, height: 10, borderRadius: '3px', background: val.color }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-secondary)' }}>{val.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Events List Panel ── */}
        <div className="holidays-list-panel">
          {/* Search & filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '160px' }}>
              <Search size={14} strokeWidth={1.5} style={{
                position: 'absolute', left: '10px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--clr-text-muted)', pointerEvents: 'none',
              }} />
              <input
                id="holiday-search"
                className="form-input"
                placeholder="Search…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '30px', height: '36px', fontSize: '0.82rem' }}
              />
            </div>
            <select
              id="holiday-type-filter"
              className="form-select"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{ height: '36px', fontSize: '0.82rem', width: 'auto', minWidth: '110px' }}
            >
              <option value="all">All Types</option>
              {Object.entries(holidayTypeConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* List heading */}
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            {monthNames[viewMonth]} {viewYear} — {filteredHolidays.length} event{filteredHolidays.length !== 1 ? 's' : ''}
          </div>

          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>Loading…</div>
          ) : filteredHolidays.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ opacity: 0.2, marginBottom: '10px' }}><PartyPopper size={40} strokeWidth={1} /></div>
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem' }}>
                {searchTerm || filterType !== 'all' ? 'No events match your filter.' : 'No holidays this month.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredHolidays.map(h => {
                const cfg = holidayTypeConfig[h.type] || holidayTypeConfig.school;
                const start = new Date(h.startDate);
                const end = new Date(h.endDate);
                const duration = getDurationDays(h.startDate, h.endDate);
                const isPast = end < today;
                const isOngoing = start <= today && end >= today;

                return (
                  <div key={h._id} className="card" style={{
                    padding: '14px 16px',
                    borderLeft: `4px solid ${cfg.color}`,
                    opacity: isPast ? 0.65 : 1,
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {isOngoing && (
                      <div style={{
                        position: 'absolute', top: 8, right: 10,
                        fontSize: '0.6rem', fontWeight: 700, padding: '2px 7px',
                        borderRadius: '20px', background: cfg.color, color: 'white',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                      }}>Today</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      {/* Date range badge */}
                      <div style={{
                        flexShrink: 0, borderRadius: '10px',
                        background: cfg.bg, padding: '8px 10px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', minWidth: '52px',
                      }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', lineHeight: 1 }}>
                          {start.toLocaleString('en-IN', { month: 'short' })}
                        </span>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: cfg.color, lineHeight: 1.1 }}>
                          {start.getDate()}
                        </span>
                        {duration > 1 && (
                          <>
                            <div style={{ width: '18px', height: '1px', background: cfg.color, opacity: 0.4, margin: '3px 0' }} />
                            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', lineHeight: 1 }}>
                              {end.toLocaleString('en-IN', { month: 'short' })}
                            </span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: cfg.color, lineHeight: 1.1 }}>
                              {end.getDate()}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--clr-text-primary)' }}>{h.title}</span>
                          <span className={`badge ${cfg.badge}`} style={{ fontSize: '0.62rem' }}>{cfg.label}</span>
                          {isPast && <span style={{ fontSize: '0.62rem', color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>Past</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-secondary)', marginBottom: '4px' }}>
                          {formatDateRange(h.startDate, h.endDate)}
                          {duration > 1 && (
                            <span style={{
                              marginLeft: '8px', fontSize: '0.68rem', fontWeight: 600,
                              padding: '1px 7px', borderRadius: '20px',
                              background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`,
                            }}>
                              {duration} day{duration !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {h.description && (
                          <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', lineHeight: 1.5 }}>{h.description}</p>
                        )}
                      </div>

                      {/* Admin actions */}
                      {isAdmin && (
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button id={`edit-hol-${h._id}`} className="btn btn-ghost btn-sm" onClick={() => openEditForm(h)} aria-label="Edit holiday">
                            <Pencil size={13} strokeWidth={1.5} />
                          </button>
                          <button id={`del-hol-${h._id}`} className="btn btn-ghost btn-sm" onClick={() => handleDelete(h._id)} aria-label="Delete holiday" style={{ color: 'var(--clr-danger)' }}>
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
        </div>
      </div>

      {/* ── Day Detail Modal ── */}
      {showDayModal && selectedDay && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowDayModal(false)}>
          <div className="modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={18} strokeWidth={1.5} />
                {selectedDay.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>
              <button className="btn-icon" onClick={() => setShowDayModal(false)} aria-label="Close"><X size={18} /></button>
            </div>

            {selectedDay.holidays.length === 0 ? (
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.875rem', padding: '8px 0' }}>No events on this day.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedDay.holidays.map(h => {
                  const cfg = holidayTypeConfig[h.type] || holidayTypeConfig.school;
                  return (
                    <div key={h._id} style={{ padding: '12px 14px', borderRadius: '10px', background: cfg.bg, borderLeft: `3px solid ${cfg.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-text-primary)' }}>{h.title}</div>
                          <div style={{ fontSize: '0.75rem', color: cfg.color, marginTop: '2px', fontWeight: 600 }}>
                            {formatDateRange(h.startDate, h.endDate)}
                            {getDurationDays(h.startDate, h.endDate) > 1 && ` · ${getDurationDays(h.startDate, h.endDate)} days`}
                          </div>
                          {h.description && <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-secondary)', marginTop: '4px' }}>{h.description}</div>}
                          <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: cfg.color, color: 'white' }}>
                            {cfg.label}
                          </span>
                        </div>
                        {isAdmin && (
                          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEditForm(h)} aria-label="Edit"><Pencil size={13} strokeWidth={1.5} /></button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(h._id)} aria-label="Delete" style={{ color: 'var(--clr-danger)' }}><Trash2 size={13} strokeWidth={1.5} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isAdmin && (
              <div style={{ marginTop: '14px' }}>
                <button
                  id="add-holiday-day-modal-btn"
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

      {/* ── Add / Edit Form Modal ── */}
      {showForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="holiday-modal-title" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="holiday-modal-title">
                {editingHoliday ? 'Edit Holiday / Exam' : 'Add Holiday / Exam'}
              </h2>
              <button className="btn-icon" onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="hol-pg-title">Title *</label>
                <input id="hol-pg-title" className="form-input" placeholder="e.g. Summer Vacation / Final Exams" required
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              {/* Date range row */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="hol-pg-start">Start Date *</label>
                  <input id="hol-pg-start" type="date" className="form-input" required
                    value={form.startDate}
                    onChange={e => {
                      const val = e.target.value;
                      setForm(f => ({
                        ...f,
                        startDate: val,
                        // auto-set endDate to startDate if endDate is before startDate
                        endDate: f.endDate && f.endDate < val ? val : f.endDate,
                      }));
                    }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="hol-pg-end">End Date *</label>
                  <input id="hol-pg-end" type="date" className="form-input" required
                    min={form.startDate}
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>

              {/* Duration preview */}
              {form.startDate && form.endDate && form.endDate >= form.startDate && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '0.78rem', color: 'var(--clr-text-secondary)',
                  background: 'var(--clr-bg)', borderRadius: '8px', padding: '8px 12px',
                  marginBottom: '14px', marginTop: '-4px',
                }}>
                  <CalendarDays size={14} strokeWidth={1.5} color="var(--clr-primary)" />
                  <strong style={{ color: 'var(--clr-primary)' }}>
                    {getDurationDays(form.startDate, form.endDate)} day{getDurationDays(form.startDate, form.endDate) !== 1 ? 's' : ''}
                  </strong>
                  <span>
                    &nbsp;·&nbsp;
                    {new Date(form.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {form.startDate !== form.endDate && ` – ${new Date(form.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="hol-pg-type">Type</label>
                <select id="hol-pg-type" className="form-select" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="national">National Holiday</option>
                  <option value="regional">Regional Holiday</option>
                  <option value="school">School Holiday</option>
                  <option value="exam">Exam Period</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="hol-pg-desc">Description (optional)</label>
                <input id="hol-pg-desc" className="form-input" placeholder="Brief description…"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" id="submit-holiday-form-btn" className="btn btn-primary" disabled={saving}>
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
