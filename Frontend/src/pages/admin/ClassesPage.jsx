import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { School, Users, Plus, X, Trash2, UserPlus, Pencil } from 'lucide-react';

export default function ClassesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [classes, setClasses] = useState([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showEditClassModal, setShowEditClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [form, setForm] = useState({ name: '', section: '' });
  const [formEdit, setFormEdit] = useState({ name: '', section: '' });
  const [loading, setLoading] = useState(true);

  // Students modal state
  const [selectedClass, setSelectedClass] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // unassigned students for add dropdown
  const [addStudentId, setAddStudentId] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/academic/classes', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/academic/class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      });
      if (res.ok) {
        fetchClasses();
        setForm({ name: '', section: '' });
        setShowAddClassModal(false);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to add class');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const handleOpenEdit = (cls) => {
    setEditingClass(cls);
    setFormEdit({ name: cls.name, section: cls.section || '' });
    setShowEditClassModal(true);
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/academic/class/${editingClass._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdit),
        credentials: 'include'
      });
      if (res.ok) {
        setFormEdit({ name: '', section: '' });
        setShowEditClassModal(false);
        setEditingClass(null);
        await fetchClasses();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to update class');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const [classToDelete, setClassToDelete] = useState(null);

  const handleDeleteClassClick = (id) => {
    setClassToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!classToDelete) return;
    try {
      const res = await fetch(`/api/academic/class/${classToDelete}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setClassToDelete(null);
        await fetchClasses();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete class');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  // Open students modal for a class
  const openStudentsModal = async (cls) => {
    setSelectedClass(cls);
    setShowStudentsModal(true);
    setStudentsLoading(true);
    setAddStudentId('');
    try {
      // Fetch students in this class
      const res = await fetch(`/api/academic/class/${cls._id}/students`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setClassStudents(data.students || []);
      }
      // If admin, also fetch all unassigned students to show in add dropdown
      if (isAdmin) {
        const allRes = await fetch('/api/admin/students?limit=500', { credentials: 'include' });
        if (allRes.ok) {
          const allData = await allRes.json();
          // Only show students not in this class
          const unassigned = (allData.allStudents || []).filter(
            s => !s.classId || (s.classId._id || s.classId) !== cls._id
          );
          setAllStudents(unassigned);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleAddStudentToClass = async () => {
    if (!addStudentId) return;
    try {
      const res = await fetch(`/api/admin/class/${selectedClass._id}/add-student`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: addStudentId }),
        credentials: 'include'
      });
      if (res.ok) {
        // Refresh both lists
        await openStudentsModal(selectedClass);
        fetchClasses();
        setAddStudentId('');
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to add student');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!confirm('Remove this student from the class?')) return;
    try {
      const res = await fetch(`/api/admin/class/${selectedClass._id}/remove-student`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
        credentials: 'include'
      });
      if (res.ok) {
        await openStudentsModal(selectedClass);
        fetchClasses();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to remove student');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const bgGradients = [
    'linear-gradient(135deg, #1a7fce, #155fa0)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #ef4444, #dc2626)',
    'linear-gradient(135deg, #06b6d4, #0284c7)',
  ];

  return (
    <div className="fade-in-up">
      <div className="page-header page-header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <School size={28} strokeWidth={1.5} /> Classes
          </h1>
          <p className="page-subtitle">Manage school classes and sections</p>
        </div>
        {isAdmin && (
          <button id="add-class-btn" className="btn btn-primary" onClick={() => setShowAddClassModal(true)}>
            <Plus size={16} strokeWidth={2} style={{ marginRight: '4px' }} /> Add Class
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading classes...</div>
      ) : classes.length === 0 ? (
        <div className="empty-state">
          <div style={{ opacity: 0.3, marginBottom: '12px' }}><School size={52} strokeWidth={1} /></div>
          <p>No classes created yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {classes.map((cls, i) => (
            <div
              key={cls._id}
              className="card"
              style={{
                background: bgGradients[i % bgGradients.length],
                color: 'white', border: 'none', padding: '24px 20px',
                cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s',
              }}
              onClick={() => openStudentsModal(cls)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '10px', padding: '10px', marginBottom: '14px', width: 'fit-content' }}>
                  <School size={26} strokeWidth={1.5} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Users size={14} strokeWidth={1.5} />
                    {cls.studentCount ?? 0} Students
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-icon btn-sm"
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                        }}
                        onClick={() => handleOpenEdit(cls)}
                        title="Edit Class"
                      >
                        <Pencil size={13} strokeWidth={2} />
                      </button>
                      <button
                        className="btn btn-icon btn-sm"
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: 'none',
                          padding: '6px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                        }}
                        onClick={() => handleDeleteClassClick(cls._id)}
                        title="Delete Class"
                      >
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>
                {cls.name}{cls.section ? ` - ${cls.section}` : ''}
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                {isAdmin ? 'Click card to manage students' : 'Click card to view students'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Class Modal ── */}
      {showAddClassModal && ReactDOM.createPortal(
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-class-modal-title" onClick={() => setShowAddClassModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="add-class-modal-title">Add New Class</h2>
              <button className="btn-icon" onClick={() => setShowAddClassModal(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddClass}>
              <div className="form-group">
                <label className="form-label" htmlFor="class-name">Class Name *</label>
                <input id="class-name" className="form-input" placeholder="e.g. Class 10" required
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="class-section">Section (Optional)</label>
                <input id="class-section" className="form-input" placeholder="e.g. A"
                  value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddClassModal(false)}>Cancel</button>
                <button type="submit" id="submit-add-class" className="btn btn-primary">Add Class</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Edit Class Modal ── */}
      {showEditClassModal && editingClass && ReactDOM.createPortal(
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-class-modal-title" onClick={() => { setShowEditClassModal(false); setEditingClass(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="edit-class-modal-title">Edit Class</h2>
              <button className="btn-icon" onClick={() => { setShowEditClassModal(false); setEditingClass(null); }} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditClass}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-class-name">Class Name *</label>
                <input id="edit-class-name" className="form-input" placeholder="e.g. Class 10" required
                  value={formEdit.name} onChange={e => setFormEdit(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-class-section">Section (Optional)</label>
                <input id="edit-class-section" className="form-input" placeholder="e.g. A"
                  value={formEdit.section} onChange={e => setFormEdit(f => ({ ...f, section: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowEditClassModal(false); setEditingClass(null); }}>Cancel</button>
                <button type="submit" id="submit-edit-class" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Delete Confirmation Modal ── */}
      {classToDelete && ReactDOM.createPortal(
        <div
          role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title"
          onClick={() => setClassToDelete(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
            padding: '24px',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--clr-surface)',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
              padding: '36px 40px',
              width: '100%',
              maxWidth: '460px',
              animation: 'popIn 0.2s ease',
            }}
          >
            {/* Icon + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(239,68,68,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Trash2 size={22} color="#ef4444" strokeWidth={2} />
              </div>
              <div>
                <h2 id="delete-confirm-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--clr-text-primary)', margin: 0 }}>Delete Class?</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', margin: '2px 0 0' }}>This action cannot be undone</p>
              </div>
              <button
                onClick={() => setClassToDelete(null)}
                aria-label="Close"
                style={{ marginLeft: 'auto', background: 'var(--clr-bg)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--clr-text-muted)', flexShrink: 0 }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Body text */}
            <p style={{ color: 'var(--clr-text-secondary)', fontSize: '0.93rem', lineHeight: '1.65', margin: '0 0 28px' }}>
              Are you sure you want to delete this class? All students currently assigned to it will be dissociated. You won't be able to recover this class.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setClassToDelete(null)}
                style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: '10px 24px', borderRadius: '10px', fontWeight: 600,
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Trash2 size={15} strokeWidth={2} /> Delete Class
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Students in Class Modal ── */}
      {showStudentsModal && selectedClass && ReactDOM.createPortal(
        <div
          className="modal-overlay"
          role="dialog" aria-modal="true"
          aria-labelledby="class-students-modal-title"
          onClick={() => setShowStudentsModal(false)}
        >
          <div
            className="modal"
            style={{ maxWidth: '600px', width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title" id="class-students-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} strokeWidth={1.5} />
                {selectedClass.name}{selectedClass.section ? ` - ${selectedClass.section}` : ''} — Students
              </h2>
              <button className="btn-icon" onClick={() => setShowStudentsModal(false)} aria-label="Close"><X size={18} /></button>
            </div>

            {/* Admin: Add student to class */}
            {isAdmin && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" htmlFor="add-student-select">Add Student to Class</label>
                  <select
                    id="add-student-select"
                    className="form-select"
                    value={addStudentId}
                    onChange={e => setAddStudentId(e.target.value)}
                  >
                    <option value="">— Select Student —</option>
                    {allStudents.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.contactNumber})</option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleAddStudentToClass}
                  disabled={!addStudentId}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <UserPlus size={16} strokeWidth={1.5} /> Add
                </button>
              </div>
            )}

            {studentsLoading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading students...</div>
            ) : classStudents.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <div style={{ opacity: 0.3, marginBottom: '8px' }}><Users size={40} strokeWidth={1} /></div>
                <p style={{ color: 'var(--clr-text-muted)' }}>No students in this class yet.</p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)', marginBottom: '10px' }}>
                  {classStudents.length} student{classStudents.length !== 1 ? 's' : ''} enrolled
                </div>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Contact</th>
                        {isAdmin && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map(s => (
                        <tr key={s._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="avatar avatar-primary" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                                {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--clr-text-secondary)' }}>{s.contactNumber}</td>
                          {isAdmin && (
                            <td>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleRemoveStudent(s._id)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={13} strokeWidth={1.5} /> Remove
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
