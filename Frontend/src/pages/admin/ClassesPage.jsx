import { useState } from 'react';
import { dummyClasses } from '../../data/dummyData';

export default function ClassesPage() {
  const [classes, setClasses] = useState(dummyClasses);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    setClasses(prev => [...prev, { _id: Date.now().toString(), name: form.name, students: 0 }]);
    setForm({ name: '' });
    setShowModal(false);
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
              color: 'white', border: 'none'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏫</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>
                {cls.name}
              </div>
              <div style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: '16px' }}>
                {cls.students} students enrolled
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button id={`edit-class-${cls._id}`} className="btn btn-sm" style={{
                  flex: 1, background: 'rgba(255,255,255,0.2)',
                  color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)'
                }}>✏️ Edit</button>
                <button id={`delete-class-${cls._id}`} className="btn btn-sm" style={{
                  background: 'rgba(255,255,255,0.15)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)'
                }}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

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
                <input id="class-name" className="form-input" placeholder="e.g. Class 10-A" required
                  value={form.name} onChange={e => setForm({ name: e.target.value })} />
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
