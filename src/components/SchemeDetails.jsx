import React, { useState } from 'react';
import { translations } from '../data/localization';

export default function SchemeDetails({ scheme, onClose, onApply, lang = 'en' }) {
  const t = translations[lang] || translations.en;
  const getCategoryName = (catEn) => (t.categories && t.categories[catEn]) ? t.categories[catEn] : catEn;

  const [activeTab, setActiveTab] = useState('about');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  
  // Interactive checklist state
  // Pre-fill user responses as null, meaning unanswered
  const [checklistAnswers, setChecklistAnswers] = useState(
    scheme.checklist ? scheme.checklist.reduce((acc, curr) => ({ ...acc, [curr.id]: null }), {}) : {}
  );

  const toggleFaq = (index) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  const handleChecklistChange = (qId, answer) => {
    setChecklistAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  // Evaluate interactive eligibility
  const evaluateChecklistEligibility = () => {
    if (!scheme.checklist || scheme.checklist.length === 0) return { evaluated: true, eligible: true, failedQuestions: [] };

    let eligible = true;
    let failedQuestions = [];
    let unansweredCount = 0;

    scheme.checklist.forEach(item => {
      const answer = checklistAnswers[item.id];
      if (answer === null) {
        unansweredCount++;
        return;
      }

      if (item.required) {
        // Must be true
        if (answer !== true) {
          eligible = false;
          failedQuestions.push(item.text);
        }
      } else {
        // Exclusions: check against expectedAnswer if specified
        const expected = item.expectedAnswer !== undefined ? item.expectedAnswer : true;
        if (answer !== expected) {
          eligible = false;
          failedQuestions.push(item.text);
        }
      }
    });

    if (unansweredCount > 0) {
      return { evaluated: false, eligible: false, failedQuestions: [] };
    }

    return { evaluated: true, eligible, failedQuestions };
  };

  const eligibilityStatus = evaluateChecklistEligibility();

  return (
    <div className="scheme-modal-overlay" onClick={onClose}>
      <div className="scheme-modal-card view-enter" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="scheme-modal-header">
          <div className="modal-meta-row">
            <span className="badge badge-primary">{getCategoryName(scheme.category)}</span>
            <span className={`badge ${scheme.type === 'Central' ? 'badge-saffron' : 'badge-emerald'}`}>
              {scheme.type === 'Central' ? t.centralSchemesOnly : t.stateSchemesOnly} ({scheme.state === 'All' ? 'All India' : scheme.state})
            </span>
          </div>
          <h2 className="scheme-modal-title">{scheme[`title_${lang}`] || scheme.title}</h2>
          <p className="scheme-modal-ministry">{scheme[`ministry_${lang}`] || scheme.ministry}</p>
          <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn-close-modal" 
              onClick={() => {
                const message = `Check out this government scheme: ${scheme.title}%0A%0A${scheme.description}%0A%0AApply here: https://schemesense-ai.netlify.app`;
                window.open(`https://wa.me/?text=${message}`, '_blank');
              }}
              aria-label="Share on WhatsApp"
              style={{ background: '#25D366', color: 'white', border: 'none' }}
              title="Share on WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
            </button>
            <button className="btn-close-modal" onClick={onClose} aria-label="Close details">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Tabs Navigator */}
        <div className="scheme-modal-tabs">
          {[
            { id: 'about', label: 'About & Benefits' },
            { id: 'eligibility', label: 'Eligibility Criteria' },
            { id: 'documents', label: 'Process & Documents' },
            { id: 'faqs', label: 'FAQs' },
            { id: 'checker', label: 'Check Eligibility Tool' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`modal-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content Scrollbox */}
        <div className="scheme-modal-body">
          
          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="tab-pane-content">
              <div className="section-block">
                <h3>About the Scheme</h3>
                <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>{scheme[`description_${lang}`] || scheme.description}</p>
                <p style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {scheme.eligibilityText}
                </p>
              </div>

              <div className="section-block" style={{ marginTop: '2rem' }}>
                <h3>Key Benefits</h3>
                <ul className="details-bullet-list">
                  {scheme.benefits.map((benefit, idx) => (
                    <li key={idx}>
                      <span className="bullet-icon-check">✓</span>
                      <div>{benefit}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ELIGIBILITY TAB */}
          {activeTab === 'eligibility' && (
            <div className="tab-pane-content">
              <div className="section-block">
                <h3>Inclusion Criteria (Who is eligible)</h3>
                <p className="tab-desc-text">In general, citizens matching the following demographic variables are eligible:</p>
                <table className="eligibility-table">
                  <tbody>
                    <tr>
                      <th>Age Bracket</th>
                      <td>{scheme.rules.minAge} to {scheme.rules.maxAge} years</td>
                    </tr>
                    <tr>
                      <th>Allowed Genders</th>
                      <td>{scheme.rules.genders.join(', ')}</td>
                    </tr>
                    <tr>
                      <th>Social Group (Caste)</th>
                      <td>{scheme.rules.castes.indexOf('All') !== -1 ? 'All Categories (General/OBC/SC/ST)' : scheme.rules.castes.join(', ')}</td>
                    </tr>
                    <tr>
                      <th>Max Annual Income</th>
                      <td>{scheme.rules.maxIncome === 9999999 ? 'No Limit' : `₹${scheme.rules.maxIncome.toLocaleString()} or less`}</td>
                    </tr>
                    <tr>
                      <th>Residence Zone</th>
                      <td>{scheme.rules.residency.indexOf('Both') !== -1 ? 'Rural & Urban' : scheme.rules.residency.join(', ')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="section-block" style={{ marginTop: '2rem' }}>
                <h3>Exclusion Criteria (Who is not eligible)</h3>
                <div className="exclusion-card">
                  <p>{scheme.exclusionText}</p>
                </div>
              </div>
            </div>
          )}

          {/* PROCESS & DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="tab-pane-content">
              <div className="grid-2">
                <div className="section-block">
                  <h3>Application Process</h3>
                  <ol className="details-ordered-list">
                    {scheme.steps.map((stepText, idx) => (
                      <li key={idx}>
                        <span className="step-num-badge">{idx + 1}</span>
                        <p>{stepText}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="section-block">
                  <h3>Documents Required</h3>
                  <div className="document-checklist-wrapper" style={{ marginTop: '1rem' }}>
                    <div className="checklist-progress" style={{ marginBottom: '1rem', background: 'var(--surface-1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ready to apply?</span>
                      <span style={{ fontWeight: 'bold', color: 'var(--emerald)' }}>Check off what you have</span>
                    </div>
                    {scheme.documents.map((doc, idx) => (
                      <label key={idx} className="document-checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: 'var(--saffron)', cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.95rem' }}>{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQS TAB */}
          {activeTab === 'faqs' && (
            <div className="tab-pane-content">
              <h3>Frequently Asked Questions</h3>
              <p className="tab-desc-text">Common inquiries regarding this scheme and application status:</p>
              <div className="faqs-accordion-list">
                {scheme.faqs.map((faq, idx) => (
                  <div key={idx} className={`faq-item ${openFaqIndex === idx ? 'open' : ''}`}>
                    <button className="faq-question-btn" onClick={() => toggleFaq(idx)}>
                      <span>{faq.q}</span>
                      <span className="faq-chevron">▼</span>
                    </button>
                    <div className="faq-answer-panel">
                      <p>{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTERACTIVE ELIGIBILITY CHECKER */}
          {activeTab === 'checker' && (
            <div className="tab-pane-content">
              <h3>Interactive Profile Match Check</h3>
              <p className="tab-desc-text">Answer these scheme-specific questions to check your immediate eligibility:</p>
              
              <div className="checker-questions-box">
                {scheme.checklist && scheme.checklist.length > 0 ? (
                  scheme.checklist.map((q) => (
                    <div key={q.id} className="checker-question-item">
                      <div className="checker-question-text">{q.text}</div>
                      <div className="checker-toggle-buttons">
                        <button
                          className={`checker-btn ${checklistAnswers[q.id] === true ? 'btn-yes' : ''}`}
                          onClick={() => handleChecklistChange(q.id, true)}
                        >
                          Yes
                        </button>
                        <button
                          className={`checker-btn ${checklistAnswers[q.id] === false ? 'btn-no' : ''}`}
                          onClick={() => handleChecklistChange(q.id, false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-checklist-msg">
                    No specific checklist is required for this scheme. Standard demographics filter matching is sufficient.
                  </div>
                )}
              </div>

              {/* Status Banner Output */}
              {scheme.checklist && scheme.checklist.length > 0 && (
                <div className="checker-result-banner-area">
                  {!eligibilityStatus.evaluated ? (
                    <div className="banner-msg pending">
                      Please answer all questions above to evaluate your eligibility status.
                    </div>
                  ) : eligibilityStatus.eligible ? (
                    <div className="banner-msg success view-enter">
                      <div className="banner-icon">✓</div>
                      <div>
                        <strong>You are eligible!</strong> Based on your responses, you satisfy all criteria. Feel free to initiate mock application setup.
                      </div>
                    </div>
                  ) : (
                    <div className="banner-msg warning view-enter">
                      <div className="banner-icon">⚠</div>
                      <div>
                        <strong>Ineligibility Detected:</strong> You did not satisfy one or more conditions:
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                          {eligibilityStatus.failedQuestions.map((qText, i) => (
                            <li key={i}>{qText}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="scheme-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close Details</button>
          <div className="footer-apply-group">
            <span className="official-url-label">
              🔗 {scheme.officialUrl.replace('https://', '').replace('http://', '').split('/')[0]}
            </span>
            <a
              href={scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-apply-direct"
              onClick={() => onApply(scheme)}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ marginRight: '0.4rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Apply on Official Website
            </a>
          </div>
        </div>

      </div>

      <style>{`
        .scheme-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .scheme-modal-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 850px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          position: relative;
        }

        .scheme-modal-header {
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 1px solid var(--border-color);
          text-align: left;
          position: relative;
        }

        .modal-meta-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .scheme-modal-title {
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 0.25rem;
          padding-right: 2rem;
        }

        .scheme-modal-ministry {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .btn-close-modal {
          position: absolute;
          top: 2rem;
          right: 2rem;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
          transition: all var(--transition-fast);
        }

        .btn-close-modal:hover {
          color: var(--text-primary);
          background: var(--border-color);
        }

        .scheme-modal-tabs {
          display: flex;
          overflow-x: auto;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
          padding: 0 1rem;
        }

        .modal-tab-btn {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-secondary);
          padding: 1rem 1.25rem;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
        }

        .modal-tab-btn:hover {
          color: var(--primary);
        }

        .modal-tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .scheme-modal-body {
          flex-grow: 1;
          overflow-y: auto;
          padding: 2rem;
          text-align: left;
        }

        .tab-pane-content h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .tab-desc-text {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .section-block {
          width: 100%;
        }

        .details-bullet-list, .details-ordered-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .details-bullet-list li {
          display: flex;
          gap: 0.75rem;
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .bullet-icon-check {
          color: var(--emerald);
          font-weight: bold;
        }

        .bullet-icon-doc {
          color: var(--primary);
        }

        .details-ordered-list li {
          display: flex;
          gap: 1rem;
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .step-num-badge {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 700;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.8rem;
        }

        .eligibility-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .eligibility-table th, .eligibility-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .eligibility-table th {
          text-align: left;
          color: var(--text-secondary);
          font-weight: 600;
          width: 40%;
        }

        .eligibility-table td {
          color: var(--text-primary);
          font-weight: 500;
        }

        .exclusion-card {
          background: #fff7ed;
          border-left: 4px solid var(--saffron);
          padding: 1rem;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          font-size: 0.9rem;
          color: #7c2d12;
        }

        [data-theme='dark'] .exclusion-card {
          background: rgba(249, 115, 22, 0.05);
          color: #ffedd5;
        }

        /* FAQs accordion */
        .faqs-accordion-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .faq-item {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-secondary);
        }

        .faq-question-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          font-weight: 600;
          font-size: 0.95rem;
          text-align: left;
          color: var(--text-primary);
          transition: background var(--transition-fast);
        }

        .faq-question-btn:hover {
          background: var(--bg-tertiary);
        }

        .faq-chevron {
          font-size: 0.65rem;
          color: var(--text-muted);
          transition: transform 0.2s;
        }

        .faq-item.open .faq-chevron {
          transform: rotate(180deg);
        }

        .faq-answer-panel {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.2s ease-out;
          background: var(--bg-tertiary);
        }

        .faq-item.open .faq-answer-panel {
          max-height: 200px;
        }

        .faq-answer-panel p {
          padding: 1rem 1.25rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Checklist Tool styles */
        .checker-questions-box {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .checker-question-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .checker-question-text {
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .checker-toggle-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .checker-btn {
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          padding: 0.4rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .checker-btn:hover {
          border-color: var(--text-muted);
        }

        .checker-btn.btn-yes {
          background: var(--emerald-light);
          color: var(--emerald);
          border-color: var(--emerald);
        }

        .checker-btn.btn-no {
          background: var(--saffron-light);
          color: var(--saffron);
          border-color: var(--saffron);
        }

        .checker-result-banner-area {
          margin-top: 1.5rem;
        }

        .banner-msg {
          padding: 1rem;
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          line-height: 1.5;
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .banner-icon {
          font-size: 1.25rem;
          font-weight: bold;
          line-height: 1;
        }

        .banner-msg.pending {
          background: var(--bg-tertiary);
          border: 1px dashed var(--border-color);
          color: var(--text-secondary);
          justify-content: center;
        }

        .banner-msg.success {
          background: var(--emerald-light);
          border: 1.5px solid var(--emerald);
          color: var(--emerald-hover);
        }

        .banner-msg.warning {
          background: var(--saffron-light);
          border: 1.5px solid var(--saffron);
          color: var(--saffron-hover);
        }

        .no-checklist-msg {
          padding: 2rem;
          text-align: center;
          color: var(--text-muted);
          background: var(--bg-tertiary);
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-md);
        }

        .scheme-modal-footer {
          padding: 1.25rem 2rem;
          border-top: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          background: var(--bg-tertiary);
        }

        .footer-apply-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .official-url-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          padding: 0.3rem 0.65rem;
          border-radius: 4px;
          font-family: monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }

        .btn-apply-direct {
          display: flex;
          align-items: center;
          text-decoration: none;
          font-weight: 700;
          padding: 0.65rem 1.25rem;
        }

        .btn-apply-direct:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        @media (max-width: 576px) {
          .scheme-modal-card {
            max-height: 95vh;
          }
          .scheme-modal-header {
            padding: 1.5rem;
          }
          .btn-close-modal {
            top: 1.5rem;
            right: 1.5rem;
          }
          .scheme-modal-body {
            padding: 1.5rem;
          }
          .checker-question-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .checker-toggle-buttons {
            width: 100%;
          }
          .checker-toggle-buttons button {
            flex-grow: 1;
          }
          .scheme-modal-footer {
            padding: 1rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
