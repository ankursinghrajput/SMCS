import { useState, useEffect } from 'react';
import { Users, Search, Pencil, Trash2, Plus } from 'lucide-react';

export default function FacultyPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', contactNumber: '', password: '' });
  const [loading, setLoading] = useState(true);

  const fetchFaculty = async () => {
    try {
      const res = await fetch('/api/admin/faculties?limit=100', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFaculty(data.allFaculties || []);
      }
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const filtered = faculty.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setForm({ name: '', email: '', contactNumber: '', password: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (f) => {
    setEditingFaculty(f);
    setForm({
      name: f.name,
      email: f.email || '',
      contactNumber: f.contactNumber || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingFaculty
        ? `/api/admin/faculty/${editingFaculty._id}`
        : '/api/admin/faculty';
      const method = editingFaculty ? 'PATCH' : 'POST';

      const payload = { ...form };
      if (editingFaculty && !payload.password) {
        delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (res.ok) {
        fetchFaculty();
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
    if (!confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      const res = await fetch(`/api/admin/faculty/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchFaculty();
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
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={28} strokeWidth={1.5} /> Faculty
          </h1>
          <p className="page-subtitle">Manage teaching staff</p>
        </div>
        <button id="add-faculty-btn" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} strokeWidth={2} style={{ marginRight: '4px' }} /> Add Faculty
        </button>
      </div>

      {/* Faculty Cards */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading faculty...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state" style={{ marginBottom: '24px' }}>
          <div className="empty-state-icon"><Search size={40} strokeWidth={1} /></div>
          <p>No faculty found matching "{search}"</p>
        </div>
      ) : (
        <div className="faculty-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
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
                  <span style={{ color: 'var(--clr-text-muted)' }}>Contact</span>
                  <span style={{ fontWeight: 500 }}>{f.contactNumber}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button id={`edit-faculty-${f._id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => handleOpenEdit(f)}>
                  <Pencil size={13} strokeWidth={1.5} style={{ marginRight: '4px' }} />Edit
                </button>
                <button id={`delete-faculty-${f._id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}>
                  <Trash2 size={13} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Faculty List</h3>
          <div className="search-wrap">
            <span className="search-icon"><Search size={16} /></span>
            <input
              id="faculty-search"
              className="form-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading list...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={40} strokeWidth={1} /></div>
            <p>No faculty found matching "{search}"</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
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
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button id={`edit-faculty-row-${f._id}`} className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(f)}>
                          <Pencil size={13} strokeWidth={1.5} style={{ marginRight: '4px' }} />Edit
                        </button>
                        <button id={`delete-faculty-row-${f._id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id)}>
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="faculty-modal-title" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="faculty-modal-title">{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
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
                <label className="form-label" htmlFor="faculty-password">Password {editingFaculty ? '(Leave blank to keep current)' : '*'}</label>
                <input id="faculty-password" type="password" className="form-input" placeholder="Password" required={!editingFaculty}
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" id="submit-add-faculty" className="btn btn-primary">{editingFaculty ? 'Save Changes' : 'Add Faculty'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
