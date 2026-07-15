import React, { useState, useRef, useEffect, useMemo } from 'react';
import { translations } from '../data/localization';
import './HeroSection.css';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Jammu and Kashmir', 'Delhi', 'Puducherry', 'Ladakh'
];

export default function HeroSection({ onSearch, onStartWizard, totalSchemesCount, lang = 'en', schemes, onSelectScheme }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const suggestionRef = useRef(null);

  // Quick Eligibility Matcher States
  const [quickAge, setQuickAge] = useState(22);
  const [quickGender, setQuickGender] = useState('Female');
  const [quickState, setQuickState] = useState('All');
  const [quickResidency, setQuickResidency] = useState('Both');
  const [showQuickResultsModal, setShowQuickResultsModal] = useState(false);

  // Animated Impact Counter State
  const [citizensHelped, setCitizensHelped] = useState(0);
  const [croresFound, setCroresFound] = useState(0);

  useEffect(() => {
    // Animate numbers up on mount
    let start = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuart)
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setCitizensHelped(Math.floor(easeProgress * 12847));
      setCroresFound(Number((easeProgress * 4.2).toFixed(1)));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, []);

  const t = translations[lang] || translations.en;

  const popularKeywords = [
    { label: 'Scholarship for Students', category: 'Education & Learning' },
    { label: 'Farmer Cash Support (PM-KISAN)', category: 'Agriculture, Rural & Environment' },
    { label: 'Collateral-free Business Loans (Mudra)', category: 'Business & Entrepreneurship' },
    { label: 'Free Health Insurance (Ayushman Bharat)', category: 'Health & Wellness' },
    { label: 'Pension Schemes (APY)', category: 'Social Welfare & Security' },
    { label: 'Girl Child Savings (Sukanya Samriddhi)', category: 'Women and Child' },
    { label: 'Uttar Pradesh State Schemes', category: 'State Specific' },
    { label: 'Bihar Education Student Card', category: 'State Specific' }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.trim().length > 0) {
      const filtered = popularKeywords.filter(k => 
        k.label.toLowerCase().includes(val.toLowerCase()) ||
        k.category.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (keyword) => {
    setSearchQuery(keyword.label);
    setShowSuggestions(false);
    onSearch(keyword.label);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(lang === 'hi' ? 'आपका ब्राउज़र वॉयस सर्च को सपोर्ट नहीं करता है।' : lang === 'te' ? 'మీ బ్రౌజర్ వాయిస్ శోధనకు మద్దతు ఇవ్వదు.' : 'Your browser does not support voice search.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true; // Show text as they speak

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.error('Speech error:', e.error);
      setIsListening(false);
    };
    recognition.onresult = (e) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interimTranscript += e.results[i][0].transcript;
        }
      }
      
      const displayTranscript = finalTranscript || interimTranscript;
      console.log("Speech recognition heard:", displayTranscript);
      
      if (displayTranscript) {
        setSearchQuery(displayTranscript);
      }
      
      // Only execute the search when they stop speaking (final result)
      if (finalTranscript) {
        onSearch(finalTranscript);
      }
    };

    recognition.start();
  };

  // Quick Matcher logic
  const matchedSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      const r = scheme.rules;
      
      // Age
      if (quickAge < r.minAge || quickAge > r.maxAge) return false;
      
      // Gender
      if (r.genders.indexOf('All') === -1 && r.genders.indexOf(quickGender) === -1) return false;
      
      // State
      if (quickState !== 'All' && r.states.indexOf('All') === -1 && r.states.indexOf(quickState) === -1) return false;
      
      // Residency
      if (r.residency.indexOf('Both') === -1 && r.residency.indexOf(quickResidency) === -1) return false;
      
      return true;
    });
  }, [schemes, quickAge, quickGender, quickState, quickResidency]);

  return (
    <section className="hero-section animate-fade-up">
      <div className="container hero-centered-layout">

        {/* LEFT — Editorial heading + CTA */}
        <div className="hero-header-content">
          <div className="hero-badge">
            <span className="dot-pulse-saffron"></span>
            {totalSchemesCount}+ Schemes indexed
          </div>

          <h1 className="hero-title">
            ₹4.2 lakh crore in<br />
            welfare benefits.<br />
            <em>Yours is in here.</em>
          </h1>

          <p className="hero-subtitle">
            Most government schemes go unclaimed — not because people don't qualify, but because no one told them they did. SchemeSense cross-matches {totalSchemesCount}+ central and state programs against your profile in seconds.
          </p>

          {/* Actions live in left col */}
          <div className="hero-actions-container">
            <button onClick={onStartWizard} className="btn-saffron wizard-cta-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {t.startWizardBtn}
            </button>
            <span className="action-divider">or</span>
            <button onClick={() => onSearch('')} className="browse-all-btn">
              {t.browseAllBtn}
            </button>
          </div>
        </div>

        {/* RIGHT — Search bar + stats block */}
        <div className="hero-right-col">
          {/* Omnibar integrated into card */}
          <div className="omnibar-container" ref={suggestionRef}>
            <form onSubmit={handleSearchSubmit} className="omnibar-form">
              <div className="omnibar-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <input
                type="text"
                className="omnibar-input"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => { if (searchQuery.trim().length > 0) setShowSuggestions(true); }}
              />
              <button
                type="button"
                className={`voice-search-btn ${isListening ? 'listening' : ''}`}
                onClick={startListening}
                title={isListening ? 'Listening...' : 'Voice Search'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isListening ? 'var(--saffron)' : 'none'} stroke={isListening ? 'var(--saffron)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                {isListening && <span className="listening-pulse"></span>}
              </button>
              <button type="submit" className="btn-saffron omnibar-btn">
                {t.searchBtn}
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="omnibar-dropdown animate-scale-in">
                <div className="suggestions-header">Popular Searches</div>
                {suggestions.map((item, idx) => (
                  <div key={idx} className="suggestion-item" onClick={() => handleSuggestionClick(item)}>
                    <span className="suggestion-label">{item.label}</span>
                    <span className="suggestion-category">{item.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats as a clean list */}
          <div className="impact-counter-wrapper">
            <div className="impact-stat">
              <span className="impact-label">Schemes indexed</span>
              <span className="impact-number">{totalSchemesCount}</span>
            </div>
            <div className="impact-stat">
              <span className="impact-label">Welfare categories</span>
              <span className="impact-number">6</span>
            </div>
            <div className="impact-stat">
              <span className="impact-label">States &amp; UTs covered</span>
              <span className="impact-number">28+</span>
            </div>
            <div className="impact-stat">
              <span className="impact-label">Languages supported</span>
              <span className="impact-number">3</span>
            </div>
          </div>
        </div>

        {/* Quick Eligibility Matcher Widget - Now placed below centrally */}
        <div className="hero-matcher-wrapper">
          <div className="quick-matcher-panel glass-panel animate-fade-up" style={{animationDelay: '0.2s'}}>
            <div className="matcher-header">
              <h3>{t.quickMatcherTitle}</h3>
              <p>{t.quickMatcherDesc}</p>
            </div>

            <div className="matcher-form-grid">
              {/* Age Input */}
              <div className="matcher-form-group">
                <label className="matcher-field-label">
                  <span>{t.ageLabel}</span>
                  <strong className="age-badge">{quickAge} Yrs</strong>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={quickAge} 
                  onChange={(e) => setQuickAge(parseInt(e.target.value))}
                  className="age-slider"
                />
              </div>

              {/* Gender Input */}
              <div className="matcher-form-group">
                <span className="matcher-field-label">{t.genderLabel}</span>
                <div className="matcher-choice-row">
                  {['Male', 'Female', 'Transgender'].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`matcher-choice-chip ${quickGender === g ? 'active' : ''}`}
                      onClick={() => setQuickGender(g)}
                    >
                      {g === 'Male' && t.genderMale}
                      {g === 'Female' && t.genderFemale}
                      {g === 'Transgender' && t.genderTrans}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Input */}
              <div className="matcher-form-group">
                <span className="matcher-field-label">{t.stateLabel}</span>
                <select 
                  value={quickState} 
                  onChange={(e) => setQuickState(e.target.value)}
                  className="matcher-select-box"
                >
                  <option value="All">{lang === 'hi' ? 'संपूर्ण भारत (केंद्रीय योजनाएं)' : lang === 'te' ? 'అఖిల భారతదేశం (కేంద్ర పథకాలు)' : 'All India (Central Schemes)'}</option>
                  {INDIAN_STATES.map(st => (
                    <option key={st} value={st}>{(t.states && t.states[st]) ? t.states[st] : st}</option>
                  ))}
                </select>
              </div>

              {/* Residency Input */}
              <div className="matcher-form-group">
                <span className="matcher-field-label">{t.residencyLabel}</span>
                <div className="matcher-choice-row">
                  {['Rural', 'Urban'].map(res => (
                    <button
                      key={res}
                      type="button"
                      className={`matcher-choice-chip ${quickResidency === res ? 'active' : ''}`}
                      onClick={() => setQuickResidency(res)}
                    >
                      {res === 'Rural' ? t.resRural : t.resUrban}
                    </button>
                  ))}
                </div>
              </div>
            </div>

              {/* Dynamic Match Count Counter */}
              <div className="matcher-result-row">
                <div className="result-label">
                  <span>{t.calcCountLabel}</span>
                  <div className="live-pulse-badge">
                    <span className="pulse-dot"></span>
                    Live
                  </div>
                </div>
                <div className="result-count">{matchedSchemes.length}</div>
              </div>

              <button 
                type="button" 
                className="btn btn-primary btn-block matcher-submit"
                disabled={matchedSchemes.length === 0}
                onClick={() => setShowQuickResultsModal(true)}
              >
                {t.viewMatchesBtn} →
              </button>
            </div>
          </div>
        </div>


      {/* Stats Dashboard */}
      <div className="container stats-container-row">
        <div className="stats-dashboard">
          <div className="stat-card">
            <span className="stat-value">{totalSchemesCount}+</span>
            <span className="stat-label">{t.statsLoaded}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">6+</span>
            <span className="stat-label">{t.statsCategories}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">28+</span>
            <span className="stat-label">{t.statsStates}</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">100%</span>
            <span className="stat-label">{t.statsSecurity}</span>
          </div>
        </div>
      </div>

      {/* QUICK MATCHES INLINE MODAL */}
      {showQuickResultsModal && (
        <div className="scheme-modal-overlay">
          <div className="scheme-details-card quick-results-modal view-enter">
            <div className="details-header-row">
              <h2>{t.wizardEligibleTitle} ({matchedSchemes.length})</h2>
              <button className="btn-close-modal" onClick={() => setShowQuickResultsModal(false)}>✖</button>
            </div>
            
            <p className="quick-results-desc">Based on your quick selections: <strong>{quickAge} Yr Old, {quickGender}, {quickState === 'All' ? 'All India' : quickState}, {quickResidency}</strong>.</p>
            
            <div className="quick-schemes-scroll-list">
              {matchedSchemes.map(sch => (
                <div 
                  key={sch.id} 
                  className="quick-scheme-item-row"
                  onClick={() => {
                    setShowQuickResultsModal(false);
                    onSelectScheme(sch);
                  }}
                >
                  <div className="item-meta">
                    <span className="badge badge-primary">{sch.category}</span>
                    <span className="badge badge-secondary">{sch.type}</span>
                  </div>
                  <h4>{sch.title}</h4>
                  <p>{sch.description.slice(0, 110)}...</p>
                  <span className="click-to-view-hint">Click to inspect checklist & apply</span>
                </div>
              ))}
            </div>
            
            <div className="quick-results-footer">
              <button className="btn btn-secondary" onClick={() => setShowQuickResultsModal(false)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hero-container-section {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.02) 0%, rgba(37, 99, 235, 0.03) 100%);
          padding: 4.5rem 0 3rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .hero-split-layout {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        @media (max-width: 900px) {
          .hero-split-layout {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }

        .hero-left-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .hero-badge-container {
          margin-bottom: 1.25rem;
        }

        .hero-mini-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border-color);
          padding: 0.4rem 1rem;
          border-radius: 30px;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary);
          box-shadow: var(--shadow-sm);
        }

        .dot-pulse {
          width: 8px;
          height: 8px;
          background: var(--saffron);
          border-radius: 50%;
          animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.5); }
          70% { box-shadow: 0 0 0 8px rgba(249, 115, 22, 0); }
          100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }

        .hero-title {
          font-family: var(--font-heading);
          font-size: 3.5rem;
          font-weight: 850;
          line-height: 1.1;
          letter-spacing: -1.5px;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        @media (max-width: 576px) {
          .hero-title {
            font-size: 2.5rem;
          }
        }

        .gradient-text-saffron {
          background: linear-gradient(90deg, var(--saffron) 0%, #ea580c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 580px;
        }

        /* Search Panel */
        .search-panel-container {
          position: relative;
          width: 100%;
          max-width: 580px;
          margin-bottom: 1.75rem;
        }

        .search-bar-form {
          display: flex;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.4rem;
          box-shadow: var(--shadow-md);
          transition: border-color var(--transition-fast);
        }

        .search-bar-form:focus-within {
          border-color: var(--primary);
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-grow: 1;
          padding: 0 0.75rem;
        }

        .search-icon {
          color: var(--text-muted);
        }

        .search-input {
          border: none;
          background: transparent;
          width: 100%;
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .search-submit-btn {
          font-size: 0.9rem;
          font-weight: 700;
          padding: 0.6rem 1.5rem;
        }

        .search-suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          margin-top: 0.5rem;
          box-shadow: var(--shadow-lg);
          z-index: 10;
          max-height: 250px;
          overflow-y: auto;
          text-align: left;
        }

        .suggestions-header {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 700;
          padding: 0.75rem 1rem 0.4rem 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border-color);
        }

        .suggestion-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .suggestion-item:hover {
          background: var(--primary-light);
        }

        .suggestion-label {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .suggestion-category {
          font-size: 0.75rem;
          background: var(--bg-tertiary);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          color: var(--text-secondary);
        }

        .hero-actions-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .action-divider {
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .wizard-cta-btn {
          font-size: 1.02rem;
          font-weight: 700;
          padding: 0.9rem 2rem;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 15px -3px rgba(249, 115, 22, 0.4);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .browse-all-btn {
          font-size: 1rem;
          padding: 0.9rem 1.5rem;
        }

        @media (max-width: 768px) {
          .hero-actions-container {
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
          }
          .wizard-cta-btn, .browse-all-btn {
            width: 100%;
          }
          .action-divider {
            display: none;
          }
        }

        /* Quick Matcher Widget */
        .quick-matcher-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2.25rem;
          box-shadow: var(--shadow-lg);
          text-align: left;
        }

        .matcher-header h3 {
          font-size: 1.35rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .matcher-header p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1.75rem;
        }

        .matcher-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .matcher-form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .matcher-field-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .age-badge {
          color: var(--primary);
          background: var(--primary-light);
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .age-slider {
          width: 100%;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          outline: none;
          cursor: pointer;
        }

        .matcher-choice-row {
          display: flex;
          gap: 0.5rem;
        }

        .matcher-choice-chip {
          flex: 1;
          background: var(--bg-tertiary);
          border: 1.5px solid var(--border-color);
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .matcher-choice-chip:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .matcher-choice-chip.active {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .matcher-select-box {
          background: var(--bg-tertiary);
          border: 1.5px solid var(--border-color);
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
        }

        .matcher-select-box:focus {
          border-color: var(--primary);
        }

        .matcher-result-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.25rem;
          margin-top: 0.5rem;
        }

        .result-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .live-pulse-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(16, 185, 129, 0.1);
          color: var(--emerald);
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: 10px;
          text-transform: uppercase;
        }

        .pulse-dot {
          width: 5px;
          height: 5px;
          background: var(--emerald);
          border-radius: 50%;
          animation: pulse-green 1.8s infinite;
        }

        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .result-count {
          font-family: var(--font-heading);
          font-size: 1.75rem;
          font-weight: 850;
          color: var(--primary);
        }

        .matcher-submit {
          font-weight: 700;
          padding: 0.8rem;
          font-size: 0.95rem;
        }

        /* Stats Row */
        .stats-container-row {
          margin-top: 3.5rem;
        }

        .stats-dashboard {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem 2rem;
          box-shadow: var(--shadow-sm);
        }

        .stat-card {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-value {
          font-family: var(--font-heading);
          font-size: 1.75rem;
          font-weight: 850;
          color: var(--primary);
        }

        .stat-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 576px) {
          .stats-dashboard {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            padding: 1rem;
          }
          .stat-value {
            font-size: 1.4rem;
          }
        }

        /* Quick Results Modal */
        .quick-results-modal {
          max-width: 600px;
          width: 100%;
          text-align: left;
        }

        .quick-results-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }

        .quick-schemes-scroll-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 380px;
          overflow-y: auto;
          margin-bottom: 1.5rem;
          padding-right: 0.5rem;
        }

        .quick-scheme-item-row {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .quick-scheme-item-row:hover {
          border-color: var(--primary);
          background: var(--bg-secondary);
          box-shadow: var(--shadow-md);
        }

        .quick-scheme-item-row h4 {
          font-size: 1.05rem;
          font-weight: 700;
          margin: 0.5rem 0 0.25rem 0;
          color: var(--text-primary);
        }

        .quick-scheme-item-row p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .item-meta {
          display: flex;
          gap: 0.5rem;
        }

        .click-to-view-hint {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
          margin-top: 0.75rem;
        }

        .quick-results-footer {
          display: flex;
          justify-content: flex-end;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
        }
      `}</style>
    </section>
  );
}
