import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Clock, CalendarX, Pencil, Trash2, Plus, X } from 'lucide-react';

// Helper: days remaining from expiresAt
function getDaysRemaining(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Helper: days used out of total duration
function getDurationDays(createdAt, expiresAt) {
  if (!expiresAt || !createdAt) return null;
  return Math.round((new Date(expiresAt) - new Date(createdAt)) / (1000 * 60 * 60 * 24));
}

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', audience: 'all', durationDays: '' });
  const [filterAudience, setFilterAudience] = useState('all');
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/admin/notice', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotices(data.notices || []);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const filtered = notices.filter(n => {
    if (filterAudience === 'all') return true;
    return n.audience === filterAudience;
  });

  const audienceConfig = {
    all:     { label: 'Everyone', cls: 'badge-primary', color: 'var(--clr-primary)' },
    student: { label: 'Students', cls: 'badge-success', color: 'var(--clr-secondary)' },
    faculty: { label: 'Faculty',  cls: 'badge-accent',  color: 'var(--clr-accent)' },
  };

  const openNotice = (notice) => { setSelected(notice); setShowModal(true); };

  const handleOpenAdd = () => {
    setEditingNotice(null);
    setForm({ title: '', description: '', audience: 'all', durationDays: '' });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (notice) => {
    setEditingNotice(notice);
    const totalDays = getDurationDays(notice.createdAt, notice.expiresAt);
    setForm({
      title: notice.title,
      description: notice.description,
      audience: notice.audience,
      durationDays: totalDays !== null ? String(totalDays) : '',
    });
    setShowAddEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingNotice ? `/api/admin/notice/${editingNotice._id}` : '/api/admin/notice';
      const method = editingNotice ? 'PATCH' : 'POST';
      const payload = {
        title: form.title,
        description: form.description,
        audience: form.audience,
        durationDays: form.durationDays ? Number(form.durationDays) : 0,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (res.ok) {
        fetchNotices();
        setShowAddEditModal(false);
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
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await fetch(`/api/admin/notice/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchNotices();
      else { const e = await res.json(); alert(e.message || 'Failed to delete'); }
    } catch (err) { console.error(err); }
  };

  // Expiry badge component
  const ExpiryBadge = ({ notice }) => {
    if (!notice.expiresAt) {
      return (
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          fontSize: '0.7rem', color: 'var(--clr-text-muted)',
          background: 'var(--clr-bg)', borderRadius: '20px',
          padding: '3px 9px', border: '1px solid var(--clr-border)'
        }}>
          <Clock size={11} strokeWidth={2} /> No expiry
        </span>
      );
    }
    const daysLeft = getDaysRemaining(notice.expiresAt);
    const totalDays = getDurationDays(notice.createdAt, notice.expiresAt);
    const progress = totalDays > 0 ? Math.max(0, Math.min(100, (daysLeft / totalDays) * 100)) : 0;
    const color = daysLeft === 0 ? '#ef4444' : daysLeft <= 2 ? '#f59e0b' : '#10b981';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Mini progress arc */}
        <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
          <svg width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="none" stroke="var(--clr-border)" strokeWidth="3" />
            <circle
              cx="16" cy="16" r="12" fill="none"
              stroke={color} strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - progress / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 16 16)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem', fontWeight: 700, color
          }}>
            {daysLeft}d
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', color, fontWeight: 600 }}>
          {daysLeft === 0 ? 'Expires today' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
        </span>
      </div>
    );
  };

  return (
    <div className="fade-in-up">
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={28} strokeWidth={1.5} /> Notice Board
          </h1>
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
            <button id="add-notice-btn" className="btn btn-secondary btn-sm" onClick={handleOpenAdd}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Plus size={15} strokeWidth={2} /> Add Notice
            </button>
          )}
        </div>
      </div>

      {/* Notice Cards */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--clr-text-secondary)' }}>Loading notices...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ opacity: 0.3, marginBottom: '12px' }}><Megaphone size={48} strokeWidth={1} /></div>
          <p>No notices found for this audience.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((n, i) => {
            const conf = audienceConfig[n.audience] || audienceConfig.all;
            const daysLeft = getDaysRemaining(n.expiresAt);
            const isExpiringSoon = daysLeft !== null && daysLeft <= 2;

            return (
              <div
                key={n._id || i}
                className="card"
                style={{
                  cursor: 'pointer', padding: '20px 24px',
                  borderLeft: `4px solid ${conf.color}`,
                  transition: 'all 0.2s',
                  outline: isExpiringSoon ? `1px solid #f59e0b30` : 'none',
                  background: isExpiringSoon ? '#fffbeb' : undefined,
                }}
                onClick={() => openNotice(n)}
                role="button"
                tabIndex={0}
                id={`notice-item-${n._id}`}
                onKeyDown={e => e.key === 'Enter' && openNotice(n)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--clr-text-primary)' }}>{n.title}</h3>
                      <span className={`badge ${conf.cls}`}>{conf.label}</span>
                      {isExpiringSoon && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          background: '#fef3c7', color: '#92400e',
                          border: '1px solid #fde68a', borderRadius: '20px',
                          fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px'
                        }}>
                          <CalendarX size={10} strokeWidth={2} /> Expiring soon
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                      {n.description.slice(0, 120)}{n.description.length > 120 ? '...' : ''}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} strokeWidth={1.5} />
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <ExpiryBadge notice={n} />
                    </div>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        id={`edit-notice-${n._id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); handleOpenEdit(n); }}
                        aria-label="Edit notice"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Pencil size={13} strokeWidth={1.5} />
                      </button>
                      <button
                        id={`delete-notice-${n._id}`}
                        className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); handleDelete(n._id); }}
                        aria-label="Delete notice"
                        style={{ color: 'var(--clr-danger)', display: 'flex', alignItems: 'center' }}
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Notice Detail Modal ── */}
      {showModal && selected && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-notice-title" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="modal-notice-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={20} strokeWidth={1.5} /> Notice
              </h2>
              <button className="btn-icon" onClick={() => setShowModal(false)} aria-label="Close notice"><X size={18} /></button>
            </div>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`badge ${audienceConfig[selected.audience]?.cls}`}>
                {audienceConfig[selected.audience]?.label}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)' }}>
                {new Date(selected.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <ExpiryBadge notice={selected} />
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

      {/* ── Add/Edit Modal ── */}
      {showAddEditModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-edit-notice-title" onClick={() => setShowAddEditModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="add-edit-notice-title">{editingNotice ? 'Edit Notice' : 'Add New Notice'}</h2>
              <button className="btn-icon" onClick={() => setShowAddEditModal(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="notice-title">Title *</label>
                <input id="notice-title" className="form-input" placeholder="Notice Title" required
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="notice-desc">Description *</label>
                <textarea id="notice-desc" className="form-input" style={{ minHeight: '120px', resize: 'vertical' }}
                  placeholder="Notice description..." required
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                  <label className="form-label" htmlFor="notice-audience">Audience *</label>
                  <select id="notice-audience" className="form-select" value={form.audience}
                    onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
                    <option value="all">Everyone</option>
                    <option value="student">Students</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                  <label className="form-label" htmlFor="notice-duration" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={13} strokeWidth={1.5} /> Visible for (days)
                  </label>
                  <input
                    id="notice-duration"
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    placeholder="e.g. 7  (leave blank = forever)"
                    value={form.durationDays}
                    onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))}
                  />
                  {form.durationDays && Number(form.durationDays) > 0 && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CalendarX size={11} strokeWidth={1.5} />
                      Expires on: {(() => {
                        const d = new Date();
                        d.setDate(d.getDate() + Number(form.durationDays));
                        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                      })()}
                    </div>
                  )}
                  {(!form.durationDays || Number(form.durationDays) === 0) && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--clr-text-muted)', marginTop: '4px' }}>
                      Leave blank or 0 for no expiry
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddEditModal(false)}>Cancel</button>
                <button type="submit" id="submit-add-notice" className="btn btn-primary">
                  {editingNotice ? 'Save Changes' : 'Add Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
