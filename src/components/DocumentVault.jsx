import React, { useState, useEffect, useRef } from 'react';
import './DocumentVault.css';

const VAULT_KEY = 'schemesense_vault_docs';

const DOC_TYPES = [
  { id: 'aadhaar',   label: 'Aadhaar Card',          icon: '🪪', color: '#3b82f6' },
  { id: 'pan',       label: 'PAN Card',               icon: '💳', color: '#8b5cf6' },
  { id: 'income',    label: 'Income Certificate',     icon: '📄', color: '#10b981' },
  { id: 'caste',     label: 'Caste Certificate',      icon: '📜', color: '#f59e0b' },
  { id: 'domicile',  label: 'Domicile/Residence',     icon: '🏠', color: '#ef4444' },
  { id: 'land',      label: 'Land Records (RTC)',      icon: '🌾', color: '#84cc16' },
  { id: 'bank',      label: 'Bank Passbook',           icon: '🏦', color: '#06b6d4' },
  { id: 'photo',     label: 'Passport Photo',         icon: '🖼️', color: '#ec4899' },
];

export default function DocumentVault() {
  const [vault, setVault] = useState({});
  const [uploading, setUploading] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const [activeUploadType, setActiveUploadType] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(VAULT_KEY);
    if (stored) setVault(JSON.parse(stored));
  }, []);

  const saveVault = (newVault) => {
    setVault(newVault);
    localStorage.setItem(VAULT_KEY, JSON.stringify(newVault));
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUploadClick = (docId) => {
    setActiveUploadType(docId);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !activeUploadType) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('File too large. Max 5MB allowed.', 'error');
      e.target.value = '';
      return;
    }

    setUploading(activeUploadType);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newVault = {
        ...vault,
        [activeUploadType]: {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type,
          dataUrl: ev.target.result,
          uploadedAt: new Date().toLocaleDateString('en-IN'),
        }
      };
      saveVault(newVault);
      setUploading(null);
      showToast('Document saved securely in your local Vault! ✅');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDelete = (docId) => {
    const newVault = { ...vault };
    delete newVault[docId];
    saveVault(newVault);
    showToast('Document removed from Vault.', 'info');
  };

  const storedCount = Object.keys(vault).length;

  return (
    <div className="vault-container">
      {toast && (
        <div className={`vault-toast vault-toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*,application/pdf"
        onChange={handleFileChange}
      />

      <div className="vault-header">
        <div className="vault-title-row">
          <span className="vault-shield-icon">🔒</span>
          <div>
            <h2 className="vault-title">Secure Document Vault</h2>
            <p className="vault-subtitle">
              Zero-Trust Local Storage — Your documents <strong>never leave your device</strong>. Stored only in your browser.
            </p>
          </div>
        </div>
        <div className="vault-stats-badge">
          <span className="vault-count">{storedCount}</span>
          <span className="vault-count-label">/ {DOC_TYPES.length} docs stored</span>
        </div>
      </div>

      <div className="vault-progress-bar-wrap">
        <div className="vault-progress-bar" style={{ width: `${(storedCount / DOC_TYPES.length) * 100}%` }} />
      </div>

      <div className="vault-grid">
        {DOC_TYPES.map(doc => {
          const stored = vault[doc.id];
          const isLoading = uploading === doc.id;
          return (
            <div key={doc.id} className={`vault-card ${stored ? 'vault-card-stored' : ''}`}>
              <div className="vault-card-icon" style={{ background: doc.color + '22', color: doc.color }}>
                {doc.icon}
              </div>
              <div className="vault-card-info">
                <span className="vault-card-label">{doc.label}</span>
                {stored ? (
                  <span className="vault-card-meta">
                    ✅ {stored.name.length > 18 ? stored.name.slice(0,18) + '…' : stored.name} · {stored.size}
                  </span>
                ) : (
                  <span className="vault-card-meta vault-card-empty">Not uploaded yet</span>
                )}
              </div>
              <div className="vault-card-actions">
                {isLoading ? (
                  <span className="vault-spinner">⏳</span>
                ) : stored ? (
                  <>
                    <a
                      href={stored.dataUrl}
                      download={stored.name}
                      className="vault-btn vault-btn-view"
                      title="Download"
                    >⬇</a>
                    <button
                      className="vault-btn vault-btn-delete"
                      onClick={() => handleDelete(doc.id)}
                      title="Remove"
                    >✖</button>
                  </>
                ) : (
                  <button
                    className="vault-btn vault-btn-upload"
                    onClick={() => handleUploadClick(doc.id)}
                  >
                    + Upload
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {storedCount === DOC_TYPES.length && (
        <div className="vault-complete-banner">
          🎉 Your Vault is complete! You can now apply to any scheme in 1 click without re-uploading documents.
        </div>
      )}
    </div>
  );
}
