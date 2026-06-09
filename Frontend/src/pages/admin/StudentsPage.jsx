import { useState, useEffect } from 'react';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', contactNumber: '', password: '' });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students?limit=100', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.allStudents || []);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setForm({ name: '', email: '', contactNumber: '', password: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      email: student.email || '',
      contactNumber: student.contactNumber || '',
      password: '' // empty for edit unless they want to change it
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingStudent
        ? `/api/admin/student/${editingStudent._id}`
        : '/api/admin/student';
      const method = editingStudent ? 'PATCH' : 'POST';

      const payload = { ...form };
      if (editingStudent && !payload.password) {
        delete payload.password; // don't send empty password if editing
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (res.ok) {
        fetchStudents();
        setShowModal(false);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      const res = await fetch(`/api/admin/student/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchStudents();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">🎓 Students</h1>
          <p className="page-subtitle">Manage all enrolled students</p>
        </div>
        <button id="add-student-btn" className="btn btn-primary" onClick={handleOpenAdd}>
          + Add Student
        </button>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Students', value: students.length, icon: '🎓', color: '#e8f4fd' },
          { label: 'Active This Month', value: students.length, icon: '✅', color: '#d1fae5' },
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
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading students...</div>
        ) : filtered.length === 0 ? (
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
                {filtered.map((s) => (
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
                    <td><span className="badge badge-primary">{s.classId?.name || '—'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button id={`edit-student-${s._id}`} className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(s)}>✏️ Edit</button>
                        <button id={`delete-student-${s._id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="student-modal-title" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="student-modal-title">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
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
                <label className="form-label" htmlFor="student-password">Password {editingStudent ? '(Leave blank to keep current)' : '*'}</label>
                <input id="student-password" type="password" className="form-input" placeholder="Password" required={!editingStudent}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" id="submit-add-student" className="btn btn-primary">{editingStudent ? 'Save Changes' : 'Add Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
