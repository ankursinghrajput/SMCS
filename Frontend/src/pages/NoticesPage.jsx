import { useState } from 'react';
import { dummyNotices } from '../data/dummyData';
import { useAuth } from '../context/AuthContext';

export default function NoticesPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterAudience, setFilterAudience] = useState('all');

  const isAdmin = user?.role === 'admin';

  const filtered = dummyNotices.filter(n => {
    if (filterAudience === 'all') return true;
    return n.audience === filterAudience;
  });

  const audienceConfig = {
    all: { label: 'Everyone', cls: 'badge-primary', color: 'var(--clr-primary)' },
    student: { label: 'Students', cls: 'badge-success', color: 'var(--clr-secondary)' },
    faculty: { label: 'Faculty', cls: 'badge-accent', color: 'var(--clr-accent)' },
  };

  const openNotice = (notice) => {
    setSelected(notice);
    setShowModal(true);
  };

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">📢 Notice Board</h1>
          <p className="page-subtitle">Stay updated with important announcements</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'student', 'faculty'].map(a => (
              <button
                key={a}
                id={`notice-filter-${a}`}
                className={`btn ${filterAudience === a ? 'btn-primary' : 'btn-outline'} btn-sm`}
                onClick={() => setFilterAudience(a)}
                style={{ textTransform: 'capitalize' }}
              >
                {a === 'all' ? 'All' : audienceConfig[a].label}
              </button>
            ))}
          </div>
          {isAdmin && (
            <button id="add-notice-btn" className="btn btn-secondary btn-sm">
              + Add Notice
            </button>
          )}
        </div>
      </div>

      {/* Notice Cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>No notices found for this audience.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((n, i) => {
            const conf = audienceConfig[n.audience] || audienceConfig.all;
            return (
              <div
                key={i}
                className="card"
                style={{ cursor: 'pointer', padding: '20px 24px', borderLeft: `4px solid ${conf.color}`, transition: 'all 0.2s' }}
                onClick={() => openNotice(n)}
                role="button"
                tabIndex={0}
                id={`notice-item-${n._id}`}
                onKeyDown={e => e.key === 'Enter' && openNotice(n)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--clr-text-primary)' }}>{n.title}</h3>
                      <span className={`badge ${conf.cls}`}>{conf.label}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                      {n.description.slice(0, 120)}{n.description.length > 120 ? '...' : ''}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>
                      📅 {new Date(n.createdAt).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        id={`edit-notice-${n._id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); }}
                        aria-label="Edit notice"
                      >
                        ✏️
                      </button>
                      <button
                        id={`delete-notice-${n._id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); }}
                        aria-label="Delete notice"
                        style={{ color: 'var(--clr-danger)' }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notice Detail Modal */}
      {showModal && selected && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-notice-title" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="modal-notice-title">📢 Notice</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close notice">✕</button>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`badge ${audienceConfig[selected.audience]?.cls}`}>
                {audienceConfig[selected.audience]?.label}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
                {new Date(selected.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>
              {selected.title}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)', lineHeight: 1.7 }}>
              {selected.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
