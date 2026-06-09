import { useState } from 'react';
import { dummyMarks, dummyStudents } from '../../data/dummyData';

const allMarks = dummyStudents.flatMap((s, si) =>
  dummyMarks.map((m, mi) => ({
    ...m,
    _id: `${si}-${mi}`,
    student: { name: s.name, _id: s._id },
  }))
).slice(0, 12);

export default function AdminMarksPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [marks, setMarks] = useState(allMarks);
  const [form, setForm] = useState({ student: '', subject: '', examType: 'Mid-Term', marks: '', totalMarks: 100, passingMarks: 40 });

  const filtered = marks.filter(m =>
    m.student.name.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    setShowModal(false);
  };

  const gradeColors = (marks, total) => {
    const pct = (marks / total) * 100;
    if (pct >= 85) return 'badge-success';
    if (pct >= 60) return 'badge-primary';
    if (pct >= 40) return 'badge-warning';
    return 'badge-danger';
  };

  const examTypes = ['Mid-Term', 'Final', 'Unit Test', 'Practical'];

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
                          {m.student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{m.student.name}</span>
                      </div>
                    </td>
                    <td>{m.subject.name}</td>
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
                        <button id={`edit-mark-${m._id}`} className="btn btn-outline btn-sm">✏️</button>
                        <button id={`delete-mark-${m._id}`} className="btn btn-danger btn-sm">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
                  {dummyStudents.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="mark-subject">Subject *</label>
                <input id="mark-subject" className="form-input" placeholder="e.g. Mathematics" required
                  value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
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
