import { useState } from 'react';
import { dummyStudents } from '../../data/dummyData';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', contactNumber: '', password: '' });
  const [students, setStudents] = useState(dummyStudents);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    setStudents(prev => [...prev, { _id: Date.now().toString(), ...form, role: 'student', classId: 'N/A' }]);
    setForm({ name: '', email: '', contactNumber: '', password: '' });
    setShowModal(false);
  };

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">🎓 Students</h1>
          <p className="page-subtitle">Manage all enrolled students</p>
        </div>
        <button id="add-student-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Student
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Students', value: students.length, icon: '🎓', color: '#e8f4fd' },
          { label: 'Active This Month', value: students.length, icon: '✅', color: '#d1fae5' },
          { label: 'New This Month', value: 2, icon: '🆕', color: '#ede9fe' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.color }}>
              <span style={{ fontSize: '1.3rem' }}>{s.icon}</span>
            </div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Students</h3>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              id="student-search"
              className="form-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p>No students found matching "{search}"</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Class</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar avatar-primary">
                          {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--clr-text-secondary)' }}>{s.email || '—'}</td>
                    <td>{s.contactNumber}</td>
                    <td><span className="badge badge-primary">{s.classId}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button id={`edit-student-${s._id}`} className="btn btn-outline btn-sm">✏️ Edit</button>
                        <button id={`delete-student-${s._id}`} className="btn btn-danger btn-sm">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-student-modal-title" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="add-student-modal-title">Add New Student</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label" htmlFor="student-name">Full Name *</label>
                <input id="student-name" className="form-input" placeholder="e.g. Rahul Sharma" required
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="student-email">Email Address</label>
                <input id="student-email" type="email" className="form-input" placeholder="e.g. rahul@smcs.edu"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="student-contact">Contact Number *</label>
                <input id="student-contact" type="tel" className="form-input" placeholder="10-digit number" required
                  value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="student-password">Password *</label>
                <input id="student-password" type="password" className="form-input" placeholder="Temporary password" required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" id="submit-add-student" className="btn btn-primary">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
