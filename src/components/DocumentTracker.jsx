/**
 * PLAN: DocumentTracker — Feature 4 (HIGH priority)
 * 
 * Problem: myScheme lists documents needed but never tells users which ones they already have
 * vs. which ones are missing. Citizens spend hours collecting wrong documents.
 * 
 * Solution: A persistent, localStorage-backed document wallet. When a user opens a scheme,
 * they can check off each required document. Progress is saved, and a visual % ring shows
 * how "ready" they are to apply. The "Apply" button glows green only when 100% ready.
 * 
 * Tech: React + localStorage. No new dependencies. Reads the `documents[]` array already
 * present in every scheme in schemes.json.
 */

import React, { useState, useEffect } from 'react';

// Normalizes a doc string to a stable key
const docKey = (schemeId, docText) =>
  `doccheck_${schemeId}_${docText.replace(/\s+/g, '_').toLowerCase().slice(0, 40)}`;

export default function DocumentTracker({ scheme, lang = 'en' }) {
  const docs = scheme?.documents || [];
  
  // Load persisted check states from localStorage
  const [checked, setChecked] = useState(() => {
    const initial = {};
    docs.forEach(doc => {
      const key = docKey(scheme.id, doc);
      initial[doc] = localStorage.getItem(key) === 'true';
    });
    return initial;
  });

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const total = docs.length;
  const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  const toggle = (doc) => {
    const newVal = !checked[doc];
    setChecked(prev => ({ ...prev, [doc]: newVal }));
    localStorage.setItem(docKey(scheme.id, doc), String(newVal));
  };

  const resetAll = () => {
    const updated = {};
    docs.forEach(doc => {
      localStorage.removeItem(docKey(scheme.id, doc));
      updated[doc] = false;
    });
    setChecked(updated);
  };

  if (docs.length === 0) return null;

  const ringColor = percent === 100 ? '#16a34a' : percent >= 50 ? '#FF9933' : '#003366';
  const statusLabel =
    percent === 100 ? (lang === 'hi' ? 'आवेदन के लिए तैयार!' : lang === 'te' ? 'దరఖాస్తుకు సిద్ధం!' : 'Ready to Apply!') :
    percent >= 50 ? (lang === 'hi' ? 'लगभग तैयार' : lang === 'te' ? 'దాదాపు సిద్ధం' : 'Almost Ready') :
    (lang === 'hi' ? 'दस्तावेज़ इकट्ठे करें' : lang === 'te' ? 'పత్రాలు సేకరించండి' : 'Collect Your Documents');

  const title = lang === 'hi' ? 'दस्तावेज़ तत्परता ट्रैकर' :
                lang === 'te' ? 'పత్రాల సంసిద్ధత ట్రాకర్' :
                'Document Readiness Tracker';
  const subtitle = lang === 'hi' ? 'जो दस्तावेज़ आपके पास हैं उन्हें चेक करें' :
                   lang === 'te' ? 'మీ వద్ద ఉన్న పత్రాలను టిక్ చేయండి' :
                   'Tick the documents you already have';

  return (
    <div className="doc-tracker-container">
      {/* Header with progress ring */}
      <div className="doc-tracker-header">
        <div>
          <h3 className="doc-tracker-title">{title}</h3>
          <p className="doc-tracker-subtitle">{subtitle}</p>
        </div>
        <div className="doc-progress-ring-wrap" title={`${percent}% ready`}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="6"/>
            <circle
              cx="32" cy="32" r="26"
              fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 26}`}
              strokeDashoffset={`${2 * Math.PI * 26 * (1 - percent / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
              style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s' }}
            />
            <text x="32" y="36" textAnchor="middle" fontSize="13" fontWeight="700" fill={ringColor}>{percent}%</text>
          </svg>
        </div>
      </div>

      {/* Status label */}
      <div className="doc-status-label" style={{ color: ringColor }}>
        {percent === 100 && <span>✅ </span>}
        {statusLabel}
      </div>

      {/* Document checklist */}
      <ul className="doc-checklist">
        {docs.map((doc, i) => (
          <li
            key={i}
            className={`doc-checklist-item ${checked[doc] ? 'checked' : ''}`}
            onClick={() => toggle(doc)}
            role="checkbox"
            aria-checked={checked[doc]}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && toggle(doc)}
          >
            <span className="doc-checkbox">
              {checked[doc]
                ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect width="16" height="16" rx="4" fill="#16a34a"/><path d="M4 8l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect width="16" height="16" rx="4" stroke="#cbd5e1" strokeWidth="1.5"/></svg>
              }
            </span>
            <span className="doc-label">{doc}</span>
          </li>
        ))}
      </ul>

      {/* Reset link */}
      {checkedCount > 0 && (
        <button className="doc-reset-btn" onClick={resetAll}>
          ↺ {lang === 'hi' ? 'रीसेट करें' : lang === 'te' ? 'రీసెట్' : 'Reset checklist'}
        </button>
      )}

      <style>{`
        .doc-tracker-container {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          margin-top: 1rem;
        }
        .doc-tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          gap: 1rem;
        }
        .doc-tracker-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #003366;
          margin: 0 0 0.2rem;
        }
        .doc-tracker-subtitle {
          font-size: 0.78rem;
          color: #64748b;
          margin: 0;
        }
        .doc-progress-ring-wrap { flex-shrink: 0; }
        .doc-status-label {
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .doc-checklist {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .doc-checklist-item {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.6rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
          border: 1px solid transparent;
          background: white;
        }
        .doc-checklist-item:hover { background: #f1f5f9; border-color: #e2e8f0; }
        .doc-checklist-item.checked { background: #f0fdf4; border-color: #bbf7d0; }
        .doc-checkbox { flex-shrink: 0; margin-top: 2px; }
        .doc-label {
          font-size: 0.82rem;
          color: #374151;
          line-height: 1.4;
        }
        .doc-checklist-item.checked .doc-label {
          text-decoration: line-through;
          color: #9ca3af;
        }
        .doc-reset-btn {
          margin-top: 0.75rem;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
        .doc-reset-btn:hover { color: #64748b; }
      `}</style>
    </div>
  );
}
