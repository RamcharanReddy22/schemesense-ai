import React, { useState } from 'react';
import './DigiLockerModal.css';

// Mock documents data returned after "connecting" DigiLocker
const mockDocs = [
  {
    id: 'aadhaar',
    name: 'Aadhaar Card.pdf',
    size: '120 KB',
    type: 'application/pdf',
    dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcfs... (mock)',
  },
  {
    id: 'pan',
    name: 'PAN Card.pdf',
    size: '80 KB',
    type: 'application/pdf',
    dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcfs... (mock)',
  },
  {
    id: 'income',
    name: 'Income Certificate.pdf',
    size: '95 KB',
    type: 'application/pdf',
    dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcfs... (mock)',
  },
];

export default function DigiLockerModal({ isOpen, onClose, onAddDocs }) {
  const [aadhaar, setAadhaar] = useState('');
  const [error, setError] = useState(null);

  const handleConnect = (e) => {
    e.preventDefault();
    if (!aadhaar || aadhaar.length !== 12) {
      setError('Enter a valid 12‑digit Aadhaar number');
      return;
    }
    // Mock integration: add predefined docs
    onAddDocs(mockDocs);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="digilocker-modal-overlay">
      <div className="digilocker-modal-card">
        <h2 className="digilocker-title">Connect DigiLocker</h2>
        <p className="digilocker-subtitle">Enter your Aadhaar number to fetch documents.</p>
        <form onSubmit={handleConnect} className="digilocker-form">
          <input
            type="text"
            placeholder="Aadhaar number (12 digits)"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
            className="digilocker-input"
            maxLength={12}
            required
          />
          {error && <div className="digilocker-error">{error}</div>}
          <div className="digilocker-actions">
            <button type="button" className="digilocker-btn cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="digilocker-btn primary">Connect</button>
          </div>
        </form>
      </div>
    </div>
  );
}
