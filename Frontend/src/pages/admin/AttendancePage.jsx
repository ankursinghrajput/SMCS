import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Save } from 'lucide-react';

export default function AdminAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Load classes + subjects on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [classRes, subjectRes] = await Promise.all([
          fetch('/api/academic/classes', { credentials: 'include' }),
          fetch('/api/academic/subjects', { credentials: 'include' }),
        ]);
        if (classRes.ok) {
          const d = await classRes.json();
          setClasses(d.classes || []);
        }
        if (subjectRes.ok) {
          const d = await subjectRes.json();
          setSubjects(d.subjects || []);
        }
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoadingClasses(false);
      }
    };
    init();
  }, []);

  // When class changes → load students of that class
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setAttendance([]);
      setSelectedSubject('');
      return;
    }
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await fetch(`/api/admin/students?classId=${selectedClass}&limit=200`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const loaded = data.allStudents || [];
          setStudents(loaded);
          setAttendance(loaded.map(s => ({ studentId: s._id, name: s.name, status: 'present' })));
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();

    // Auto-select first subject that belongs to this class
    const classSubjects = subjects.filter(s => s.classId?._id === selectedClass || s.classId === selectedClass);
    setSelectedSubject(classSubjects.length > 0 ? classSubjects[0]._id : '');
  }, [selectedClass, subjects]);

  const filteredSubjects = subjects.filter(
    s => !selectedClass || s.classId?._id === selectedClass || s.classId === selectedClass
  );

  const updateStatus = (id, status) => {
    setAttendance(prev => prev.map(a => a.studentId === id ? { ...a, status } : a));
  };

  const handleMarkAllPresent = () => {
    setAttendance(prev => prev.map(a => ({ ...a, status: 'present' })));
  };

  const handleSave = async () => {
    if (!selectedClass) { alert('Please select a class'); return; }
    if (!selectedSubject) { alert('Please select a subject'); return; }
    try {
      const records = attendance.map(a => ({ student: a.studentId, status: a.status }));
      const res = await fetch('/api/attendance/mark-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedSubject, date, records }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || 'Attendance saved successfully!');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to save attendance');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving attendance');
    }
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

  const selectedClassObj = classes.find(c => c._id === selectedClass);

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={28} strokeWidth={1.5} /> Attendance Management
        </h1>
        <p className="page-subtitle">Mark and review student attendance class-wise</p>
      </div>

      {loadingClasses ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading...</div>
      ) : (
        <>
          {/* Step 1 — Select Class, Date, Subject */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Filter Attendance</h3>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {/* Class Selector */}
              <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
                <label className="form-label" htmlFor="attendance-class">Class *</label>
                <select
                  id="attendance-class"
                  className="form-select"
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                >
                  <option value="">— Select Class —</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name}{c.section ? ` - ${c.section}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selector */}
              <div className="form-group" style={{ flex: 2, minWidth: '200px', marginBottom: 0 }}>
                <label className="form-label" htmlFor="attendance-subject">Subject</label>
                <select
                  id="attendance-subject"
                  className="form-select"
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  disabled={!selectedClass}
                >
                  <option value="">— Select Subject —</option>
                  {filteredSubjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="form-group" style={{ flex: 1, minWidth: '160px', marginBottom: 0 }}>
                <label className="form-label" htmlFor="attendance-date">Date</label>
                <input id="attendance-date" type="date" className="form-input"
                  value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Step 2 — Mark Attendance */}
          {!selectedClass ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '12px' }}>
                <Calendar size={56} strokeWidth={0.8} />
              </div>
              <p style={{ color: 'var(--clr-text-muted)' }}>Select a class above to start marking attendance</p>
            </div>
          ) : loadingStudents ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>
              Loading students for {selectedClassObj?.name}...
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div style={{ opacity: 0.35, marginBottom: '12px' }}><Calendar size={48} strokeWidth={1} /></div>
              <p>No students enrolled in <strong>{selectedClassObj?.name}</strong>.</p>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  Mark Attendance — {selectedClassObj?.name}{selectedClassObj?.section ? ` - ${selectedClassObj.section}` : ''}
                </h3>
                <button id="mark-all-present" className="btn btn-secondary btn-sm" onClick={handleMarkAllPresent}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} strokeWidth={1.5} /> Mark All Present
                </button>
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

              {/* Student Attendance Table */}
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
                <button id="save-attendance-btn" className="btn btn-primary btn-lg" onClick={handleSave}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} strokeWidth={1.5} /> Save Attendance
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
