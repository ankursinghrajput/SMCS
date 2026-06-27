import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen, ClipboardList, FileText, GraduationCap, Pencil,
  FlaskConical, Upload, BarChart2, Trash2, ArrowLeft,
  Search, Users, ChevronRight, AlertCircle, CheckCircle, XCircle,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

/* ─── Exam Categories ─────────────────────────────────────────────────────── */
const EXAM_TYPES = ['Unit Test 1', 'Unit Test 2', 'Mid-Term', 'Pre-Final', 'Final', 'Assignment', 'Practical'];

const EXAM_ICON_MAP = {
  'Unit Test 1': Pencil,
  'Unit Test 2': Pencil,
  'Mid-Term':    ClipboardList,
  'Pre-Final':   FileText,
  'Final':       GraduationCap,
  'Assignment':  BookOpen,
  'Practical':   FlaskConical,
};

const EXAM_COLORS = {
  'Unit Test 1': { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  'Unit Test 2': { bg: '#e0e7ff', color: '#3730a3', border: '#a5b4fc' },
  'Mid-Term':    { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  'Pre-Final':   { bg: '#fce7f3', color: '#9d174d', border: '#f9a8d4' },
  'Final':       { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  'Assignment':  { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
  'Practical':   { bg: '#ffedd5', color: '#9a3412', border: '#fdba74' },
};

/* ─── Table cell style constants ──────────────────────────────────────────── */
const TH = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'var(--clr-text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottom: '1px solid var(--clr-border)',
  background: 'var(--clr-bg)',
  whiteSpace: 'nowrap',
};

const TD = {
  padding: '11px 14px',
  verticalAlign: 'middle',
};

/* ─── Grade helper ────────────────────────────────────────────────────────── */
function getGrade(marks, total) {
  const pct = (marks / total) * 100;
  if (pct >= 90) return { letter: 'A+', color: '#059669' };
  if (pct >= 80) return { letter: 'A',  color: '#10b981' };
  if (pct >= 70) return { letter: 'B+', color: '#1a7fce' };
  if (pct >= 60) return { letter: 'B',  color: '#3b82f6' };
  if (pct >= 50) return { letter: 'C',  color: '#f59e0b' };
  if (pct >= 40) return { letter: 'D',  color: '#f97316' };
  return { letter: 'F', color: '#ef4444' };
}

/* ─── Exam Badge ──────────────────────────────────────────────────────────── */
function ExamBadge({ examType }) {
  const ec   = EXAM_COLORS[examType] || {};
  const Icon = EXAM_ICON_MAP[examType] || FileText;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: ec.bg || 'var(--clr-bg)',
      color: ec.color || 'var(--clr-text-secondary)',
      border: `1px solid ${ec.border || 'var(--clr-border)'}`,
      padding: '3px 9px', borderRadius: 999,
      fontSize: '0.72rem', fontWeight: 600,
    }}>
      <Icon size={11} strokeWidth={2} />
      {examType}
    </span>
  );
}

/* ─── Overlay style (shared) ─────────────────────────────────────────────── */
const OVERLAY_STYLE = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(10,18,35,0.52)',
  backdropFilter: 'blur(7px)',
  WebkitBackdropFilter: 'blur(7px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  animation: 'fadeIn 0.15s ease',
  padding: '24px',
  boxSizing: 'border-box',
};

