import { useState, useEffect } from 'react';
import { Users, Search, Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import { apiFetch } from '../../lib/api';

const validateContact = (val) => /^[0-9]{10}$/.test(val);

export default function FacultyPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', contactNumber: '', password: '' });
  const [contactError, setContactError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchFaculty = async () => {
    try {
      const res = await apiFetch('/api/admin/faculties?limit=100');
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
    setContactError('');
    setShowPassword(false);
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
    setContactError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateContact(form.contactNumber)) {
      setContactError('Contact number must be exactly 10 digits.');
      return;
    }
    try {
      const url = editingFaculty
        ? `/api/admin/faculty/${editingFaculty._id}`
        : '/api/admin/faculty';
      const method = editingFaculty ? 'PATCH' : 'POST';

      const payload = { ...form };
      if (editingFaculty && !payload.password) {
        delete payload.password;
      }

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const handleDelete = (id, name) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await apiFetch(`/api/admin/faculty/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchFaculty();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
                <button id={`delete-faculty-${f._id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id, f.name)}>
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
                        <button id={`delete-faculty-row-${f._id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(f._id, f.name)}>
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
                <input
                  id="faculty-contact"
                  type="tel"
                  className={`form-input${contactError ? ' input-error' : ''}`}
                  placeholder="10-digit number"
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  value={form.contactNumber}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm(f => ({ ...f, contactNumber: val }));
                    setContactError(val.length > 0 && val.length < 10 ? 'Contact number must be exactly 10 digits.' : '');
                  }}
                />
                {contactError && (
                  <span style={{ color: 'var(--clr-danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    {contactError}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="faculty-password">Password {editingFaculty ? '(Leave blank to keep current)' : '*'}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="faculty-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Password"
                    required={!editingFaculty}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--clr-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                      zIndex: 2
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} strokeWidth={1.5} /> : <Eye size={17} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" id="submit-add-faculty" className="btn btn-primary">{editingFaculty ? 'Save Changes' : 'Add Faculty'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        entityName={deleteTarget?.name}
        entityType="Faculty"
      />
    </div>
  );
}
