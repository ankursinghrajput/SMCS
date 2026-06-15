import { useState } from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, entityName, entityType }) {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = (e) => {
    e.preventDefault();
    if (inputValue === entityName) {
      onConfirm();
      setInputValue('');
    }
  };

  const isMatch = inputValue === entityName;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in-up" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c' }}>
            <AlertTriangle size={20} />
            Confirm Deletion
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)', marginBottom: '16px' }}>
          This action cannot be undone. This will permanently delete the {entityType} <strong>{entityName}</strong>.
        </p>

        <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">
              Please type <strong>{entityName}</strong> to confirm.
            </label>
            <input
              type="text"
              className="form-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={entityName}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              style={{ flex: 1 }}
              disabled={!isMatch}
            >
              Delete {entityType}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
