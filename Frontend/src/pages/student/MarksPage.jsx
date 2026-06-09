import { useState } from 'react';
import { dummyMarks } from '../../data/dummyData';

const gradeColor = (grade) => {
  if (['A+', 'A'].includes(grade)) return { bg: 'var(--clr-secondary-light)', color: 'var(--clr-secondary-dark)' };
  if (['B+', 'B'].includes(grade)) return { bg: 'var(--clr-primary-light)', color: 'var(--clr-primary-dark)' };
  if (grade === 'C') return { bg: 'var(--clr-warning-light)', color: '#92400e' };
  return { bg: 'var(--clr-danger-light)', color: '#b91c1c' };
};

export default function MarksPage() {
  const [filterExam, setFilterExam] = useState('all');
  const examTypes = ['all', ...new Set(dummyMarks.map(m => m.examType))];
  const filtered = filterExam === 'all' ? dummyMarks : dummyMarks.filter(m => m.examType === filterExam);
  const totalMarks = filtered.reduce((a, b) => a + b.marks, 0);
  const totalPossible = filtered.reduce((a, b) => a + b.totalMarks, 0);
  const overallPct = totalPossible > 0 ? Math.round((totalMarks / totalPossible) * 100) : 0;

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">📝 Marks & Grades</h1>
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

      {/* Summary Banner */}
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
          <p style={{ opacity: 0.75, fontSize: '0.82rem', marginTop: '6px' }}>{overallPct}% — {overallPct >= 75 ? '🏆 Distinction' : overallPct >= 60 ? '✅ First Class' : '📘 Pass'}</p>
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

      {/* Marks Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {filtered.map((m, i) => {
          const gc = gradeColor(m.grade);
          const pct = Math.round((m.marks / m.totalMarks) * 100);
          return (
            <div className="card" key={i} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.subject.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', marginTop: '2px' }}>{m.examType}</div>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: gc.bg, color: gc.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem'
                }}>
                  {m.grade}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: 'var(--clr-text-primary)' }}>
                  {m.marks}
                </span>
                <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', marginBottom: '4px' }}>/ {m.totalMarks}</span>
              </div>
              <div className="attendance-bar-bg" style={{ marginBottom: '6px' }}>
                <div className="attendance-bar-fill" style={{
                  width: `${pct}%`,
                  background: pct >= 75 ? 'var(--clr-secondary)' : pct >= 40 ? 'var(--clr-primary)' : 'var(--clr-danger)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--clr-text-muted)' }}>
                <span>{pct}% score</span>
                <span className={`badge ${m.marks >= m.passingMarks ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                  {m.marks >= m.passingMarks ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Detailed Marks Report</h3>
        </div>
        <div className="table-wrapper">
          <table className="table">
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
                  <td><strong>{m.subject.name}</strong></td>
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
