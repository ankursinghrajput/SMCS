import { useState } from 'react';
import { dummyStudents, dummyAttendance } from '../../data/dummyData';

export default function AdminAttendancePage() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState(
    dummyStudents.map(s => ({ studentId: s._id, name: s.name, status: 'present' }))
  );

  const updateStatus = (id, status) => {
    setAttendance(prev => prev.map(a => a.studentId === id ? { ...a, status } : a));
  };

  const statusConfig = {
    present: { label: 'Present', cls: 'badge-success', color: 'var(--clr-secondary)' },
    absent:  { label: 'Absent',  cls: 'badge-danger',  color: 'var(--clr-danger)' },
    late:    { label: 'Late',    cls: 'badge-warning',  color: 'var(--clr-warning)' },
  };

  const counts = {
    present: attendance.filter(a => a.status === 'present').length,
    absent:  attendance.filter(a => a.status === 'absent').length,
    late:    attendance.filter(a => a.status === 'late').length,
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1 className="page-title">📅 Attendance Management</h1>
        <p className="page-subtitle">Mark and review student attendance</p>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Mark Attendance</h3>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}>
            <label className="form-label" htmlFor="attendance-date">Date</label>
            <input id="attendance-date" type="date" className="form-input"
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
            <label className="form-label" htmlFor="attendance-subject">Subject</label>
            <select id="attendance-subject" className="form-select">
              {dummyAttendance.map(s => <option key={s.subjectName}>{s.subjectName}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button id="mark-all-present" className="btn btn-secondary" onClick={() =>
              setAttendance(prev => prev.map(a => ({ ...a, status: 'present' })))
            }>✅ Mark All Present</button>
          </div>
        </div>

        {/* Summary Pills */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {Object.entries(counts).map(([key, count]) => (
            <div key={key} style={{
              background: statusConfig[key].color + '18',
              border: `1px solid ${statusConfig[key].color}40`,
              borderRadius: 'var(--radius-md)',
              padding: '10px 18px',
              textAlign: 'center',
              minWidth: '90px'
            }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: statusConfig[key].color }}>{count}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', textTransform: 'capitalize' }}>{key}</div>
            </div>
          ))}
        </div>

        {/* Student Attendance List */}
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
              {attendance.map((a) => (
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
                    <span className={`badge ${statusConfig[a.status].cls}`}>
                      {statusConfig[a.status].label}
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
          <button id="save-attendance-btn" className="btn btn-primary btn-lg">
            💾 Save Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
