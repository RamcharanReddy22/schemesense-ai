import React, { useState, useEffect } from 'react';
import { translations } from '../data/localization';
import SchemeComparisonModal from './SchemeComparisonModal';
import './CatalogView.css';

const INDIAN_STATES = [
  'All States', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Jammu and Kashmir', 'Delhi', 'Puducherry', 'Ladakh'
];

const CATEGORIES = [
  'Education & Learning',
  'Agriculture, Rural & Environment',
  'Business & Entrepreneurship',
  'Health & Wellness',
  'Women and Child',
  'Social Welfare & Security'
];

export default function CatalogView({ 
  schemes, 
  onSelectScheme, 
  savedSchemes, 
  toggleSaveScheme,
  initialCategory,
  initialSearchQuery,
  initialState,
  strictStateMode = false,
  lang = 'en'
}) {
  const t = translations[lang] || translations.en;
  const getStateName = (stateEn) => (t.states && t.states[stateEn]) ? t.states[stateEn] : stateEn;
  const getCategoryName = (catEn) => (t.categories && t.categories[catEn]) ? t.categories[catEn] : catEn;

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [selectedState, setSelectedState] = useState(initialState || 'All States');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : []);
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedCaste, setSelectedCaste] = useState('All');
  const [incomeLimit, setIncomeLimit] = useState('');
  const [ageLimit, setAgeLimit] = useState('');
  const [sortBy, setSortBy] = useState('alphabetical');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isStrictState, setIsStrictState] = useState(strictStateMode);
  
  // Scheme Comparison State
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    if (initialState) {
      setSelectedState(initialState);
      setIsStrictState(true); // Map click = strict mode
    }
  }, [initialState]);

  const toggleCompare = (scheme, e) => {
    e.stopPropagation();
    setCompareList(prev => {
      const exists = prev.find(s => s.id === scheme.id);
      if (exists) {
        return prev.filter(s => s.id !== scheme.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 schemes at a time.');
        return prev;
      }
      return [...prev, scheme];
    });
  };

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const handleCategoryChange = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedState('All States');
    setSelectedType('All');
    setSelectedCategories([]);
    setSelectedGender('All');
    setSelectedCaste('All');
    setIncomeLimit('');
    setAgeLimit('');
    setSortBy('alphabetical');
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(lang === 'hi' ? 'आपका ब्राउज़र वॉयस सर्च को सपोर्ट नहीं करता है।' : lang === 'te' ? 'మీ బ్రౌజర్ వాయిస్ శోధనకు మద్దతు ఇవ్వదు.' : 'Your browser does not support voice search.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'te' ? 'te-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

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
      if (displayTranscript) {
        setSearchQuery(displayTranscript);
      }
    };

    recognition.start();
  };

  // Filter Logic
  const getFilteredSchemes = () => {
    return schemes.filter(scheme => {
      const r = scheme.rules;

      // 1. Text Search — match title, desc, ministry, category, benefits, eligibility
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const haystack = [
          scheme.title,
          scheme.description,
          scheme.ministry,
          scheme.category,
          scheme.eligibilityText || '',
          ...(scheme.benefits || [])
        ].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      // 2. State matching
      if (selectedState !== 'All States') {
        const hasState = r.states.includes(selectedState);
        const hasAll = r.states.some(s => s.toLowerCase() === 'all');
        if (isStrictState) {
          // STRICT: from map click — show ONLY schemes tagged for this specific state
          if (!hasState) return false;
        } else {
          // NORMAL: sidebar dropdown — include All-India + state schemes
          if (!hasAll && !hasState) return false;
        }
      }

      // 3. Scheme Type (Central/State)
      if (selectedType !== 'All') {
        if (scheme.type !== selectedType) return false;
      }

      // 4. Categories filter (OR between selected categories)
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(scheme.category)) return false;
      }

      // 5. Gender matching — check if scheme accepts this gender or accepts 'All'
      if (selectedGender !== 'All') {
        const hasAll = r.genders.some(g => g.toLowerCase() === 'all');
        if (!hasAll && r.genders.indexOf(selectedGender) === -1) return false;
      }

      // 6. Caste matching — check if scheme accepts this caste or accepts 'All'
      if (selectedCaste !== 'All') {
        const hasAll = r.castes.some(c => c.toLowerCase() === 'all');
        if (!hasAll && r.castes.indexOf(selectedCaste) === -1) return false;
      }

      // 7. Income limit — only filter if user entered a value
      if (incomeLimit.trim()) {
        const income = parseInt(incomeLimit) || 0;
        // Show schemes where the user's income is WITHIN the scheme limit
        if (income > r.maxIncome) return false;
      }

      // 8. Age Suitability — only filter if user entered a value
      if (ageLimit.trim()) {
        const age = parseInt(ageLimit) || 0;
        if (age < r.minAge || age > r.maxAge) return false;
      }

      return true;
    });
  };

  // Active filters count (for badge display)
  const activeFilterCount = [
    searchQuery.trim() !== '',
    selectedState !== 'All States',
    selectedType !== 'All',
    selectedCategories.length > 0,
    selectedGender !== 'All',
    selectedCaste !== 'All',
    incomeLimit.trim() !== '',
    ageLimit.trim() !== ''
  ].filter(Boolean).length;

  const filteredSchemes = getFilteredSchemes();

  // Sorting Logic
  const sortedSchemes = [...filteredSchemes].sort((a, b) => {
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'ministry') {
      return a.ministry.localeCompare(b.ministry);
    } else {
      return a.category.localeCompare(b.category);
    }
  });

  const isSaved = (schemeId) => {
    return savedSchemes.some(s => s.id === schemeId);
  };

  const filterSidebarContent = (
    <div className="filter-sidebar-inner">
      <div className="filter-sidebar-header">
        <h3>{t.filterCategory}</h3>
        <button className="btn-reset-filters" onClick={resetFilters}>{t.clearFilters}</button>
      </div>

      {/* State Filter */}
      <div className="filter-group">
        <label className="filter-group-label">{t.filterState}</label>
        <select 
          className="form-control"
          value={selectedState}
          onChange={(e) => { setSelectedState(e.target.value); setIsStrictState(false); }}
        >
          {INDIAN_STATES.map(s => (
            <option key={s} value={s}>{getStateName(s)}</option>
          ))}
        </select>
      </div>

      {/* Scheme Type */}
      <div className="filter-group">
        <label className="filter-group-label">{t.filterType}</label>
        <div className="filter-options-stack">
          {[
            { key: 'All', label: 'All' },
            { key: 'Central', label: t.centralSchemesOnly },
            { key: 'State', label: t.stateSchemesOnly }
          ].map(item => (
            <button
              key={item.key}
              className={`filter-chip ${selectedType === item.key ? 'active' : ''}`}
              onClick={() => setSelectedType(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="filter-group">
        <label className="filter-group-label">{t.filterCategory}</label>
        <div className="filter-options-stack">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`filter-chip ${selectedCategories.includes(cat) ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
            >
              {getCategoryName(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="filter-group">
        <label className="filter-group-label">{t.genderLabel}</label>
        <div className="filter-options-stack">
          {[
            { key: 'All', label: 'All' },
            { key: 'Male', label: t.genderMale },
            { key: 'Female', label: t.genderFemale },
            { key: 'Transgender', label: t.genderTrans }
          ].map(item => (
            <button
              key={item.key}
              className={`filter-chip ${selectedGender === item.key ? 'active' : ''}`}
              onClick={() => setSelectedGender(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Caste */}
      <div className="filter-group">
        <label className="filter-group-label">{t.casteGen} / {t.casteOBC}</label>
        <select 
          className="form-control"
          value={selectedCaste}
          onChange={(e) => setSelectedCaste(e.target.value)}
        >
          <option value="All">All Social Groups</option>
          <option value="General">{t.casteGen}</option>
          <option value="OBC">{t.casteOBC}</option>
          <option value="SC">{t.casteSC}</option>
          <option value="ST">{t.casteST}</option>
        </select>
      </div>

      {/* Income Check */}
      <div className="filter-group">
        <label className="filter-group-label">Max Family Income (₹/Yr)</label>
        <input 
          type="number"
          placeholder="e.g. 300000"
          className="form-control"
          value={incomeLimit}
          onChange={(e) => setIncomeLimit(e.target.value)}
        />
      </div>

      {/* Age Check */}
      <div className="filter-group">
        <label className="filter-group-label">{t.ageLabel}</label>
        <input 
          type="number"
          placeholder="e.g. 18"
          className="form-control"
          value={ageLimit}
          onChange={(e) => setAgeLimit(e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="container catalog-container view-enter">
      <div className="catalog-header-row">
        <div className="catalog-header-bar">
          <h1 className="catalog-page-title">{t.catalogTitle}</h1>
          <p className="catalog-page-desc">{t.catalogDesc}</p>
        </div>
        <div className="catalog-stats-badge">
          <strong>{sortedSchemes.length}</strong> {t.statsLoaded}
        </div>
      </div>

      {/* Mobile Filter Toggle Button */}
      <div className="mobile-filter-bar">
        <button 
          className="btn btn-secondary mobile-filter-trigger"
          onClick={() => setShowMobileFilters(true)}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          {t.filterCategory}
        </button>
      </div>

      <div className="catalog-grid-layout">
        {/* Desktop Sidebar */}
        <aside className="catalog-sidebar-desktop">
          {filterSidebarContent}
        </aside>

        {/* Schemes List Area */}
        <main className="catalog-main-content">
          <div className="catalog-search-sort-bar">
            <div className="catalog-search-input-wrapper">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="search-icon-inside">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder={lang === 'hi' ? 'योजनाएं खोजें...' : lang === 'te' ? 'పథకాలు వెతకండి...' : 'Search schemes inside this view...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="catalog-search-input"
              />
              <button
                type="button"
                className={`voice-search-btn-small ${isListening ? 'listening' : ''}`}
                onClick={startListening}
                title={isListening ? "Listening..." : "Voice Search"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isListening ? "var(--saffron)" : "none"} stroke={isListening ? "var(--saffron)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
                {isListening && <span className="listening-pulse"></span>}
              </button>
            </div>
            <div className="catalog-sort-wrapper">
              <span className="sort-label">{t.sortBy}:</span>
              <select 
                className="form-control catalog-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="alphabetical">{t.sortName}</option>
                <option value="ministry">Ministry / Department</option>
                <option value="category">{t.filterCategory}</option>
              </select>
            </div>
          </div>

          {/* Active Filters Bar */}
          {activeFilterCount > 0 && (
            <div className="active-filters-bar">
              <span className="active-filters-label">
                <strong>{activeFilterCount}</strong> filter{activeFilterCount > 1 ? 's' : ''} active:
              </span>
              <div className="active-filter-chips">
                {searchQuery.trim() && (
                  <span className="active-chip">
                    "{searchQuery.trim().slice(0, 20)}{searchQuery.trim().length > 20 ? '…' : ''}" 
                    <button onClick={() => setSearchQuery('')}>×</button>
                  </span>
                )}
                {selectedState !== 'All States' && (
                  <span className="active-chip">
                    {getStateName(selectedState)}
                    <button onClick={() => setSelectedState('All States')}>×</button>
                  </span>
                )}
                {selectedType !== 'All' && (
                  <span className="active-chip">
                    {selectedType === 'Central' ? t.centralSchemesOnly : t.stateSchemesOnly}
                    <button onClick={() => setSelectedType('All')}>×</button>
                  </span>
                )}
                {selectedGender !== 'All' && (
                  <span className="active-chip">
                    {selectedGender === 'Male' ? t.genderMale : selectedGender === 'Female' ? t.genderFemale : t.genderTrans}
                    <button onClick={() => setSelectedGender('All')}>×</button>
                  </span>
                )}
                {selectedCaste !== 'All' && (
                  <span className="active-chip">
                    {selectedCaste === 'General' ? t.casteGen : selectedCaste === 'OBC' ? t.casteOBC : selectedCaste === 'SC' ? t.casteSC : t.casteST}
                    <button onClick={() => setSelectedCaste('All')}>×</button>
                  </span>
                )}
                {selectedCategories.map(cat => (
                  <span key={cat} className="active-chip">
                    {getCategoryName(cat).split(' ')[0]}
                    <button onClick={() => handleCategoryChange(cat)}>×</button>
                  </span>
                ))}
              </div>
              <button className="btn-clear-all-filters" onClick={resetFilters}>{t.clearFilters}</button>
            </div>
          )}

          {/* Results count */}
          <div className="results-count-bar">
            <span>
              {lang === 'hi'
                ? <><strong>{sortedSchemes.length}</strong> में से <strong>{schemes.length}</strong> योजनाएं दिखाई जा रही हैं</>
                : lang === 'te'
                ? <><strong>{sortedSchemes.length}</strong> లో <strong>{schemes.length}</strong> పథకాలు చూపిస్తోంది</>
                : <>Showing <strong>{sortedSchemes.length}</strong> of <strong>{schemes.length}</strong> schemes</>}
            </span>
          </div>

          {/* Cards List */}
          {sortedSchemes.length > 0 ? (
            <div className="schemes-grid">
              {sortedSchemes.map(scheme => (
                <div key={scheme.id} className="scheme-card" onClick={() => onSelectScheme(scheme)}>
                  <div className="card-header-accent"></div>
                  <div className="scheme-card-body">
                    <div className="scheme-card-badges">
                      <span className="card-badge cat">{getCategoryName(scheme.category)}</span>
                      <span className="card-badge type">{scheme.type === 'Central' ? t.centralSchemesOnly : t.stateSchemesOnly}</span>
                      {scheme.deadline && <span className="card-badge" style={{color:'#D93025', borderColor:'#FCE8E6', background:'#FCE8E6'}}>⏳ Closing Soon!</span>}
                    </div>

                    <h3 className="scheme-card-title">{scheme[`title_${lang}`] || scheme.title}</h3>
                    <p className="scheme-card-desc">{scheme[`description_${lang}`] || scheme.description}</p>
                    
                    <div className="scheme-card-meta">
                      <div className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        <span>{scheme[`ministry_${lang}`] || scheme.ministry}</span>
                      </div>
                    </div>

                    <div className="scheme-card-actions">
                      <button 
                        className="btn-details"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectScheme(scheme);
                        }}
                      >
                        {lang === 'hi' ? 'विवरण देखें' : lang === 'te' ? 'వివరాలు' : 'View details'}
                      </button>
                      <button 
                        className={`btn-save-icon ${isSaved(scheme.id) ? 'saved' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveScheme(scheme);
                        }}
                        title="Save Scheme"
                      >
                        <svg width="18" height="18" fill={isSaved(scheme.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      </button>
                      <a 
                        href={scheme.officialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-save-icon"
                        style={{background: '#003366', color: '#fff', borderColor: '#003366'}}
                        onClick={(e) => e.stopPropagation()}
                        title="Apply Direct ↗"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-catalog-box">
              <div className="empty-icon-circle">
                <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3>{t.noSchemesFound}</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {activeFilterCount > 0
                  ? (lang === 'hi'
                      ? `${activeFilterCount} सक्रिय फ़िल्टर बहुत सख्त हो सकते हैं। कुछ हटाने का प्रयास करें।`
                      : lang === 'te'
                      ? `${activeFilterCount} సక్రియ ఫిల్టర్లు చాలా కఠినంగా ఉండవచ్చు. కొన్ని తీసివేయడానికి ప్రయత్నించండి.`
                      : `${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''} may be too strict. Try removing some.`)
                  : (lang === 'hi' ? 'खोज शब्द बदलने का प्रयास करें।' : lang === 'te' ? 'మీ శోధన పదాలను సర్దుబాటు చేయడానికి ప్రయత్నించండి.' : 'Try adjusting your search terms.')}
              </p>
              <button className="btn btn-primary" onClick={resetFilters} style={{ marginTop: '1.5rem' }}>
                {t.clearFilters}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="mobile-filter-drawer-overlay" onClick={() => setShowMobileFilters(false)}>
          <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header-bar">
              <h3>Filters</h3>
              <button 
                className="btn-close-drawer"
                onClick={() => setShowMobileFilters(false)}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="drawer-body">
              {filterSidebarContent}
            </div>
            <div className="drawer-footer-actions">
              <button className="btn btn-secondary" onClick={() => { resetFilters(); setShowMobileFilters(false); }}>Reset</button>
              <button className="btn btn-primary" onClick={() => setShowMobileFilters(false)}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Compare Action Bar */}
      {compareList.length > 0 && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-1)', padding: '1rem 2rem', borderRadius: '100px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '2rem', zIndex: 1000, border: '1px solid var(--saffron)' }}>
          <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
            {compareList.length} Scheme{compareList.length > 1 ? 's' : ''} Selected
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" onClick={() => setCompareList([])} style={{ color: 'var(--text-secondary)' }}>Clear</button>
            <button className="btn btn-primary" disabled={compareList.length < 2} onClick={() => setShowCompareModal(true)}>Compare Now</button>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && (
        <SchemeComparisonModal schemes={compareList} onClose={() => setShowCompareModal(false)} />
      )}
    </div>
  );
}
