import { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
      {/* ── Subject Row ── */}
      <div
        style={{
          width: '100%',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
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

        {/* Dropdown toggle on the right side */}
        <button
          id={`marks-dropdown-toggle-${index}`}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: 'var(--clr-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--clr-bg)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          {open ? <ChevronUp size={20} strokeWidth={2} /> : <ChevronDown size={20} strokeWidth={2} />}
        </button>
      </div>

      {/* ── Expanded Detail Layout (Simple UI) ── */}
      <div style={{
        maxHeight: open ? '200px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out',
        background: 'var(--clr-bg)',
      }}>
        <div style={{
          padding: '16px 18px',
          borderTop: '1px solid var(--clr-border)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Simple Scores details */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Obtained Marks</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--clr-text-primary)' }}>{m.marks}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}> / {m.totalMarks}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Passing Marks</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>{m.passingMarks}</span>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Percentage</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>{pct}%</span>
            </div>
          </div>

          {/* Simple Grade Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', fontWeight: 600 }}>Grade:</span>
            <span style={{
              background: gc.bg,
              color: gc.color,
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {m.grade || '—'}
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

  useEffect(() => {
    const fetchMarks = async () => {
      try {
      const res = await apiFetch('/api/student/marks');
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
        
        {/* Buttons to see the exam type marks separately */}
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

      {/* ── Subject Cards Section ── */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Subject Results</h3>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '0.88rem' }}>
            No marks found for the selected exam type.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((m, i) => (
              <MarkCard key={`${m.subject?._id}-${m.examType}-${i}`} m={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
