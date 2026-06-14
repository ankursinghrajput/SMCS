import { useState, useEffect } from 'react';
import { GraduationCap, Search, Pencil, Trash2, Plus, ChevronDown, Eye, EyeOff } from 'lucide-react';

const validateContact = (val) => /^[0-9]{10}$/.test(val);

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', contactNumber: '', password: '', classId: '' });
  const [contactError, setContactError] = useState('');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // View mode: 'all' | 'class'
  const [viewMode, setViewMode] = useState('all');
  const [selectedClassId, setSelectedClassId] = useState('');

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

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/academic/classes', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  // Filter students by search + class if class-wise mode is active
  const filtered = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()));

    if (viewMode === 'class' && selectedClassId) {
      const studentClassId = s.classId?._id || s.classId || '';
      return matchesSearch && studentClassId === selectedClassId;
    }
    return matchesSearch;
  });

  const selectedClassObj = classes.find(c => c._id === selectedClassId);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setForm({ name: '', email: '', contactNumber: '', password: '', classId: '' });
    setContactError('');
    setShowPassword(false);
    setShowModal(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      email: student.email || '',
      contactNumber: student.contactNumber || '',
      password: '',
      classId: student.classId?._id || student.classId || ''
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
      const url = editingStudent
        ? `/api/admin/student/${editingStudent._id}`
        : '/api/admin/student';
      const method = editingStudent ? 'PATCH' : 'POST';

      const payload = { ...form };
      if (editingStudent && !payload.password) {
        delete payload.password;
      }
      if (!payload.classId) delete payload.classId;

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

  const handleViewModeChange = (e) => {
    setViewMode(e.target.value);
    setSelectedClassId('');
    setSearch('');
  };

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={28} strokeWidth={1.5} /> Students
          </h1>
          <p className="page-subtitle">Manage all enrolled students</p>
        </div>

        {/* Right side: View controls + Add button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* View Mode Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              id="view-mode-select"
              className="form-select"
              value={viewMode}
              onChange={handleViewModeChange}
              style={{
                paddingRight: '36px',
                fontWeight: 600,
                cursor: 'pointer',
                appearance: 'none',
                minWidth: '160px',
                background: 'var(--clr-surface)',
                border: '1.5px solid var(--clr-border)',
                borderRadius: '10px',
                height: '40px',
                color: 'var(--clr-text)',
                fontSize: '0.9rem',
              }}
            >
              <option value="all">All Students</option>
              <option value="class">Class-wise</option>
            </select>
            <ChevronDown
              size={15}
              style={{
                position: 'absolute',
                right: '10px',
                pointerEvents: 'none',
                color: 'var(--clr-text-secondary)',
              }}
            />
          </div>

          {/* Class Selector — only visible when class-wise is selected */}
          {viewMode === 'class' && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', animation: 'fadeIn 0.2s ease' }}>
              <select
                id="class-filter-select"
                className="form-select"
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                style={{
                  paddingRight: '36px',
                  minWidth: '170px',
                  cursor: 'pointer',
                  appearance: 'none',
                  background: 'var(--clr-surface)',
                  border: '1.5px solid var(--clr-primary, #6366f1)',
                  borderRadius: '10px',
                  height: '40px',
                  color: 'var(--clr-text)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                <option value="">— Select Class —</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}{cls.section ? ` - ${cls.section}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                style={{
                  position: 'absolute',
                  right: '10px',
                  pointerEvents: 'none',
                  color: 'var(--clr-text-secondary)',
                }}
              />
            </div>
          )}

          {/* Add Student button — always visible */}
          <button id="add-student-btn" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} strokeWidth={2} style={{ marginRight: '4px' }} /> Add Student
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Students', value: students.length, color: '#e8f4fd' },
          { label: 'Classes Active', value: classes.length, color: '#d1fae5' },
          ...(viewMode === 'class' && selectedClassId
            ? [{ label: `Students in ${selectedClassObj?.name || 'Class'}${selectedClassObj?.section ? ' - ' + selectedClassObj.section : ''}`, value: filtered.length, color: '#ede9fe' }]
            : []),
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.color }}>
              <GraduationCap size={24} strokeWidth={1.5} style={{ color: i === 0 ? '#1a7fce' : i === 1 ? '#10b981' : '#7c3aed' }} />
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
          <h3 className="card-title">
            {viewMode === 'class' && selectedClassObj
              ? `${selectedClassObj.name}${selectedClassObj.section ? ' - ' + selectedClassObj.section : ''} — Students`
              : 'All Students'}
          </h3>
          <div className="search-wrap">
            <span className="search-icon"><Search size={16} /></span>
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
        ) : viewMode === 'class' && !selectedClassId ? (
          <div className="empty-state">
            <div className="empty-state-icon"><GraduationCap size={40} strokeWidth={1} /></div>
            <p>Please select a class to view students.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={40} strokeWidth={1} /></div>
            <p>{search ? `No students found matching "${search}"` : 'No students in this class yet.'}</p>
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
                    <td>
                      {s.classId
                        ? <span className="badge badge-primary">{s.classId?.name || s.classId} {s.classId?.section ? `- ${s.classId.section}` : ''}</span>
                        : <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.82rem' }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button id={`edit-student-${s._id}`} className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(s)}>
                          <Pencil size={13} strokeWidth={1.5} style={{ marginRight: '4px' }} />Edit
                        </button>
                        <button id={`delete-student-${s._id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>
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
                <input
                  id="student-contact"
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
                <label className="form-label" htmlFor="student-class">Class *</label>
                <select
                  id="student-class"
                  className="form-select"
                  required
                  value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                >
                  <option value="">— Select Class —</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}{cls.section ? ` - ${cls.section}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="student-password">Password {editingStudent ? '(Leave blank to keep current)' : '*'}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="student-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Password"
                    required={!editingStudent}
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
                <button type="submit" id="submit-add-student" className="btn btn-primary">{editingStudent ? 'Save Changes' : 'Add Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
