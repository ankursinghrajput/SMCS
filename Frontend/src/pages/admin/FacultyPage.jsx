import { useState } from 'react';
import { dummyFaculties } from '../../data/dummyData';

export default function FacultyPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [faculty, setFaculty] = useState(dummyFaculties);
  const [form, setForm] = useState({ name: '', email: '', contactNumber: '', password: '' });

  const filtered = faculty.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    setFaculty(prev => [...prev, { _id: Date.now().toString(), ...form, role: 'faculty', subject: 'To be assigned' }]);
    setForm({ name: '', email: '', contactNumber: '', password: '' });
    setShowModal(false);
  };

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">👨‍🏫 Faculty</h1>
          <p className="page-subtitle">Manage teaching staff</p>
        </div>
        <button id="add-faculty-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Faculty
        </button>
      </div>

      {/* Faculty Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {filtered.map((f, i) => (
          <div className="card" key={i} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
              <div className="avatar avatar-success" style={{ width: 48, height: 48, fontSize: '1rem' }}>
                {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{f.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{f.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--clr-text-muted)' }}>Subject</span>
                <span className="badge badge-success">{f.subject}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--clr-text-muted)' }}>Contact</span>
                <span style={{ fontWeight: 500 }}>{f.contactNumber}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button id={`edit-faculty-${f._id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>✏️ Edit</button>
              <button id={`delete-faculty-${f._id}`} className="btn btn-danger btn-sm">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Faculty List</h3>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              id="faculty-search"
              className="form-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Subject</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar avatar-success">
                        {f.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{f.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--clr-text-secondary)' }}>{f.email}</td>
                  <td>{f.contactNumber}</td>
                  <td><span className="badge badge-success">{f.subject}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button id={`edit-faculty-row-${f._id}`} className="btn btn-outline btn-sm">✏️ Edit</button>
                      <button id={`delete-faculty-row-${f._id}`} className="btn btn-danger btn-sm">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-faculty-modal-title" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="add-faculty-modal-title">Add New Faculty</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label" htmlFor="faculty-name">Full Name *</label>
                <input id="faculty-name" className="form-input" placeholder="e.g. Prof. Vikram Singh" required
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="faculty-email">Email Address *</label>
                <input id="faculty-email" type="email" className="form-input" placeholder="e.g. vikram@smcs.edu" required
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="faculty-contact">Contact Number *</label>
                <input id="faculty-contact" type="tel" className="form-input" placeholder="10-digit number" required
                  value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="faculty-password">Password *</label>
                <input id="faculty-password" type="password" className="form-input" placeholder="Temporary password" required
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" id="submit-add-faculty" className="btn btn-primary">Add Faculty</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
