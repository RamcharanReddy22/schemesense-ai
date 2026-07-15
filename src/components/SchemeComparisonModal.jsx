import React from 'react';

export default function SchemeComparisonModal({ schemes, onClose }) {
  if (!schemes || schemes.length === 0) return null;

  return (
    <div className="scheme-modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="scheme-modal-card view-enter" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', width: '90%' }}>
        <div className="scheme-modal-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <h2 className="scheme-modal-title">Scheme Comparison</h2>
          <p className="scheme-modal-ministry">Compare requirements and benefits side-by-side</p>
          <button className="btn-close-modal" onClick={onClose} aria-label="Close details">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="scheme-modal-body" style={{ padding: '0 1.5rem 1.5rem' }}>
          <div className="comparison-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="eligibility-table" style={{ width: '100%', minWidth: '600px' }}>
              <thead>
                <tr>
                  <th style={{ width: '20%', background: 'var(--surface-1)' }}>Feature</th>
                  {schemes.map((s, idx) => (
                    <th key={idx} style={{ width: `${80 / schemes.length}%`, fontSize: '1.1rem', color: 'var(--primary)' }}>
                      {s.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Ministry</th>
                  {schemes.map((s, idx) => <td key={idx}>{s.ministry}</td>)}
                </tr>
                <tr>
                  <th>Target Category</th>
                  {schemes.map((s, idx) => <td key={idx}>{s.category}</td>)}
                </tr>
                <tr>
                  <th>State / Scope</th>
                  {schemes.map((s, idx) => <td key={idx}>{s.type} - {s.state === 'All' ? 'All India' : s.state}</td>)}
                </tr>
                <tr>
                  <th>Age Requirement</th>
                  {schemes.map((s, idx) => <td key={idx}>{s.rules.minAge} to {s.rules.maxAge} years</td>)}
                </tr>
                <tr>
                  <th>Gender Requirement</th>
                  {schemes.map((s, idx) => <td key={idx}>{s.rules.genders.join(', ')}</td>)}
                </tr>
                <tr>
                  <th>Income Limit</th>
                  {schemes.map((s, idx) => <td key={idx}>{s.rules.maxIncome === 9999999 ? 'No Limit' : `₹${s.rules.maxIncome.toLocaleString()}`}</td>)}
                </tr>
                <tr>
                  <th>Key Benefits</th>
                  {schemes.map((s, idx) => (
                    <td key={idx}>
                      <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                        {s.benefits.slice(0, 3).map((b, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{b}</li>)}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th>Required Documents</th>
                  {schemes.map((s, idx) => (
                    <td key={idx}>
                      <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                        {s.documents.slice(0, 4).map((d, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{d}</li>)}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
