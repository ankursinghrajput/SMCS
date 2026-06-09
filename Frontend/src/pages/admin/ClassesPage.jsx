import { useState, useEffect } from 'react';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', section: '' });
  const [loading, setLoading] = useState(true);

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

  const handleAdd = async (e) => {
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
        setShowModal(false);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to add class');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">🏫 Classes</h1>
          <p className="page-subtitle">Manage school classes and sections</p>
        </div>
        <button id="add-class-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add Class
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading classes...</div>
      ) : classes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏫</div>
          <p>No classes created yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {classes.map((cls, i) => {
            const bgGradients = [
              'linear-gradient(135deg, #1a7fce, #155fa0)',
              'linear-gradient(135deg, #10b981, #059669)',
              'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              'linear-gradient(135deg, #f59e0b, #d97706)',
              'linear-gradient(135deg, #ef4444, #dc2626)',
              'linear-gradient(135deg, #06b6d4, #0284c7)',
            ];
            return (
              <div key={cls._id} className="card" style={{
                background: bgGradients[i % bgGradients.length],
                color: 'white', border: 'none', padding: '24px 20px'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏫</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
                  {cls.name} {cls.section ? `- ${cls.section}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-class-modal-title" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="add-class-modal-title">Add New Class</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleAdd}>
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
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" id="submit-add-class" className="btn btn-primary">Add Class</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
