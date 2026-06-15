import { useState, useEffect } from 'react';

export default function AdminMarksPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ student: '', subject: '', examType: 'Mid-Term', marks: '', totalMarks: 100, passingMarks: 40 });
  const [loading, setLoading] = useState(true);

  const fetchMarks = async () => {
    try {
      const res = await fetch('/api/admin/marks?limit=100', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMarks(data.marks || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFormMetadata = async () => {
    try {
      const studentRes = await fetch('/api/admin/students?limit=100', { credentials: 'include' });
      if (studentRes.ok) {
        const studentData = await studentRes.json();
        setStudents(studentData.allStudents || []);
      }
      const subjectRes = await fetch('/api/academic/subjects', { credentials: 'include' });
      if (subjectRes.ok) {
        const subjectData = await subjectRes.json();
        setSubjects(subjectData.subjects || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchMarks(), fetchFormMetadata()]);
      setLoading(false);
    };
    init();
  }, []);

  const filtered = marks.filter(m =>
    (m.student?.name && m.student.name.toLowerCase().includes(search.toLowerCase())) ||
    (m.subject?.name && m.subject.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          marks: Number(form.marks),
          totalMarks: Number(form.totalMarks),
          passingMarks: Number(form.passingMarks)
        }),
        credentials: 'include'
      });

      if (res.ok) {
        fetchMarks();
        setForm({ student: '', subject: '', examType: 'Mid-Term', marks: '', totalMarks: 100, passingMarks: 40 });
        setShowModal(false);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to upload marks');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this mark record?')) return;
    try {
      const res = await fetch(`/api/admin/marks/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchMarks();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete mark record');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const examTypes = ['Mid-Term', 'Final', 'Unit Test', 'Practical'];

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">📝 Marks Management</h1>
          <p className="page-subtitle">Upload and manage student marks</p>
        </div>
        <button id="add-marks-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Upload Marks
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Marks</h3>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              id="marks-search"
              className="form-input"
              placeholder="Search by student or subject..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading marks...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <p>No marks records found.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Marks</th>
                  <th>Total</th>
                  <th>%</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const pct = Math.round((m.marks / m.totalMarks) * 100);
                  return (
                    <tr key={m._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="avatar avatar-primary" style={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                            {m.student?.name ? m.student.name.split(' ').map(n => n[0]).join('') : '?'}
                          </div>
                          <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{m.student?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>{m.subject?.name || 'N/A'}</td>
                      <td><span className="badge badge-accent">{m.examType}</span></td>
                      <td><strong>{m.marks}</strong></td>
                      <td style={{ color: 'var(--clr-text-muted)' }}>{m.totalMarks}</td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: pct >= 75 ? 'var(--clr-secondary-dark)' : pct >= 40 ? 'var(--clr-primary)' : 'var(--clr-danger)'
                        }}>
                          {pct}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${m.marks >= m.passingMarks ? 'badge-success' : 'badge-danger'}`}>
                          {m.marks >= m.passingMarks ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button id={`delete-mark-${m._id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(m._id)}>🗑️</button>
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

      {/* Upload Marks Modal */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="upload-marks-title" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="upload-marks-title">Upload Marks</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label" htmlFor="mark-student">Student *</label>
                <select id="mark-student" className="form-select" required
                  value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))}>
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="mark-subject">Subject *</label>
                <select id="mark-subject" className="form-select" required
                  value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.classId?.name || 'No Class'})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="mark-exam-type">Exam Type *</label>
                <select id="mark-exam-type" className="form-select" required
                  value={form.examType} onChange={e => setForm(f => ({ ...f, examType: e.target.value }))}>
                  {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="mark-marks">Marks *</label>
                  <input id="mark-marks" type="number" className="form-input" placeholder="0" min="0" required
                    value={form.marks} onChange={e => setForm(f => ({ ...f, marks: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="mark-total">Total</label>
                  <input id="mark-total" type="number" className="form-input" min="1"
                    value={form.totalMarks} onChange={e => setForm(f => ({ ...f, totalMarks: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="mark-passing">Passing</label>
                  <input id="mark-passing" type="number" className="form-input" min="1"
                    value={form.passingMarks} onChange={e => setForm(f => ({ ...f, passingMarks: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" id="submit-add-marks" className="btn btn-primary">Upload Marks</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
