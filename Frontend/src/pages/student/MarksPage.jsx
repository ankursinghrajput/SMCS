import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';

const gradeColor = (grade) => {
  if (['A+', 'A'].includes(grade)) return { bg: 'var(--clr-secondary-light)', color: 'var(--clr-secondary-dark)' };
  if (['B+', 'B'].includes(grade)) return { bg: 'var(--clr-primary-light)', color: 'var(--clr-primary-dark)' };
  if (grade === 'C') return { bg: 'var(--clr-warning-light)', color: '#92400e' };
  return { bg: 'var(--clr-danger-light)', color: '#b91c1c' };
};

function MarkCard({ m, index }) {
  const [open, setOpen] = useState(false);
  const gc = gradeColor(m.grade);
  const pct = m.totalMarks > 0 ? Math.round((m.marks / m.totalMarks) * 100) : 0;
  const passed = m.marks >= m.passingMarks;

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        borderLeft: `4px solid ${passed ? 'var(--clr-secondary)' : 'var(--clr-danger)'}`,
      }}
    >
      {/* ── Header (always visible, clickable) ── */}
      <button
        id={`marks-card-toggle-${index}`}
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          textAlign: 'left',
        }}
        aria-expanded={open}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          {/* Subject initials avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
            background: 'var(--clr-bg)',
            border: '1.5px solid var(--clr-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.72rem', color: 'var(--clr-text-secondary)',
            letterSpacing: '0.02em',
          }}>
            {(m.subject?.name || 'SJ').slice(0, 2).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--clr-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {m.subject?.name || '—'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge badge-accent" style={{ fontSize: '0.62rem', padding: '1px 7px' }}>{m.examType}</span>
              <span>{passed ? '✅ Passed' : '❌ Failed'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Blurred score preview — shown when collapsed */}
          {!open && (
            <div style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem',
              color: 'var(--clr-text-secondary)',
              filter: 'blur(6px)',
              userSelect: 'none', pointerEvents: 'none',
              transition: 'filter 0.3s',
            }}>
              {m.marks}/{m.totalMarks}
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '0.72rem', fontWeight: 600,
            color: open ? 'var(--clr-primary)' : 'var(--clr-text-muted)',
            transition: 'color 0.2s',
          }}>
            {open ? <EyeOff size={14} strokeWidth={2} /> : <Eye size={14} strokeWidth={2} />}
            {open ? <ChevronUp size={15} strokeWidth={2} /> : <ChevronDown size={15} strokeWidth={2} />}
          </div>
        </div>
      </button>

      {/* ── Expanded Details ── */}
      <div style={{
        maxHeight: open ? '400px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{
          padding: '0 18px 18px',
          borderTop: '1px solid var(--clr-border)',
          paddingTop: '16px',
        }}>
          {/* Score row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marks Obtained</p>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--clr-text-primary)', lineHeight: 1 }}>
                {m.marks}
              </span>
              <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', marginLeft: '4px' }}>/ {m.totalMarks}</span>
            </div>

            {/* Grade badge */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: gc.bg, color: gc.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column',
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem',
            }}>
              {m.grade || '—'}
            </div>
          </div>

          {/* Progress bar */}
          <div className="attendance-bar-bg" style={{ marginBottom: '8px', height: '8px', borderRadius: '999px' }}>
            <div
              className="attendance-bar-fill"
              style={{
                width: `${pct}%`,
                background: pct >= 75 ? 'var(--clr-secondary)' : pct >= 40 ? 'var(--clr-primary)' : 'var(--clr-danger)',
                height: '100%',
                borderRadius: '999px',
                transition: 'width 0.6s ease',
              }}
            />
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Score</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--clr-text-primary)' }}>{pct}%</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pass Mark</div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--clr-text-primary)' }}>{m.passingMarks}</div>
              </div>
            </div>
            <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
              {passed ? '✅ Passed' : '❌ Failed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarksPage() {
  const [filterExam, setFilterExam] = useState('all');
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await fetch('/api/student/marks', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch marks');
        const data = await res.json();
        setMarksData(data.myMarks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const examTypes = ['all', ...new Set(marksData.map(m => m.examType))];
  const filtered = filterExam === 'all' ? marksData : marksData.filter(m => m.examType === filterExam);
  const totalMarks = filtered.reduce((a, b) => a + b.marks, 0);
  const totalPossible = filtered.reduce((a, b) => a + b.totalMarks, 0);
  const overallPct = totalPossible > 0 ? Math.round((totalMarks / totalPossible) * 100) : 0;

  if (loading) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--clr-text-muted)' }}>Loading marks...</div>;
  if (error) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--clr-danger)' }}>Error: {error}</div>;

  return (
    <div className="fade-in-up">
      {/* ── Page Header ── */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">📝 Marks &amp; Grades</h1>
          <p className="page-subtitle">View your academic performance</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {examTypes.map(t => (
            <button
              key={t}
              id={`exam-filter-${t.replace(/\s+/g, '-').toLowerCase()}`}
              className={`btn ${filterExam === t ? 'btn-primary' : 'btn-outline'} btn-sm`}
              onClick={() => setFilterExam(t)}
            >
              {t === 'all' ? 'All Exams' : t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
        borderRadius: 'var(--radius-xl)', padding: '24px 28px',
        color: 'white', marginBottom: '24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap'
      }}>
        <div>
          <p style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: '4px' }}>Overall Score</p>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.1 }}>
            {totalMarks}/{totalPossible}
          </div>
          <p style={{ opacity: 0.75, fontSize: '0.82rem', marginTop: '6px' }}>
            {overallPct}% — {overallPct >= 75 ? '🏆 Distinction' : overallPct >= 60 ? '✅ First Class' : '📘 Pass'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { label: 'Subjects', value: filtered.length },
            { label: 'Passed', value: filtered.filter(m => m.marks >= m.passingMarks).length },
            { label: 'Failed', value: filtered.filter(m => m.marks < m.passingMarks).length },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800 }}>{s.value}</div>
              <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Accordion Cards Section ── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Subject Results</h3>
          <button
            id="toggle-all-marks"
            className="btn btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
            onClick={() => setAllOpen(o => !o)}
          >
            {allOpen ? <EyeOff size={13} strokeWidth={2} /> : <Eye size={13} strokeWidth={2} />}
            {allOpen ? 'Hide All' : 'Reveal All'}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '0.88rem' }}>
            No marks found for the selected exam type.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((m, i) => (
              <MarkCard key={`${m.subject?._id}-${m.examType}-${i}`} m={m} index={i} allOpen={allOpen} />
            ))}
          </div>
        )}
      </div>

      {/* ── Detailed Table ── */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Detailed Marks Report</h3>
        </div>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: '520px' }}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Type</th>
                <th>Marks Obtained</th>
                <th>Total Marks</th>
                <th>Passing Marks</th>
                <th>Grade</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={i}>
                  <td><strong>{m.subject?.name || '—'}</strong></td>
                  <td><span className="badge badge-accent">{m.examType}</span></td>
                  <td><strong>{m.marks}</strong></td>
                  <td>{m.totalMarks}</td>
                  <td>{m.passingMarks}</td>
                  <td>
                    {(() => {
                      const gc = gradeColor(m.grade);
                      return <span style={{ background: gc.bg, color: gc.color, padding: '2px 10px', borderRadius: '999px', fontWeight: 700, fontSize: '0.8rem' }}>{m.grade}</span>;
                    })()}
                  </td>
                  <td>
                    <span className={`badge ${m.marks >= m.passingMarks ? 'badge-success' : 'badge-danger'}`}>
                      {m.marks >= m.passingMarks ? '✅ Pass' : '❌ Fail'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
