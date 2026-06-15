import { useState, useEffect } from 'react';
import { BookOpen, Plus, X, Pencil, Trash2, ChevronDown } from 'lucide-react';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';

const emptyForm = { name: '', classId: '', teacher: '', forAllClasses: false };

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null); // null = add mode, obj = edit mode
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  
  // View mode: 'all' | 'class'
  const [viewMode, setViewMode] = useState('all');
  const [selectedClassId, setSelectedClassId] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ─── Fetch helpers ───────────────────────────────────────────────────────────
  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/academic/subjects', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    }
  };

  const fetchMeta = async () => {
    try {
      const [classRes, facRes] = await Promise.all([
        fetch('/api/academic/classes', { credentials: 'include' }),
        fetch('/api/admin/faculties?limit=500', { credentials: 'include' }),
      ]);
      if (classRes.ok) {
        const d = await classRes.json();
        setClasses(d.classes || []);
      }
      if (facRes.ok) {
        const d = await facRes.json();
        setFaculties(d.allFaculties || []);
      }
    } catch (err) {
      console.error('Failed to fetch meta:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchSubjects(), fetchMeta()]);
      setLoading(false);
    };
    init();
  }, []);

  // ─── Modal helpers ────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditSubject(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (subject) => {
    setEditSubject(subject);
    setForm({
      name: subject.name,
      classId: subject.classId?._id || subject.classId || '',
      teacher: subject.teacher?._id || subject.teacher || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditSubject(null);
    setForm(emptyForm);
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!editSubject;
    const isAllClasses = form.classId === 'all';

    if (!form.name.trim() || !form.teacher) {
      alert('Please fill in all fields');
      return;
    }
    if (!isAllClasses && !form.classId) {
      alert('Please select a class');
      return;
    }

    setSaving(true);
    try {
      let url, method, body;

      if (!isEdit && isAllClasses) {
        // Bulk-create across all classes
        url = '/api/academic/subjects/bulk';
        method = 'POST';
        body = JSON.stringify({ name: form.name.trim(), teacher: form.teacher });
      } else {
        url = isEdit ? `/api/academic/subject/${editSubject._id}` : '/api/academic/subject';
        method = isEdit ? 'PATCH' : 'POST';
        body = JSON.stringify({ name: form.name.trim(), classId: form.classId, teacher: form.teacher });
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
        credentials: 'include',
      });
      if (res.ok) {
        await fetchSubjects();
        closeModal();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to save subject');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/academic/subject/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        await fetchSubjects();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete subject');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────────────────
  const displayed = (viewMode === 'class' && selectedClassId)
    ? subjects.filter(s => (s.classId?._id || s.classId) === selectedClassId)
    : subjects;

  const tagColors = [
    { bg: '#dbeafe', text: '#1d4ed8' },
    { bg: '#dcfce7', text: '#15803d' },
    { bg: '#ede9fe', text: '#6d28d9' },
    { bg: '#fef3c7', text: '#b45309' },
    { bg: '#fee2e2', text: '#b91c1c' },
    { bg: '#cffafe', text: '#0e7490' },
  ];
  const colorFor = (id = '') => tagColors[id.charCodeAt(id.length - 1) % tagColors.length];

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in-up">
      {/* Page Header */}
      <div className="page-header page-header-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={28} strokeWidth={1.5} /> Subjects
          </h1>
          <p className="page-subtitle">Manage subjects assigned to classes and teachers</p>
        </div>
        {/* Right side: View controls + Add button */}
        <div className="students-header-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* View Mode Dropdown */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              id="subject-view-mode-select"
              className="form-select"
              value={viewMode}
              onChange={(e) => {
                setViewMode(e.target.value);
                if (e.target.value === 'all') setSelectedClassId('');
              }}
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
              <option value="all">All Subjects</option>
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
                id="subject-filter-class"
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
                {classes.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name}{c.section ? ` - ${c.section}` : ''}
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

          <button id="add-subject-btn" className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} strokeWidth={2} style={{ marginRight: '4px' }} /> Add Subject
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading subjects…</div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <div style={{ opacity: 0.28, marginBottom: '14px' }}><BookOpen size={58} strokeWidth={0.9} /></div>
          <p style={{ color: 'var(--clr-text-muted)', marginBottom: '16px' }}>
            {viewMode === 'class' && selectedClassId ? 'No subjects for this class yet.' : 'No subjects added yet.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            <Plus size={15} strokeWidth={2} style={{ marginRight: '4px' }} /> Add First Subject
          </button>
        </div>
      ) : (
        <div className="subject-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {displayed.map(subject => {
            const cls = subject.classId;
            const teacher = subject.teacher;
            const clsId = cls?._id || subject.classId || '';
            const color = colorFor(clsId);
            const clsLabel = cls ? `${cls.name}${cls.section ? ` - ${cls.section}` : ''}` : '—';

            return (
              <div key={subject._id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'transform 0.18s, box-shadow 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Subject name + actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: color.bg, borderRadius: '10px', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} strokeWidth={1.5} style={{ color: color.text }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>
                        {subject.name}
                      </div>
                      <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 600, borderRadius: '20px', padding: '2px 10px', background: color.bg, color: color.text, marginTop: '3px' }}>
                        {clsLabel}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      id={`edit-subject-${subject._id}`}
                      className="btn-icon"
                      title="Edit subject"
                      onClick={() => openEditModal(subject)}
                      style={{ color: 'var(--clr-primary)' }}
                    >
                      <Pencil size={16} strokeWidth={1.5} />
                    </button>
                    <button
                      id={`delete-subject-${subject._id}`}
                      className="btn-icon"
                      title="Delete subject"
                      onClick={() => handleDelete(subject._id, subject.name)}
                      style={{ color: 'var(--clr-danger)' }}
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Teacher info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'var(--clr-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div className="avatar avatar-success" style={{ width: 30, height: 30, fontSize: '0.7rem', flexShrink: 0 }}>
                    {teacher?.name ? teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--clr-text-primary)' }}>
                      {teacher?.name || 'Unassigned'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>{teacher?.email || ''}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Subject Modal ── */}
      {showModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="subject-modal-title"
          onClick={closeModal}
        >
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', width: '100%' }}>
            <div className="modal-header">
              <h2 className="modal-title" id="subject-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} strokeWidth={1.5} />
                {editSubject ? 'Edit Subject' : 'Add New Subject'}
              </h2>
              <button className="btn-icon" onClick={closeModal} aria-label="Close"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Subject Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="subject-name">Subject Name *</label>
                <input
                  id="subject-name"
                  className="form-input"
                  placeholder="e.g. Mathematics"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Class */}
              <div className="form-group">
                <label className="form-label" htmlFor="subject-class">Assign to Class *</label>
                <select
                  id="subject-class"
                  className="form-select"
                  required
                  value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                >
                  <option value="">— Select Class —</option>
                  {/* Only show 'All Classes' when adding, not editing */}
                  {!editSubject && (
                    <option value="all">All Classes (add to every class)</option>
                  )}
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name}{c.section ? ` - ${c.section}` : ''}
                    </option>
                  ))}
                </select>
                {form.classId === 'all' && (
                  <p style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--clr-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    This subject will be created for all {classes.length} class{classes.length !== 1 ? 'es' : ''} at once.
                  </p>
                )}
              </div>

              {/* Teacher */}
              <div className="form-group">
                <label className="form-label" htmlFor="subject-teacher">Assign Teacher *</label>
                <select
                  id="subject-teacher"
                  className="form-select"
                  required
                  value={form.teacher}
                  onChange={e => setForm(f => ({ ...f, teacher: e.target.value }))}
                >
                  <option value="">— Select Teacher —</option>
                  {faculties.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" id="submit-subject-btn" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editSubject ? 'Save Changes' : 'Add Subject'}
                </button>
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
        entityType="Subject"
      />
    </div>
  );
}
