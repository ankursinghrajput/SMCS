import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, CheckCircle, Save, Eye, Filter, XCircle } from 'lucide-react';

// ─── Status helpers ──────────────────────────────────────────────────────────
const STATUS_COLOR = {
  present: '#22c55e',
  late:    '#f59e0b',
  absent:  '#ef4444',
  excused: '#6366f1',
  'not-marked': '#94a3b8',
};
const STATUS_LABEL = {
  present:    'Present',
  late:       'Late',
  absent:     'Absent',
  excused:    'Excused',
  'not-marked': 'Not Marked',
};

// ─── 6-Month Hover Calendar (admin/faculty variant) ─────────────────────────
function AdminCalendar({ calendarMap, onDateClick }) {
  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  const [viewMonth, setViewMonth] = useState(months.length - 1);
  const [tooltip, setTooltip] = useState(null);
  const tooltipRef = useRef(null);

  const { year, month } = months[viewMonth];
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function getGrid(yr, mo) {
    const firstDay = new Date(yr, mo, 1).getDay();
    const daysInMonth = new Date(yr, mo + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(yr, mo, d));
    return cells;
  }

  function toKey(d) {
    if (!d) return '';
    const dt = d instanceof Date ? d : new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const grid = getGrid(year, month);

  const TOOLTIP_W = 200;
  const TOOLTIP_H = 130;

  const handleHover = (e, date) => {
    if (!date) return;
    const key = toKey(date);
    if (!calendarMap[key]) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Horizontal: centre on cell, clamp to viewport
    let x = rect.left + rect.width / 2;
    let anchorX = '-50%';
    if (x - TOOLTIP_W / 2 < 8) { x = 8; anchorX = '0%'; }
    else if (x + TOOLTIP_W / 2 > winW - 8) { x = winW - 8; anchorX = '-100%'; }

    // Vertical: prefer above, flip below if not enough space
    let y, anchorY;
    if (rect.top - TOOLTIP_H - 8 > 8) {
      y = rect.top - 8;  anchorY = '-100%'; // above
    } else {
      y = rect.bottom + 8; anchorY = '0%'; // below
    }

    setTooltip({ key, x, y, anchorX, anchorY });
  };

  const tooltipData = tooltip ? calendarMap[tooltip.key] : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setViewMonth(v => Math.max(0, v - 1))} disabled={viewMonth === 0} style={{ opacity: viewMonth === 0 ? 0.3 : 1 }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--clr-text-primary)' }}>{monthName}</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setViewMonth(v => Math.min(months.length - 1, v + 1))} disabled={viewMonth === months.length - 1} style={{ opacity: viewMonth === months.length - 1 ? 0.3 : 1 }}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {dayLabels.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {grid.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const key = toKey(date);
          const data = calendarMap[key];
          const isToday = toKey(today) === key;
          const isFuture = date > today;
          const isPast = date < sixMonthsAgo;

          // Determine colour — use attendance rate
          let dotColor = null;
          if (data) {
            const rate = data.presentRate;
            dotColor = rate >= 75 ? STATUS_COLOR.present : rate >= 50 ? STATUS_COLOR.late : STATUS_COLOR.absent;
          }

          return (
            <div
              key={key}
              onMouseEnter={data ? (e) => handleHover(e, date) : undefined}
              onMouseLeave={data ? () => setTooltip(null) : undefined}
              onClick={data && onDateClick ? () => onDateClick(key) : undefined}
              style={{
                borderRadius: 6,
                padding: '4px 2px',
                textAlign: 'center',
                cursor: data ? 'pointer' : 'default',
                background: isToday ? 'var(--clr-primary, #1a7fce)' : data ? dotColor + '22' : 'transparent',
                border: isToday ? '2px solid var(--clr-primary, #1a7fce)' : data ? `1.5px solid ${dotColor}55` : '1.5px solid transparent',
                opacity: isFuture || isPast ? 0.3 : 1,
                transition: 'transform 0.12s',
              }}
            >
              <span style={{
                fontSize: '0.76rem',
                fontWeight: isToday ? 700 : data ? 600 : 400,
                color: isToday ? '#fff' : data ? dotColor : 'var(--clr-text-secondary)',
                lineHeight: 1.2,
              }}>
                {date.getDate()}
              </span>
              {data && (
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor, margin: '2px auto 0' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip — viewport-aware positioning */}
      {tooltip && tooltipData && createPortal(
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
            minWidth: 190,
            maxWidth: 220,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-text-muted)', marginBottom: 6, borderBottom: '1px solid var(--clr-border,#334155)', paddingBottom: 4 }}>
            📅 {tooltip.key}
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem', color: 'var(--clr-text-primary,#f1f5f9)' }}>
            <span>👥 {tooltipData.total} students</span>
          </div>
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[['present','✅'],['absent','❌'],['late','⏱️'],['excused','🔵']].map(([s, icon]) =>
              tooltipData[s] > 0 ? (
                <span key={s} style={{ fontSize: '0.72rem', fontWeight: 600, color: STATUS_COLOR[s] }}>
                  {icon} {tooltipData[s]} {s}
                </span>
              ) : null
            )}
          </div>
          <div style={{ marginTop: 4, fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>
            Attendance rate: <strong style={{ color: tooltipData.presentRate >= 75 ? STATUS_COLOR.present : STATUS_COLOR.absent }}>{tooltipData.presentRate.toFixed(1)}%</strong>
          </div>
          {onDateClick && (
            <div style={{ marginTop: 6, fontSize: '0.7rem', color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>Click to filter by this date</div>
          )}
        </div>,
        document.body
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, justifyContent: 'center', fontSize: '0.7rem', color: 'var(--clr-text-muted)', flexWrap: 'wrap' }}>
        <span><span style={{ color: STATUS_COLOR.present }}>●</span> ≥75%</span>
        <span><span style={{ color: STATUS_COLOR.late }}>●</span> 50–74%</span>
        <span><span style={{ color: STATUS_COLOR.absent }}>●</span> &lt;50%</span>
      </div>
    </div>
  );
}

// ─── Main Admin Attendance Page ──────────────────────────────────────────────
export default function AdminAttendancePage() {
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' | 'view'

// ── Shared state ──────────────────────────────────────────────────────────
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ── Mark Attendance state ─────────────────────────────────────────────────
  const [markDate, setMarkDate] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; });
  const [markClass, setMarkClass] = useState('');
  const [markSubject, setMarkSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ── View Attendance state ─────────────────────────────────────────────────
  const [viewClass, setViewClass] = useState('');
  const [viewSubject, setViewSubject] = useState('');
  const [viewDate, setViewDate] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; });
  const [viewRecords, setViewRecords] = useState(null); // null = not fetched yet
  const [loadingView, setLoadingView] = useState(false);
  const [calendarMap, setCalendarMap] = useState({});
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // ── Init: load classes + subjects ─────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [classRes, subjectRes] = await Promise.all([
          fetch('/api/academic/classes', { credentials: 'include' }),
          fetch('/api/academic/subjects', { credentials: 'include' }),
        ]);
        if (classRes.ok) { const d = await classRes.json(); setClasses(d.classes || []); }
        if (subjectRes.ok) { const d = await subjectRes.json(); setSubjects(d.subjects || []); }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoadingClasses(false);
      }
    };
    init();
  }, []);

  // ── Set default subject when class changes ────────────────────────────────
  useEffect(() => {
    if (markClass) {
      const classSubjects = subjects.filter(s => s.classId?._id === markClass || s.classId === markClass);
      setMarkSubject(classSubjects.length > 0 ? classSubjects[0]._id : '');
    } else {
      setMarkSubject('');
    }
  }, [markClass, subjects]);

  // ── Load students and existing attendance for mark tab ────────────────────
  useEffect(() => {
    if (!markClass) { setStudents([]); setAttendance([]); return; }
    const fetchStudentsAndAttendance = async () => {
      setLoadingStudents(true);
      try {
        let url = `/api/attendance/class/${markClass}?date=${markDate}`;
        if (markSubject) url += `&subject=${markSubject}`;
        const res = await fetch(url, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
          const merged = data.merged || [];
          setAttendance(merged.map(m => ({
            studentId: m.studentId,
            name: m.name,
            status: m.recorded ? m.status : 'present'
          })));
        }
      } catch (err) {
        console.error('Failed to load students and attendance:', err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudentsAndAttendance();
  }, [markClass, markDate, markSubject]);

  // ── Fetch calendar when view class/subject changes ────────────────────────
  useEffect(() => {
    if (activeTab !== 'view' || !viewClass) { setCalendarMap({}); return; }
    const fetchCalendar = async () => {
      setLoadingCalendar(true);
      try {
        let url = `/api/attendance/calendar?classId=${viewClass}`;
        if (viewSubject) url += `&subject=${viewSubject}`;
        const res = await fetch(url, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const map = {};
          (data.calendar || []).forEach(d => {
            const total = d.total || 0;
            const presentCount = (d.present || 0) + (d.late || 0);
            map[d.date] = {
              ...d,
              presentRate: total > 0 ? (presentCount / total) * 100 : 0
            };
          });
          setCalendarMap(map);
        }
      } catch (err) {
        console.error('Calendar fetch error:', err);
      } finally {
        setLoadingCalendar(false);
      }
    };
    fetchCalendar();
  }, [activeTab, viewClass, viewSubject]);

  // ── Mark attendance helpers ───────────────────────────────────────────────
  const filteredMarkSubjects = subjects.filter(
    s => !markClass || s.classId?._id === markClass || s.classId === markClass
  );
  const updateStatus = (id, status) => {
    setAttendance(prev => prev.map(a => a.studentId === id ? { ...a, status } : a));
  };
  const handleMarkAllPresent = () => setAttendance(prev => prev.map(a => ({ ...a, status: 'present' })));

  const handleSave = async () => {
    if (!markClass) { showToast('Please select a class', 'error'); return; }
    if (!markSubject) { showToast('Please select a subject', 'error'); return; }
    try {
      const records = attendance.map(a => ({ student: a.studentId, status: a.status }));
      const res = await fetch('/api/attendance/mark-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: markSubject, date: markDate, records }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Attendance saved successfully!', 'success');
        // Refresh calendar
        if (viewClass === markClass) {
          setCalendarMap({});
        }
      } else {
        const errData = await res.json();
        showToast(errData.message || 'Failed to save attendance', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while saving attendance', 'error');
    }
  };

  // ── View attendance filter handler ────────────────────────────────────────────
  const fetchAttendanceForView = async (dateToFetch) => {
    if (!viewClass) { alert('Please select a class'); return; }
    if (!viewSubject) { alert('Please select a subject'); return; }
    setLoadingView(true);
    setViewRecords(null);
    try {
      let url = `/api/attendance/class/${viewClass}?date=${dateToFetch}`;
      if (viewSubject) url += `&subject=${viewSubject}`;
      const res = await fetch(url, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setViewRecords(data.merged || []);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to fetch attendance');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching attendance');
    } finally {
      setLoadingView(false);
    }
  };

  const handleApplyFilter = () => {
    fetchAttendanceForView(viewDate);
  };

  // ── Clicking a date in calendar auto-fills the view date and fetches ────────
  const handleCalendarDateClick = (dateKey) => {
    setViewDate(dateKey);
    if (viewClass && viewSubject) {
      fetchAttendanceForView(dateKey);
    }
  };

  const markClassObj = classes.find(c => c._id === markClass);
  const viewClassObj = classes.find(c => c._id === viewClass);
  const filteredViewSubjects = subjects.filter(
    s => !viewClass || s.classId?._id === viewClass || s.classId === viewClass
  );

  const statusConfig = {
    present: { label: 'Present', cls: 'badge-success', color: 'var(--clr-secondary)' },
    absent:  { label: 'Absent',  cls: 'badge-danger',  color: 'var(--clr-danger)' },
    late:    { label: 'Late',    cls: 'badge-warning',  color: 'var(--clr-warning)' },
  };

  const markCounts = {
    present: attendance.filter(a => a.status === 'present').length,
    absent:  attendance.filter(a => a.status === 'absent').length,
    late:    attendance.filter(a => a.status === 'late').length,
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={28} strokeWidth={1.5} /> Attendance Management
        </h1>
        <p className="page-subtitle">Mark and review student attendance class-wise</p>
      </div>

      {toast.show && createPortal(
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 10000,
          background: toast.type === 'success' ? '#22c55e' : '#ef4444',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontWeight: 600,
          fontSize: '0.9rem',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {toast.message}
        </div>,
        document.body
      )}

      {loadingClasses ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading…</div>
      ) : (
        <>
          {/* ── Tab Toggle ── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button
              id="tab-mark"
              className={`btn btn-sm ${activeTab === 'mark' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('mark')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <CheckCircle size={15} strokeWidth={1.5} /> Mark Attendance
            </button>
            <button
              id="tab-view"
              className={`btn btn-sm ${activeTab === 'view' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('view')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Eye size={15} strokeWidth={1.5} /> View Attendance
            </button>
          </div>

          {/* ════════════════════ MARK TAB ════════════════════ */}
          {activeTab === 'mark' && (
            <>
              {/* Filter row */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <h3 className="card-title">Select Class & Date</h3>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
                    <label className="form-label" htmlFor="mark-class">Class *</label>
                    <select id="mark-class" className="form-select" value={markClass} onChange={e => setMarkClass(e.target.value)}>
                      <option value="">— Select Class —</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
                    <label className="form-label" htmlFor="mark-subject">Subject</label>
                    <select id="mark-subject" className="form-select" value={markSubject} onChange={e => setMarkSubject(e.target.value)} disabled={!markClass}>
                      <option value="">— Select Subject —</option>
                      {filteredMarkSubjects.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '160px', marginBottom: 0 }}>
                    <label className="form-label" htmlFor="mark-date">Date</label>
                    <input id="mark-date" type="date" className="form-input" value={markDate} onChange={e => setMarkDate(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Mark table */}
              {!markClass ? (
                <div className="empty-state">
                  <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '12px' }}><Calendar size={56} strokeWidth={0.8} /></div>
                  <p style={{ color: 'var(--clr-text-muted)' }}>Select a class above to start marking attendance</p>
                </div>
              ) : loadingStudents ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>
                  Loading students for {markClassObj?.name}…
                </div>
              ) : students.length === 0 ? (
                <div className="empty-state">
                  <div style={{ opacity: 0.35, marginBottom: '12px' }}><Calendar size={48} strokeWidth={1} /></div>
                  <p>No students enrolled in <strong>{markClassObj?.name}</strong>.</p>
                </div>
              ) : (
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      Mark Attendance — {markClassObj?.name}{markClassObj?.section ? ` - ${markClassObj.section}` : ''}
                    </h3>
                    <button id="mark-all-present" className="btn btn-secondary btn-sm" onClick={handleMarkAllPresent}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} strokeWidth={1.5} /> Mark All Present
                    </button>
                  </div>

                  {/* Summary Pills */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    {Object.entries(markCounts).map(([key, count]) => (
                      <div key={key} style={{
                        background: statusConfig[key].color + '18',
                        border: `1px solid ${statusConfig[key].color}40`,
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 18px', textAlign: 'center', minWidth: '90px'
                      }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: statusConfig[key].color }}>{count}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', textTransform: 'capitalize' }}>{key}</div>
                      </div>
                    ))}
                  </div>

                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Status</th>
                          <th>Mark As</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map(a => (
                          <tr key={a.studentId}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="avatar avatar-primary" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                  {a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{a.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${statusConfig[a.status]?.cls || 'badge-secondary'}`}>
                                {statusConfig[a.status]?.label || a.status}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {Object.entries(statusConfig).map(([key, conf]) => (
                                  <button
                                    key={key}
                                    id={`attendance-${a.studentId}-${key}`}
                                    className={`btn btn-sm ${a.status === key ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => updateStatus(a.studentId, key)}
                                    style={{ minWidth: '72px', fontSize: '0.75rem' }}
                                  >
                                    {conf.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button id="save-attendance-btn" className="btn btn-primary btn-lg" onClick={handleSave}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Save size={18} strokeWidth={1.5} /> Save Attendance
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ════════════════════ VIEW TAB ════════════════════ */}
          {activeTab === 'view' && (
            <>
              {/* Filter bar */}
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Filter size={16} strokeWidth={1.5} /> Filter Attendance Records
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
                    <label className="form-label" htmlFor="view-class">Class *</label>
                    <select id="view-class" className="form-select" value={viewClass}
                      onChange={e => { setViewClass(e.target.value); setViewSubject(''); setViewRecords(null); }}>
                      <option value="">— Select Class —</option>
                      {classes.map(c => (
                        <option key={c._id} value={c._id}>{c.name}{c.section ? ` - ${c.section}` : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
                    <label className="form-label" htmlFor="view-subject">Subject *</label>
                    <select id="view-subject" className="form-select" value={viewSubject}
                      onChange={e => { setViewSubject(e.target.value); setViewRecords(null); }}
                      disabled={!viewClass}>
                      <option value="">— Select Subject —</option>
                      {filteredViewSubjects.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1, minWidth: '160px', marginBottom: 0 }}>
                    <label className="form-label" htmlFor="view-date">Date</label>
                    <input id="view-date" type="date" className="form-input" value={viewDate}
                      onChange={e => { setViewDate(e.target.value); setViewRecords(null); }}
                      max={(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; })()} />
                  </div>

                  {/* ★ Apply Filter Button ★ */}
                  <div style={{ marginBottom: 0, alignSelf: 'flex-end' }}>
                    <button
                      id="apply-attendance-filter-btn"
                      className="btn btn-primary"
                      onClick={handleApplyFilter}
                      disabled={!viewClass || !viewSubject || loadingView}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
                    >
                      <Filter size={16} strokeWidth={1.5} />
                      {loadingView ? 'Loading…' : 'Apply Filter'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Main view area: table + calendar side-by-side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>

                {/* Attendance results table */}
                <div className="card" style={{ minWidth: 0 }}>
                  <div className="card-header">
                    <h3 className="card-title">
                      {viewClassObj
                        ? `${viewClassObj.name}${viewClassObj.section ? ` - ${viewClassObj.section}` : ''} — ${viewDate}`
                        : 'Attendance Results'}
                    </h3>
                    {viewRecords && (
                      <span className="badge badge-primary">{viewRecords.length} students</span>
                    )}
                  </div>

                  {(!viewClass || !viewSubject) ? (
                    <div className="empty-state">
                      <div style={{ opacity: 0.3, marginBottom: 12 }}><Eye size={52} strokeWidth={0.8} /></div>
                      <p style={{ color: 'var(--clr-text-muted)' }}>
                        Select a <strong>Class</strong> and <strong>Subject *</strong> then click <strong>Apply Filter</strong>
                      </p>
                    </div>
                  ) : viewRecords === null ? (
                    <div className="empty-state">
                      <div style={{ opacity: 0.3, marginBottom: 12 }}><Filter size={44} strokeWidth={0.8} /></div>
                      <p style={{ color: 'var(--clr-text-muted)' }}>
                        {loadingView ? 'Fetching records…' : 'Click Apply Filter to load attendance'}
                      </p>
                    </div>
                  ) : viewRecords.length === 0 ? (
                    <div className="empty-state">
                      <div style={{ opacity: 0.3, marginBottom: 12 }}><Calendar size={44} strokeWidth={0.8} /></div>
                      <p>No records found for {viewDate}.</p>
                    </div>
                  ) : (
                    <>
                      {/* Summary pills */}
                      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                        {['present','absent','late','not-marked'].map(s => {
                          const count = viewRecords.filter(r => r.status === s).length;
                          if (count === 0 && s !== 'present') return null;
                          return (
                            <div key={s} style={{
                              background: STATUS_COLOR[s] + '15',
                              border: `1px solid ${STATUS_COLOR[s]}40`,
                              borderRadius: 'var(--radius-md)',
                              padding: '8px 14px', textAlign: 'center', minWidth: 80
                            }}>
                              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: STATUS_COLOR[s] }}>{count}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'capitalize' }}>{STATUS_LABEL[s]}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="table-wrapper">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Student</th>
                              <th>Status</th>
                              {viewRecords.some(r => r.subject) && <th>Subject</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {viewRecords.map((r, i) => (
                              <tr key={r.studentId || i}>
                                <td style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>{i + 1}</td>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div className="avatar avatar-primary" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                      {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.name}</span>
                                  </div>
                                </td>
                                <td>
                                  <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    background: STATUS_COLOR[r.status] + '18',
                                    border: `1px solid ${STATUS_COLOR[r.status]}40`,
                                    color: STATUS_COLOR[r.status],
                                    borderRadius: 20,
                                    padding: '2px 10px',
                                    fontSize: '0.78rem', fontWeight: 600
                                  }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLOR[r.status] }} />
                                    {STATUS_LABEL[r.status] || r.status}
                                  </span>
                                </td>
                                {viewRecords.some(rec => rec.subject) && (
                                  <td style={{ fontSize: '0.82rem', color: 'var(--clr-text-secondary)' }}>
                                    {r.subject?.name || '—'}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>

                {/* Calendar sidebar */}
                {viewClass && (
                  <div className="card" style={{ minWidth: '300px', maxWidth: '340px' }}>
                    <div className="card-header">
                      <h3 className="card-title" style={{ fontSize: '0.88rem' }}>📅 6-Month Calendar</h3>
                    </div>
                    <p style={{ fontSize: '0.73rem', color: 'var(--clr-text-muted)', marginBottom: 10 }}>
                      Hover to preview · Click a date to filter
                    </p>
                    {loadingCalendar ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>Loading calendar…</div>
                    ) : (
                      <AdminCalendar calendarMap={calendarMap} onDateClick={handleCalendarDateClick} />
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
