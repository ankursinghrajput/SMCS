import { useState } from 'react';
import { dummyAttendance } from '../../data/dummyData';

export default function AttendancePage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'low'
    ? dummyAttendance.filter(s => s.percentage < 75)
    : dummyAttendance;

  const getStatus = (pct) => {
    if (pct >= 85) return { label: 'Excellent', cls: 'badge-success' };
    if (pct >= 75) return { label: 'Good', cls: 'badge-primary' };
    return { label: 'Low ⚠️', cls: 'badge-danger' };
  };

  const overall = Math.round(
    dummyAttendance.reduce((a, b) => a + b.percentage, 0) / dummyAttendance.length
  );

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">📅 Attendance</h1>
          <p className="page-subtitle">Track your subject-wise attendance</p>
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

      {/* Overall Summary */}
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
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800 }}>{dummyAttendance.length}</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: '4px' }}>
            {dummyAttendance.filter(s => s.percentage < 75).length} with low attendance
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Subject-wise Breakdown</h3>
          <span className="badge badge-primary">{filtered.length} subjects</span>
        </div>

        {filtered.length === 0 ? (
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
                  <th>Classes Attended</th>
                  <th>Total Classes</th>
                  <th>Attendance %</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const status = getStatus(s.percentage);
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
                      <td>{s.attendedClasses}</td>
                      <td>{s.totalClasses}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: barColor }}>
                          {s.percentage}%
                        </span>
                      </td>
                      <td style={{ minWidth: '120px' }}>
                        <div className="attendance-bar-bg">
                          <div className="attendance-bar-fill" style={{ width: `${s.percentage}%`, background: barColor }} />
                        </div>
                        {/* 75% marker */}
                        <div style={{ position: 'relative', marginTop: '2px' }}>
                          <span style={{ position: 'absolute', left: '75%', fontSize: '0.6rem', color: 'var(--clr-text-muted)', transform: 'translateX(-50%)' }}>75%</span>
                        </div>
                      </td>
                      <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
          <strong>Note:</strong> A minimum of <strong>75% attendance</strong> is required in each subject. Students below this threshold may be barred from appearing in final examinations.
        </div>
      </div>
    </div>
  );
}
