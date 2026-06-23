import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';

// ─── Utility helpers ────────────────────────────────────────────────────────
const STATUS_COLOR = {
  present: '#22c55e',
  late:    '#f59e0b',
  absent:  '#ef4444',
  excused: '#6366f1',
  'not-marked': '#94a3b8',
};
const STATUS_BG = {
  present: '#dcfce7',
  late:    '#fef3c7',
  absent:  '#fee2e2',
  excused: '#ede9fe',
};
const STATUS_LABEL = {
  present: 'Present',
  late:    'Late',
  absent:  'Absent',
  excused: 'Excused',
};

function getMonthGrid(year, month) {
  // Returns an array of {date, dayNum, currentMonth} for the calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }
  return cells;
}

function toDateKey(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().split('T')[0];
}

// ─── Mini Calendar with hover tooltip ────────────────────────────────────────
function AttendanceCalendar({ calendarMap }) {
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Build list of months to show (last 6)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const [viewMonth, setViewMonth] = useState(months.length - 1); // index into months[]
  const [tooltip, setTooltip] = useState(null); // { key, x, y }
  const tooltipRef = useRef(null);

  const { year, month } = months[viewMonth];
  const grid = getMonthGrid(year, month);
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const TOOLTIP_W = 190;
  const TOOLTIP_H = 120;

  const handleDayHover = (e, date) => {
    if (!date) return;
    const key = toDateKey(date);
    if (!calendarMap[key]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const winW = window.innerWidth;

    // Horizontal: centre, clamp to viewport
    let x = rect.left + rect.width / 2;
    let anchorX = '-50%';
    if (x - TOOLTIP_W / 2 < 8) { x = 8; anchorX = '0%'; }
    else if (x + TOOLTIP_W / 2 > winW - 8) { x = winW - 8; anchorX = '-100%'; }

    // Vertical: prefer above, flip below if near top
    let y, anchorY;
    if (rect.top - TOOLTIP_H - 8 > 8) {
      y = rect.top - 8; anchorY = '-100%';
    } else {
      y = rect.bottom + 8; anchorY = '0%';
    }

    setTooltip({ key, x, y, anchorX, anchorY });
  };
  const handleDayLeave = () => setTooltip(null);

  const tooltipRecords = tooltip ? calendarMap[tooltip.key] : null;

  return (
    <div style={{ fontFamily: 'var(--font-body, sans-serif)' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setViewMonth(v => Math.max(0, v - 1))}
          disabled={viewMonth === 0}
          style={{ opacity: viewMonth === 0 ? 0.3 : 1 }}
        >‹</button>
        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--clr-text-primary)' }}>{monthName}</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setViewMonth(v => Math.min(months.length - 1, v + 1))}
          disabled={viewMonth === months.length - 1}
          style={{ opacity: viewMonth === months.length - 1 ? 0.3 : 1 }}
        >›</button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {dayLabels.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--clr-text-muted)', fontWeight: 600, padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {grid.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const key = toDateKey(date);
          const data = calendarMap[key];
          const isToday = toDateKey(today) === key;
          const isFuture = date > today;
          const isPast6m = date < sixMonthsAgo;

          // Determine dominant status for colour
          let dotColor = null;
          if (data) {
            const statuses = data.map(r => r.status);
            if (statuses.includes('present')) dotColor = STATUS_COLOR.present;
            else if (statuses.includes('late')) dotColor = STATUS_COLOR.late;
            else if (statuses.includes('excused')) dotColor = STATUS_COLOR.excused;
            else dotColor = STATUS_COLOR.absent;
          }

          return (
            <div
              key={key}
              onMouseEnter={data ? (e) => handleDayHover(e, date) : undefined}
              onMouseLeave={data ? handleDayLeave : undefined}
              style={{
                borderRadius: 6,
                padding: '4px 2px',
                textAlign: 'center',
                cursor: data ? 'pointer' : 'default',
                background: isToday ? 'var(--clr-primary, #1a7fce)' : data ? dotColor + '22' : 'transparent',
                border: isToday ? '2px solid var(--clr-primary, #1a7fce)' : data ? `1.5px solid ${dotColor}55` : '1.5px solid transparent',
                opacity: isFuture || isPast6m ? 0.3 : 1,
                transition: 'transform 0.12s',
                position: 'relative',
              }}
            >
              <span style={{
                fontSize: '0.78rem',
                fontWeight: isToday ? 700 : data ? 600 : 400,
                color: isToday ? '#fff' : data ? dotColor : 'var(--clr-text-secondary)',
                lineHeight: 1.2,
              }}>
                {date.getDate()}
              </span>
              {data && (
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: dotColor,
                  margin: '2px auto 0',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip — viewport-aware positioning */}
      {tooltip && tooltipRecords && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: `translate(${tooltip.anchorX}, ${tooltip.anchorY})`,
            zIndex: 9999,
            background: 'var(--clr-surface, #1e293b)',
            border: '1px solid var(--clr-border, #334155)',
            borderRadius: 10,
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
            minWidth: 180,
            maxWidth: 210,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: 6, borderBottom: '1px solid var(--clr-border,#334155)', paddingBottom: 4 }}>
            📅 {tooltip.key}
          </div>
          {tooltipRecords.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[r.status] || '#94a3b8', flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-primary, #f1f5f9)', flex: 1 }}>{r.subjectName}</span>
              <span style={{ fontSize: '0.73rem', fontWeight: 600, color: STATUS_COLOR[r.status] || '#94a3b8' }}>{STATUS_LABEL[r.status] || r.status}</span>
            </div>
          ))}
        </div>,
        document.body
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--clr-text-secondary)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLOR[key] }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Student Attendance Page ────────────────────────────────────────────
export default function AttendancePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [calendarMap, setCalendarMap] = useState({}); // { 'YYYY-MM-DD': [{status, subjectName}] }
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/student/attendance', { credentials: 'include' });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.message || 'Failed to load attendance');
        }
        const data = await res.json();
        setSummary(data.summary || []);
        setWarnings(data.consecutiveAbsenceWarnings || []);

        // Build calendarMap from calendarData
        const map = {};
        (data.calendarData || []).forEach(r => {
          if (!map[r.date]) map[r.date] = [];
          map[r.date].push({ status: r.status, subjectName: r.subjectName });
        });
        setCalendarMap(map);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const filtered = filter === 'low'
    ? summary.filter(s => s.percentage < 75)
    : summary;

  const getStatusBadge = (pct) => {
    if (pct >= 85) return { label: 'Excellent', cls: 'badge-success' };
    if (pct >= 75) return { label: 'Good', cls: 'badge-primary' };
    return { label: 'Low ⚠️', cls: 'badge-danger' };
  };

  const overall = summary.length > 0
    ? Math.round(summary.reduce((acc, s) => acc + s.percentage, 0) / summary.length)
    : 0;

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>📅</div>
        Loading your attendance…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-danger)' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
        {error}
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">📅 My Attendance</h1>
          <p className="page-subtitle">Subject-wise attendance for the last 6 months</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'low'].map(f => (
            <button
              key={f}
              id={`filter-${f}`}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All Subjects' : '⚠️ Low Attendance'}
            </button>
          ))}
        </div>
      </div>

      {/* Consecutive absence warnings */}
      {warnings.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {warnings.map((w, i) => (
            <div key={i} style={{
              background: '#fee2e2', border: '1px solid #fca5a5',
              borderRadius: 'var(--radius-md)', padding: '10px 16px',
              marginBottom: '8px', fontSize: '0.84rem', color: '#991b1b',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              🚨 {w.message}
            </div>
          ))}
        </div>
      )}

      {/* Overall Summary Banner */}
      {summary.length > 0 && (
        <div style={{
          background: overall >= 75
            ? 'linear-gradient(135deg, #1a7fce, #155fa0)'
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          borderRadius: 'var(--radius-xl)', padding: '24px 28px',
          color: 'white', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px'
        }}>
          <div>
            <p style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: '4px' }}>Overall Attendance</p>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.1 }}>{overall}%</div>
            <p style={{ opacity: 0.75, fontSize: '0.82rem', marginTop: '6px' }}>
              {overall >= 75 ? '✅ You meet the 75% requirement' : '❌ Below required 75% attendance'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', opacity: 0.7, marginBottom: '4px' }}>Subjects</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>{summary.length}</div>
            <div style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: '4px' }}>
              {summary.filter(s => s.percentage < 75).length} with low attendance
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid" style={{ alignItems: 'start' }}>
        {/* Subject-wise Table */}
        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-header">
            <h3 className="card-title">Subject-wise Breakdown</h3>
            <span className="badge badge-primary">{filtered.length} subjects</span>
          </div>

          {summary.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <p>No attendance records found for the last 6 months.</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)', marginTop: 4 }}>Records are retained for 6 months only.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <p>Great! No subjects with low attendance.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Attended</th>
                    <th>Total</th>
                    <th>Attendance %</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const badge = getStatusBadge(s.percentage);
                    const barColor = s.percentage >= 75 ? 'var(--clr-secondary)' : 'var(--clr-danger)';
                    return (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar avatar-primary" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                              {s.subjectName.slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600 }}>{s.subjectName}</span>
                          </div>
                        </td>
                        <td>{s.present + s.late}</td>
                        <td>{s.total}</td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: barColor }}>
                            {s.percentage}%
                          </span>
                        </td>
                        <td style={{ minWidth: '120px' }}>
                          <div className="attendance-bar-bg">
                            <div className="attendance-bar-fill" style={{ width: `${s.percentage}%`, background: barColor }} />
                          </div>
                          <div style={{ position: 'relative', marginTop: '2px' }}>
                            <span style={{ position: 'absolute', left: '75%', fontSize: '0.6rem', color: 'var(--clr-text-muted)', transform: 'translateX(-50%)' }}>75%</span>
                          </div>
                        </td>
                        <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 6-Month Hover Calendar */}
        <div className="card" style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ fontSize: '0.9rem' }}>📅 Attendance Calendar</h3>
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--clr-text-muted)', marginBottom: 12 }}>
            Hover on any coloured date to see details
          </p>
          <AttendanceCalendar calendarMap={calendarMap} />
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'var(--clr-warning-light)',
        border: '1px solid #fde68a',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        marginTop: '20px',
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        fontSize: '0.85rem', color: '#92400e'
      }}>
        <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
        <div>
          <strong>Note:</strong> A minimum of <strong>75% attendance</strong> is required in each subject.
          Attendance records are automatically retained for <strong>6 months</strong>.
        </div>
      </div>
    </div>
  );
}