/* ─── Upload Marks Modal ──────────────────────────────────────────────────── */
function UploadMarksModal({ student, subjects, onClose, onSuccess }) {
  const [form, setForm] = useState({
    subject:      subjects[0]?._id || '',
    examType:     'Unit Test 1',
    marks:        '',
    totalMarks:   100,
    passingMarks: 40,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const examColor = EXAM_COLORS[form.examType] || {};
  const pct = form.marks && form.totalMarks
    ? Math.round((Number(form.marks) / Number(form.totalMarks)) * 100)
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.marks) > Number(form.totalMarks)) {
      setError('Marks obtained cannot exceed total marks.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/admin/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student:      student._id,
          subject:      form.subject,
          examType:     form.examType,
          marks:        Number(form.marks),
          totalMarks:   Number(form.totalMarks),
          passingMarks: Number(form.passingMarks),
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        setError(err.message || 'Failed to upload marks.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div style={OVERLAY_STYLE} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:    'var(--clr-surface)',
          borderRadius:  '20px',
          boxShadow:     '0 24px 60px rgba(0,0,0,0.25)',
          padding:       '28px 28px 24px',
          width:         '100%',
          maxWidth:      520,
          animation:     'popIn 0.2s ease',
          boxSizing:     'border-box',
        }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Upload Marks</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)', marginTop: 2 }}>
              Student: <strong style={{ color: 'var(--clr-text-primary)' }}>{student.name}</strong>
            </p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Exam Type Selector */}
        <div style={{ marginBottom: 18 }}>
          <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
            Exam Category <span style={{ color: 'var(--clr-danger)' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {EXAM_TYPES.map(t => {
              const c      = EXAM_COLORS[t];
              const active = form.examType === t;
              const Icon   = EXAM_ICON_MAP[t] || FileText;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, examType: t }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 20,
                    fontSize: '0.78rem', fontWeight: 600,
                    border: `1.5px solid ${active ? c.border : 'var(--clr-border)'}`,
                    background: active ? c.bg : 'transparent',
                    color: active ? c.color : 'var(--clr-text-secondary)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <Icon size={12} strokeWidth={2} /> {t}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Subject */}
          <div className="form-group">
            <label className="form-label" htmlFor="modal-subject">
              Subject <span style={{ color: 'var(--clr-danger)' }}>*</span>
            </label>
            <select
              id="modal-subject"
              className="form-select"
              required
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            >
              <option value="">— Select Subject —</option>
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Marks fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="modal-marks">
                Marks Obtained <span style={{ color: 'var(--clr-danger)' }}>*</span>
              </label>
              <input
                id="modal-marks" type="number" className="form-input"
                placeholder="0" min="0" max={form.totalMarks} required
                value={form.marks}
                onChange={e => setForm(f => ({ ...f, marks: e.target.value }))}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="modal-total">Total Marks</label>
              <input
                id="modal-total" type="number" className="form-input" min="1"
                value={form.totalMarks}
                onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="modal-passing">Passing Marks</label>
              <input
                id="modal-passing" type="number" className="form-input" min="1"
                value={form.passingMarks}
                onChange={e => setForm(f => ({ ...f, passingMarks: e.target.value }))}
              />
            </div>
          </div>

          {/* Live preview with passing threshold bar */}
          {pct !== null && (() => {
            const grade      = getGrade(Number(form.marks), Number(form.totalMarks));
            const isPassing  = Number(form.marks) >= Number(form.passingMarks);
            const passingPct = Number(form.totalMarks) > 0
              ? Math.round((Number(form.passingMarks) / Number(form.totalMarks)) * 100)
              : 0;
            return (
              <div style={{
                marginTop: 14, padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: examColor.bg || 'var(--clr-bg)',
                border: `1px solid ${examColor.border || 'var(--clr-border)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: grade.color + '22', color: grade.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.95rem', flexShrink: 0,
                  }}>
                    {grade.letter}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {form.marks} / {form.totalMarks}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isPassing ? '#059669' : '#ef4444', fontWeight: 600 }}>
                      {isPassing ? 'Passing' : 'Failing'} — {pct}% scored, {passingPct}% required to pass
                    </div>
                  </div>
                </div>
                {/* Progress bar with passing threshold marker */}
                <div style={{ position: 'relative', height: 8, borderRadius: 999, background: 'rgba(0,0,0,0.1)', overflow: 'visible', margin: '0 2px' }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0,
                    height: '100%', width: `${Math.min(pct, 100)}%`,
                    background: grade.color, borderRadius: 999,
                    transition: 'width 0.4s ease',
                  }} />
                  {/* Passing threshold line */}
                  <div style={{
                    position: 'absolute', top: -3, bottom: -3,
                    left: `${passingPct}%`,
                    width: 2, background: '#475569', borderRadius: 2,
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: '0.68rem', color: 'var(--clr-text-muted)' }}>
                  <span>0</span>
                  <span style={{ color: '#475569', fontWeight: 600 }}>Pass threshold: {passingPct}%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })()}

          {error && (
            <div style={{
              marginTop: 12, padding: '8px 12px',
              background: 'var(--clr-danger-light)', color: '#b91c1c',
              borderRadius: 'var(--radius-md)', fontSize: '0.82rem',
              fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              id="submit-upload-marks"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Upload size={15} strokeWidth={2} />
              {loading ? 'Uploading…' : 'Upload Marks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* ─── Student Marks Detail Modal ──────────────────────────────────────────── */
function StudentMarksModal({ student, onClose }) {
  const [marks, setMarks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterExam, setFilterExam] = useState('All');

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await apiFetch(`/api/admin/marks?student=${student._id}&limit=200`);
        if (res.ok) {
          const data = await res.json();
          setMarks(data.marks || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [student._id]);

  const examTypesPresent = ['All', ...new Set(marks.map(m => m.examType))];
  const filtered    = filterExam === 'All' ? marks : marks.filter(m => m.examType === filterExam);

  const totalObtained = filtered.reduce((a, m) => a + m.marks, 0);
  const totalPossible = filtered.reduce((a, m) => a + m.totalMarks, 0);
  const overallPct    = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0;
  const passCount     = filtered.filter(m => m.marks >= m.passingMarks).length;
  const failCount     = filtered.length - passCount;

  const handleDelete = async (id) => {
    if (!confirm('Delete this mark record?')) return;
    try {
      const res = await apiFetch(`/api/admin/marks/${id}`, { method: 'DELETE' });
      if (res.ok) setMarks(prev => prev.filter(m => m._id !== id));
    } catch { /* silent */ }
  };

  const modal = (
    <div style={OVERLAY_STYLE} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:    'var(--clr-surface)',
          borderRadius:  '20px',
          boxShadow:     '0 24px 60px rgba(0,0,0,0.25)',
          padding:       '24px 24px 0',
          width:         '100%',
          maxWidth:      900,
          maxHeight:     '90vh',
          display:       'flex',
          flexDirection: 'column',
          animation:     'popIn 0.2s ease',
          overflow:      'hidden',
          boxSizing:     'border-box',
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 2 }}>
              {student.name}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>Marks Record</p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── Summary Stats ── */}
        {!loading && marks.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14, flexShrink: 0 }}>
            {[
              { label: 'Total Records',   value: filtered.length, color: 'var(--clr-primary)', bg: 'var(--clr-primary-light)' },
              { label: 'Overall Score',   value: `${overallPct}%`, color: overallPct >= 60 ? '#059669' : '#ef4444', bg: overallPct >= 60 ? '#d1fae5' : '#fee2e2' },
              { label: 'Passed',          value: passCount, color: '#059669', bg: '#d1fae5' },
              { label: 'Failed',          value: failCount, color: failCount > 0 ? '#ef4444' : '#64748b', bg: failCount > 0 ? '#fee2e2' : 'var(--clr-bg)' },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 'var(--radius-md)', padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-secondary)', fontWeight: 500, marginTop: 2 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Exam filter tabs ── */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12, flexShrink: 0 }}>
          {examTypesPresent.map(t => {
            const Icon = t !== 'All' ? (EXAM_ICON_MAP[t] || FileText) : null;
            return (
              <button
                key={t}
                className={`btn btn-sm ${filterExam === t ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilterExam(t)}
                style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                {Icon && <Icon size={12} strokeWidth={2} />}
                {t === 'All' ? 'All Exams' : t}
              </button>
            );
          })}
        </div>

        {/* ── Table ── */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0, marginLeft: -24, marginRight: -24 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--clr-text-muted)' }}>Loading marks…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
              <div style={{ opacity: 0.3, marginBottom: 10 }}><BarChart2 size={40} strokeWidth={1} style={{ margin: '0 auto' }} /></div>
              <p>No marks records found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ ...TH, paddingLeft: 24 }}>#</th>
                  <th style={TH}>Subject</th>
                  <th style={TH}>Exam Type</th>
                  <th style={TH}>Marks</th>
                  <th style={TH}>Total</th>
                  <th style={TH}>Passing %</th>
                  <th style={TH}>Score %</th>
                  <th style={TH}>Grade</th>
                  <th style={TH}>Result</th>
                  <th style={{ ...TH, paddingRight: 24 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const scorePct  = Math.round((m.marks / m.totalMarks) * 100);
                  const passPct   = Math.round((m.passingMarks / m.totalMarks) * 100);
                  const grade     = getGrade(m.marks, m.totalMarks);
                  const isPassing = m.marks >= m.passingMarks;
                  return (
                    <tr key={m._id} style={{ borderBottom: '1px solid var(--clr-border)' }}>
                      <td style={{ ...TD, paddingLeft: 24 }}>
                        <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem' }}>{i + 1}</span>
                      </td>
                      <td style={TD}>
                        <strong style={{ fontSize: '0.88rem' }}>{m.subject?.name || 'N/A'}</strong>
                      </td>
                      <td style={TD}>
                        <ExamBadge examType={m.examType} />
                      </td>
                      <td style={TD}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: grade.color }}>
                          {m.marks}
                        </span>
                      </td>
                      <td style={{ ...TD, color: 'var(--clr-text-muted)' }}>{m.totalMarks}</td>
                      <td style={TD}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                          {passPct}%
                        </span>
                      </td>
                      <td style={TD}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 52, height: 5, borderRadius: 999, background: 'var(--clr-border)', overflow: 'hidden', flexShrink: 0 }}>
                            <div style={{ height: '100%', width: `${scorePct}%`, background: grade.color, borderRadius: 999, transition: 'width 0.4s' }} />
                          </div>
                          <span style={{ fontWeight: 700, color: grade.color, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {scorePct}%
                          </span>
                        </div>
                      </td>
                      <td style={TD}>
                        <span style={{
                          background: grade.color + '1a', color: grade.color,
                          padding: '2px 10px', borderRadius: 999,
                          fontWeight: 700, fontSize: '0.8rem',
                        }}>
                          {grade.letter}
                        </span>
                      </td>
                      <td style={TD}>
                        {isPassing ? (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <CheckCircle size={10} /> Pass
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <XCircle size={10} /> Fail
                          </span>
                        )}
                      </td>
                      <td style={{ ...TD, paddingRight: 24 }}>
                        <button
                          id={`delete-mark-${m._id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(m._id)}
                          style={{ padding: '4px 7px', display: 'flex', alignItems: 'center' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: '12px 0 16px', flexShrink: 0, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--clr-border)' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* ─── Class View: Students + Actions ─────────────────────────────────────── */
function ClassMarksView({ classObj, onBack }) {
  const [students, setStudents]               = useState([]);
  const [subjects, setSubjects]               = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [search, setSearch]                   = useState('');
  const [activeExamFilter, setActiveExamFilter] = useState('All');
  const [uploadModal, setUploadModal]         = useState(null);
  const [viewModal, setViewModal]             = useState(null);
  const [studentMarksCount, setStudentMarksCount] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoadingStudents(true);
      try {
        const [stuRes, subRes] = await Promise.all([
          apiFetch(`/api/academic/class/${classObj._id}/students`),
          apiFetch(`/api/academic/subjects?classId=${classObj._id}`),
        ]);
        if (stuRes.ok) { const d = await stuRes.json(); setStudents(d.students || []); }
        if (subRes.ok) { const d = await subRes.json(); setSubjects(d.subjects || []); }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudents(false);
      }
    };
    load();
  }, [classObj._id]);

  useEffect(() => {
    if (students.length === 0) return;
    const fetchCounts = async () => {
      const counts = {};
      await Promise.all(students.map(async (s) => {
        try {
          const res = await apiFetch(`/api/admin/marks?student=${s._id}&limit=200`);
          if (res.ok) {
            const d = await res.json();
            counts[s._id] = (d.marks || []).length;
          }
        } catch { /* silent */ }
      }));
      setStudentMarksCount(counts);
    };
    fetchCounts();
  }, [students]);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleUploadSuccess = (student) => {
    setUploadModal(null);
    setStudentMarksCount(prev => ({ ...prev, [student._id]: (prev[student._id] || 0) + 1 }));
  };

  return (
    <div className="fade-in-up">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            id="back-to-classes-btn"
            className="btn btn-ghost btn-sm"
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 className="page-title">
              {classObj.name}{classObj.section ? ` — Section ${classObj.section}` : ''}
            </h1>
            <p className="page-subtitle">Upload and manage marks for students in this class</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-primary">{students.length} Students</span>
          <span className="badge badge-accent">{subjects.length} Subjects</span>
        </div>
      </div>

      {/* Exam Category Filter */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">Exam Categories</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
            Select a category before uploading
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['All', ...EXAM_TYPES].map(t => {
            const active = activeExamFilter === t;
            const c      = EXAM_COLORS[t] || {};
            const Icon   = t !== 'All' ? (EXAM_ICON_MAP[t] || FileText) : null;
            return (
              <button
                key={t}
                id={`exam-cat-${t.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setActiveExamFilter(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 999,
                  fontSize: '0.8rem', fontWeight: 600,
                  border: `1.5px solid ${active ? (c.border || 'var(--clr-primary)') : 'var(--clr-border)'}`,
                  background: active ? (c.bg || 'var(--clr-primary-light)') : 'transparent',
                  color: active ? (c.color || 'var(--clr-primary)') : 'var(--clr-text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  boxShadow: active ? `0 2px 8px ${(c.border || '#1a7fce')}40` : 'none',
                }}
              >
                {Icon ? <Icon size={13} strokeWidth={2} /> : <BarChart2 size={13} strokeWidth={2} />}
                {t === 'All' ? 'All' : t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Students</h3>
          <div className="search-wrap" style={{ maxWidth: 300 }}>
            <span className="search-icon"><Search size={14} /></span>
            <input
              id="student-search"
              className="form-input"
              placeholder="Search students…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loadingStudents ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            Loading students…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ opacity: 0.35 }}>
              <Users size={48} strokeWidth={1} />
            </div>
            <p>{search ? 'No students match your search.' : 'No students enrolled in this class.'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Marks Records</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const count = studentMarksCount[s._id];
                  return (
                    <tr key={s._id}>
                      <td style={{ color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            className="avatar avatar-primary"
                            style={{ width: 36, height: 36, fontSize: '0.78rem', flexShrink: 0 }}
                          >
                            {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--clr-text-secondary)', fontSize: '0.85rem' }}>
                        {s.email || '—'}
                      </td>
                      <td>
                        {count == null ? (
                          <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>—</span>
                        ) : count === 0 ? (
                          <span className="badge badge-warning">No Records</span>
                        ) : (
                          <span className="badge badge-success">{count} Record{count !== 1 ? 's' : ''}</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            id={`upload-marks-${s._id}`}
                            className="btn btn-primary btn-sm"
                            onClick={() => setUploadModal(s)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                          >
                            <Upload size={13} strokeWidth={2} /> Upload
                            {activeExamFilter !== 'All' && (
                              <span style={{
                                background: 'rgba(255,255,255,0.22)',
                                borderRadius: 999, padding: '1px 6px', fontSize: '0.68rem', marginLeft: 2,
                              }}>
                                {activeExamFilter}
                              </span>
                            )}
                          </button>
                          <button
                            id={`view-marks-${s._id}`}
                            className="btn btn-outline btn-sm"
                            onClick={() => setViewModal(s)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                          >
                            <BarChart2 size={13} strokeWidth={2} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {uploadModal && (
        <UploadMarksModal
          student={uploadModal}
          subjects={subjects}
          onClose={() => setUploadModal(null)}
          onSuccess={() => handleUploadSuccess(uploadModal)}
        />
      )}
      {viewModal && (
        <StudentMarksModal
          student={viewModal}
          onClose={() => setViewModal(null)}
        />
      )}
    </div>
  );
}

/* ─── Main Admin Marks Page ───────────────────────────────────────────────── */
export default function AdminMarksPage() {
  const [classes, setClasses]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classSearch, setClassSearch]     = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await apiFetch('/api/academic/classes');
        if (res.ok) {
          const data = await res.json();
          setClasses(data.classes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  if (selectedClass) {
    return (
      <ClassMarksView
        classObj={selectedClass}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(classSearch.toLowerCase()) ||
    (c.section && c.section.toLowerCase().includes(classSearch.toLowerCase()))
  );

  const CLASS_ACCENTS = [
    { bg: '#dbeafe', border: '#93c5fd', color: '#1e40af' },
    { bg: '#d1fae5', border: '#6ee7b7', color: '#065f46' },
    { bg: '#fce7f3', border: '#f9a8d4', color: '#9d174d' },
    { bg: '#fef3c7', border: '#fcd34d', color: '#92400e' },
    { bg: '#ede9fe', border: '#c4b5fd', color: '#5b21b6' },
    { bg: '#ffedd5', border: '#fdba74', color: '#9a3412' },
  ];

  return (
    <div className="fade-in-up">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Marks Management</h1>
        <p className="page-subtitle">Select a class to manage and upload student marks</p>
      </div>

      {/* Exam Category Overview Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a7fce 0%, #155fa0 60%, #0f766e 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '22px 28px',
        marginBottom: 28,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ opacity: 0.8, fontSize: '0.75rem', marginBottom: 4, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Available Exam Categories
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, marginBottom: 14 }}>
            {EXAM_TYPES.length} Exam Types Supported
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXAM_TYPES.map(t => {
              const Icon = EXAM_ICON_MAP[t] || FileText;
              return (
                <span key={t} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  borderRadius: 999, padding: '5px 12px',
                  fontSize: '0.78rem', fontWeight: 600,
                  backdropFilter: 'blur(4px)',
                }}>
                  <Icon size={12} strokeWidth={2} /> {t}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Select a Class</h3>
          <div className="search-wrap" style={{ maxWidth: 280 }}>
            <span className="search-icon"><Search size={14} /></span>
            <input
              id="class-search"
              className="form-input"
              placeholder="Search classes…"
              value={classSearch}
              onChange={e => setClassSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--clr-text-muted)' }}>
            Loading classes…
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ opacity: 0.35 }}>
              <BookOpen size={48} strokeWidth={1} />
            </div>
            <p>{classSearch ? 'No classes match your search.' : 'No classes found. Please create classes first.'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
            {filteredClasses.map((cls, idx) => {
              const ac = CLASS_ACCENTS[idx % CLASS_ACCENTS.length];
              return (
                <button
                  key={cls._id}
                  id={`class-card-${cls._id}`}
                  onClick={() => setSelectedClass(cls)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '18px 20px',
                    background: 'var(--clr-surface)',
                    border: `1.5px solid var(--clr-border)`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer', transition: 'all 0.18s ease',
                    textAlign: 'left',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative', overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                    e.currentTarget.style.borderColor = ac.border;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--clr-border)';
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: 3, background: `linear-gradient(90deg, ${ac.border}, ${ac.color}80)`,
                  }} />

                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: ac.bg, border: `1.5px solid ${ac.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 12, color: ac.color,
                  }}>
                    <BookOpen size={20} strokeWidth={1.5} />
                  </div>

                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: 'var(--clr-text-primary)', marginBottom: 4 }}>
                    {cls.name}
                  </div>

                  {cls.section && (
                    <div style={{
                      fontSize: '0.75rem', fontWeight: 600,
                      color: ac.color, background: ac.bg,
                      border: `1px solid ${ac.border}`, borderRadius: 999,
                      padding: '2px 8px', marginBottom: 10,
                    }}>
                      Section {cls.section}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={12} /> {cls.studentCount ?? '—'} students
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: ac.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                      Open <ChevronRight size={13} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
