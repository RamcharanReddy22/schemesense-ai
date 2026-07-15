import React, { useState, useRef } from 'react';
import { translations } from '../data/localization';

export default function ApplyPortal({ scheme, onClose, onRegisterApplication, lang = 'en' }) {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    aadhaar: '',
    declared: false
  });
  
  // Track mock uploaded file names and progress per required document
  const [uploadedFiles, setUploadedFiles] = useState(
    scheme.documents.reduce((acc, curr) => ({ ...acc, [curr]: { name: '', progress: 0 } }), {})
  );

  // Digital Signature state
  const [typedSignature, setTypedSignature] = useState('');
  const [signatureGenerated, setSignatureGenerated] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  
  // Redirection stage states
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(4);

  const t = translations[lang] || translations.en;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Simulated drag-and-drop document upload with progress bar
  const handleFileChange = (docName, file) => {
    if (file) {
      // Start upload animation
      setUploadedFiles(prev => ({ 
        ...prev, 
        [docName]: { name: file.name, progress: 10 } 
      }));

      // Simulate progress ticks
      let prg = 10;
      const interval = setInterval(() => {
        prg += 30;
        if (prg >= 100) {
          prg = 100;
          clearInterval(interval);
        }
        setUploadedFiles(prev => ({
          ...prev,
          [docName]: { name: file.name, progress: prg }
        }));
      }, 250);
    }
  };

  const generateSignature = () => {
    if (formData.fullName.trim()) {
      setTypedSignature(formData.fullName.trim());
      setSignatureGenerated(true);
      if (errors.signature) {
        setErrors(prev => ({ ...prev, signature: '' }));
      }
    } else {
      setErrors(prev => ({ ...prev, fullName: 'Please enter your Full Name first to generate a signature' }));
    }
  };

  const clearSignature = () => {
    setTypedSignature('');
    setSignatureGenerated(false);
  };

  const validateForm = () => {
    let errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile.trim())) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.aadhaar.trim() || !/^\d{12}$/.test(formData.aadhaar.trim())) {
      errs.aadhaar = 'Enter a valid 12-digit Aadhaar number';
    }
    
    // Check if files are uploaded
    let missingFiles = [];
    scheme.documents.forEach(doc => {
      if (!uploadedFiles[doc] || !uploadedFiles[doc].name || uploadedFiles[doc].progress < 100) {
        missingFiles.push(doc);
      }
    });
    if (missingFiles.length > 0) {
      errs.files = `Please upload all required documents (progress must hit 100%)`;
    }

    if (!signatureGenerated) {
      errs.signature = 'Please generate or write your digital signature';
    }

    if (!formData.declared) errs.declaration = 'You must declare that the statements are true';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate register submission after 1.5s, then show countdown to redirect
    setTimeout(() => {
      const trackingId = `SS-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const applicationData = {
        trackingId,
        schemeId: scheme.id,
        schemeTitle: scheme.title,
        applicantName: formData.fullName,
        submissionDate: new Date().toLocaleDateString('en-IN', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        status: 'Submitted & Awaiting Ministry Verification'
      };

      onRegisterApplication(applicationData);
      setSubmitResult(applicationData);
      setIsSubmitting(false);
    }, 1500);
  };

  const startOfficialRedirect = () => {
    setIsRedirecting(true);
    
    // 3 seconds countdown
    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        // Open official website in a new window/tab
        window.open(scheme.officialUrl, '_blank', 'noopener,noreferrer');
        setIsRedirecting(false);
      }
    }, 1000);
  };

  // Download Receipt locally as a text/HTML layout file
  const downloadReceiptFile = () => {
    if (!submitResult) return;
    const content = `
==============================================
         WELFARE SCHEME APPLY RECEIPT         
                 SCHEMESENSE AI               
==============================================
Scheme Name:     ${submitResult.schemeTitle}
Applicant Name:  ${submitResult.applicantName}
Tracking ID:     ${submitResult.trackingId}
Date Submitted:  ${submitResult.submissionDate}
Status:          ${submitResult.status}
----------------------------------------------
Official Portal: ${scheme.officialUrl}
Disclaimer:      This is a simulated registration receipt.
==============================================
`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Receipt_${submitResult.trackingId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (submitResult) {
    return (
      <div className="scheme-modal-overlay">
        <div className="apply-success-card view-enter">
          
          {isRedirecting ? (
            <div className="redirect-countdown-screen text-center">
              <div className="redirect-spinner"></div>
              <h2>Redirecting to Official Portal...</h2>
              <p className="redirect-timer-circle">{countdown}</p>
              <div className="redirect-link-banner">
                <span>{scheme.officialUrl}</span>
              </div>
              <p className="redirect-info-text">Please complete your formal submission on the official ministry page. Your tracking ID has been recorded locally.</p>
            </div>
          ) : (
            <>
              <div className="success-header-graphic">
                <div className="success-ring">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2>Application Registered</h2>
                <span className="success-sub">Reference Digital Registration Receipt</span>
              </div>

              <div className="receipt-details">
                <div className="receipt-row">
                  <span>Scheme Applied</span>
                  <strong>{submitResult.schemeTitle}</strong>
                </div>
                <div className="receipt-row">
                  <span>Applicant Name</span>
                  <strong>{submitResult.applicantName}</strong>
                </div>
                <div className="receipt-row">
                  <span>Tracking ID</span>
                  <strong className="tracking-number-highlight">{submitResult.trackingId}</strong>
                </div>
                <div className="receipt-row">
                  <span>Submission Time</span>
                  <span>{submitResult.submissionDate}</span>
                </div>
                <div className="receipt-row">
                  <span>Application Status</span>
                  <span className="status-badge-outline">{submitResult.status}</span>
                </div>
              </div>

              <div className="receipt-notice">
                <p>Please note down your Tracking ID to monitor status updates in <strong>My Space</strong>. To proceed and finalize registration on the official government website, click below.</p>
              </div>

              <div className="success-footer-actions">
                <button 
                  className="btn btn-outline" 
                  onClick={downloadReceiptFile}
                >
                  📥 {t.downloadReceipt}
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={startOfficialRedirect}
                >
                  {t.proceed} →
                </button>
              </div>
              
              <button className="btn-close-modal-success" onClick={onClose}>Back to Home</button>
            </>
          )}

        </div>

        <style>{`
          .apply-success-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-lg);
            width: 100%;
            max-width: 520px;
            padding: 2.5rem;
            box-shadow: var(--shadow-lg);
            position: relative;
            text-align: center;
          }

          .success-header-graphic {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 2rem;
          }

          .success-ring {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: var(--emerald-light);
            color: var(--emerald);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1rem;
          }

          .success-ring svg {
            animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          .success-header-graphic h2 {
            font-size: 1.5rem;
            font-weight: 800;
          }

          .success-sub {
            font-size: 0.8rem;
            color: var(--text-muted);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .receipt-details {
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 1.25rem;
            margin-bottom: 1.5rem;
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .receipt-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            font-size: 0.88rem;
            border-bottom: 1px dashed var(--border-color);
            padding-bottom: 0.5rem;
          }

          .receipt-row:last-child {
            border: none;
            padding: 0;
          }

          .receipt-row span {
            color: var(--text-secondary);
            font-weight: 500;
          }

          .receipt-row strong {
            color: var(--text-primary);
            text-align: right;
            max-width: 60%;
          }

          .tracking-number-highlight {
            font-family: monospace;
            color: var(--primary) !important;
            font-size: 1rem;
            background: var(--primary-light);
            padding: 0.1rem 0.5rem;
            border-radius: 4px;
          }

          .receipt-notice {
            font-size: 0.82rem;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 2rem;
            text-align: left;
          }

          .success-footer-actions {
            display: flex;
            gap: 1rem;
          }

          .success-footer-actions button {
            flex: 1;
            padding: 0.85rem;
            font-weight: 700;
            font-size: 0.95rem;
          }

          .btn-close-modal-success {
            margin-top: 1.5rem;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--text-muted);
            text-decoration: underline;
            cursor: pointer;
          }

          /* Redirect Screen */
          .redirect-countdown-screen {
            padding: 2rem 0;
          }

          .redirect-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid var(--border-color);
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            margin: 0 auto 1.5rem auto;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .redirect-timer-circle {
            font-size: 3.5rem;
            font-weight: 850;
            color: var(--saffron);
            font-family: var(--font-heading);
            margin: 1rem 0;
          }

          .redirect-link-banner {
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 0.5rem;
            margin-bottom: 1.5rem;
            font-family: monospace;
            font-size: 0.82rem;
            color: var(--primary);
            word-break: break-all;
          }

          .redirect-info-text {
            font-size: 0.88rem;
            color: var(--text-secondary);
            line-height: 1.5;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="scheme-modal-overlay">
      <div className="apply-portal-card view-enter">
        
        {/* Header */}
        <div className="apply-header-row">
          <div>
            <h2>{t.applyTitle}</h2>
            <span className="apply-scheme-badge">{scheme.title}</span>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✖</button>
        </div>

        {/* Info checklist */}
        <div className="pre-apply-checklist-box">
          <h4>{t.preApplyChecklist}</h4>
          <p>{t.preApplyNotice}</p>
          
          {/* Document Upload Area Grid */}
          <div className="upload-documents-grid">
            {scheme.documents.map((doc, idx) => {
              const fileState = uploadedFiles[doc];
              return (
                <div key={idx} className="document-upload-card">
                  <div className="doc-card-info">
                    <span className="doc-name-label">{doc}</span>
                    {fileState && fileState.name ? (
                      <span className="uploaded-file-name">✓ {fileState.name}</span>
                    ) : (
                      <span className="upload-pending-tag">Pending</span>
                    )}
                  </div>
                  
                  {fileState && fileState.name ? (
                    <div className="upload-progress-row">
                      <div className="progress-bar-track">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${fileState.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-pct-num">{fileState.progress}%</span>
                    </div>
                  ) : (
                    <label className="btn-upload-trigger">
                      📁 Select Mock File
                      <input 
                        type="file" 
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(doc, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Input Details */}
        <form onSubmit={handleSubmit} className="apply-form-details">
          
          <div className="form-double-row">
            <div className="form-group-field">
              <label>Full Name (As in Aadhaar)</label>
              <input 
                type="text" 
                placeholder="e.g. Ram Charan"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
              {errors.fullName && <span className="error-message-label">{errors.fullName}</span>}
            </div>
            
            <div className="form-double-fields-grid">
              <div className="form-group-field">
                <label>Mobile Number</label>
                <input 
                  type="tel" 
                  placeholder="10 digit mobile"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                />
                {errors.mobile && <span className="error-message-label">{errors.mobile}</span>}
              </div>

              <div className="form-group-field">
                <label>Aadhaar Number</label>
                <input 
                  type="text" 
                  placeholder="12 digit Aadhaar"
                  value={formData.aadhaar}
                  onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                />
                {errors.aadhaar && <span className="error-message-label">{errors.aadhaar}</span>}
              </div>
            </div>
          </div>

          {/* Interactive Digital Signature */}
          <div className="signature-portal-section">
            <label className="signature-label-header">{t.digitalSignTitle}</label>
            <p className="signature-desc">{t.digitalSignDesc}</p>
            
            <div className="signature-creation-box">
              {signatureGenerated ? (
                <div className="generated-signature-view">
                  <span className="cursive-signature">{typedSignature}</span>
                  <button type="button" className="btn-clear-sig" onClick={clearSignature}>{t.signClearBtn}</button>
                </div>
              ) : (
                <div className="signature-generator-input">
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sig-gen"
                    onClick={generateSignature}
                  >
                    🖊 {t.signGenBtn}
                  </button>
                  {errors.signature && <span className="error-message-label" style={{ display: 'block', marginTop: '0.5rem' }}>{errors.signature}</span>}
                </div>
              )}
            </div>
          </div>

          {errors.files && (
            <div className="alert-error-box">
              <span>⚠️ {errors.files}</span>
            </div>
          )}

          {/* Declaration Checkbox */}
          <div className="declaration-checkbox-group">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={formData.declared}
                onChange={(e) => handleInputChange('declared', e.target.checked)}
              />
              <span className="checkmark-box"></span>
              <span className="declaration-text">I hereby declare that the details provided are true and accurate. I hold the original files of all mock uploaded documents for state audit verification.</span>
            </label>
            {errors.declaration && <span className="error-message-label" style={{ display: 'block', marginTop: '0.4rem' }}>{errors.declaration}</span>}
          </div>

          {/* Actions */}
          <div className="apply-portal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t.close}</button>
            <button type="submit" className="btn btn-primary btn-submit-apply" disabled={isSubmitting}>
              {isSubmitting ? 'Registering Application...' : 'Register Application & Redirect'}
            </button>
          </div>

        </form>

      </div>

      <style>{`
        .apply-portal-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 750px;
          padding: 2.5rem;
          box-shadow: var(--shadow-lg);
          max-height: 90vh;
          overflow-y: auto;
          text-align: left;
        }

        .apply-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1.5px solid var(--border-color);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }

        .apply-header-row h2 {
          font-size: 1.45rem;
          font-weight: 800;
          line-height: 1.2;
        }

        .apply-scheme-badge {
          display: inline-block;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--primary);
          margin-top: 0.25rem;
        }

        .pre-apply-checklist-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .pre-apply-checklist-box h4 {
          font-size: 1rem;
          font-weight: 750;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .pre-apply-checklist-box p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }

        .upload-documents-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 600px) {
          .upload-documents-grid {
            grid-template-columns: 1fr;
          }
        }

        .document-upload-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .doc-card-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .doc-name-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .uploaded-file-name {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--emerald);
        }

        .upload-pending-tag {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .btn-upload-trigger {
          background: var(--bg-tertiary);
          border: 1px dashed var(--border-color);
          border-radius: 4px;
          padding: 0.4rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-align: center;
          cursor: pointer;
        }

        .btn-upload-trigger:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .upload-progress-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .progress-bar-track {
          flex-grow: 1;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--emerald);
          transition: width 0.3s;
        }

        .progress-pct-num {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        /* Form Details */
        .apply-form-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-double-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
        }

        .form-double-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 576px) {
          .form-double-fields-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-group-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          text-align: left;
        }

        .form-group-field label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .form-group-field input {
          background: var(--bg-tertiary);
          border: 1.5px solid var(--border-color);
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group-field input:focus {
          border-color: var(--primary);
        }

        .error-message-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #ef4444;
        }

        /* Digital Signature */
        .signature-portal-section {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .signature-label-header {
          font-size: 0.9rem;
          font-weight: 750;
          color: var(--text-primary);
        }

        .signature-desc {
          font-size: 0.78rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .signature-creation-box {
          background: var(--bg-secondary);
          border: 1.5px dashed var(--border-color);
          border-radius: var(--radius-sm);
          padding: 1rem;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .generated-signature-view {
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;
          padding: 0 1rem;
        }

        .cursive-signature {
          font-family: 'Brush Script MT', cursive, sans-serif;
          font-size: 2.25rem;
          color: var(--ashoka-blue);
          letter-spacing: 1px;
        }

        [data-theme='dark'] .cursive-signature {
          color: var(--primary);
        }

        .btn-clear-sig {
          font-size: 0.75rem;
          font-weight: 700;
          color: #ef4444;
          cursor: pointer;
        }

        .btn-sig-gen {
          padding: 0.4rem 1.25rem;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .alert-error-box {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #b91c1c;
          padding: 0.75rem 1rem;
          border-radius: 4px;
          font-size: 0.82rem;
          font-weight: 600;
        }

        /* Checkbox */
        .checkbox-container {
          display: block;
          position: relative;
          padding-left: 2rem;
          cursor: pointer;
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
          user-select: none;
        }

        .checkbox-container input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        .checkmark-box {
          position: absolute;
          top: 0;
          left: 0;
          height: 18px;
          width: 18px;
          background-color: var(--bg-tertiary);
          border: 1.5px solid var(--border-color);
          border-radius: 4px;
        }

        .checkbox-container:hover input ~ .checkmark-box {
          background-color: var(--border-color);
        }

        .checkbox-container input:checked ~ .checkmark-box {
          background-color: var(--primary);
          border-color: var(--primary);
        }

        .checkmark-box:after {
          content: "";
          position: absolute;
          display: none;
        }

        .checkbox-container input:checked ~ .checkmark-box:after {
          display: block;
        }

        .checkbox-container .checkmark-box:after {
          left: 5px;
          top: 2px;
          width: 5px;
          height: 10px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        /* Apply Footer */
        .apply-portal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1.5rem;
        }

        .apply-portal-footer button {
          padding: 0.75rem 1.5rem;
          font-weight: 700;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
