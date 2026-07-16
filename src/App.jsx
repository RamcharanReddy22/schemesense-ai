import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import Header from './components/Header';
import Footer from './components/Footer';
import HeroSection from './components/HeroSection';
import CategoriesGrid from './components/CategoriesGrid';
import EligibilityWizard from './components/EligibilityWizard';
import CatalogView from './components/CatalogView';
import SchemeDetails from './components/SchemeDetails';
import ApplyPortal from './components/ApplyPortal';
import ChatbotWidget from './components/ChatbotWidget';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import IndiaMap from './components/IndiaMap';
import LifeEventBundler from './components/LifeEventBundler';
import OfflineBanner, { useOnlineStatus } from './components/OfflineBanner';
import { AlertBanner, useSchemeAlerts } from './components/SchemeAlerts';
import { schemes } from './data/schemesData';
import { translations } from './data/localization';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  // Feature 2: Offline detection
  const { isOnline, justCameOnline } = useOnlineStatus();

  // Feature 3: Proactive scheme alerts
  const { urgentAlerts, dismissAlert } = useSchemeAlerts();
  
  const [savedSchemes, setSavedSchemes] = useState(() => {
    const saved = localStorage.getItem('savedSchemes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [applications, setApplications] = useState(() => {
    const apps = localStorage.getItem('submittedApplications');
    return apps ? JSON.parse(apps) : [];
  });

  // Global Toast Notifications
  const [toast, setToast] = useState(null);

  // Selected inputs passing from HeroSection search to Catalog search
  const [activeCatalogCategory, setActiveCatalogCategory] = useState('');
  const [activeCatalogSearch, setActiveCatalogSearch] = useState('');
  const [activeCatalogState, setActiveCatalogState] = useState('');
  const [activeCatalogStrictState, setActiveCatalogStrictState] = useState(false);

  // Modals state
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState(null);
  const [selectedSchemeApply, setSelectedSchemeApply] = useState(null);

  const t = translations[lang] || translations.en;

  // Welcome Tour
  const [tourRun, setTourRun] = useState(() => {
    return !localStorage.getItem('tourCompleted');
  });

  const tourSteps = [
    {
      target: 'body',
      content: (
        <div>
          <h3 style={{margin:'0 0 8px',fontSize:'1.2rem'}}>Welcome to SchemeSense Portal</h3>
          <p style={{margin:0,fontSize:'0.95rem',opacity:0.85}}>A brief overview of the Civic Welfare and Scheme Access system.</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.omnibar-form',
      content: (
        <div>
          <h3 style={{margin:'0 0 8px',fontSize:'1.1rem'}}>Scheme Search</h3>
          <p style={{margin:0,fontSize:'0.9rem',opacity:0.85}}>Query the database in English, Hindi, or Telugu using text or voice input.</p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.hero-cta-group',
      content: (
        <div>
          <h3 style={{margin:'0 0 8px',fontSize:'1.1rem'}}>Eligibility Assessment</h3>
          <p style={{margin:0,fontSize:'0.9rem',opacity:0.85}}>Provide demographic details to identify qualified schemes and estimated benefits.</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '.nav-links',
      content: (
        <div>
          <h3 style={{margin:'0 0 8px',fontSize:'1.1rem'}}>Scheme Directory</h3>
          <p style={{margin:0,fontSize:'0.9rem',opacity:0.85}}>Browse the complete catalog of government initiatives with advanced filtering options.</p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.lang-select',
      content: (
        <div>
          <h3 style={{margin:'0 0 8px',fontSize:'1.1rem'}}>Language Preferences</h3>
          <p style={{margin:0,fontSize:'0.9rem',opacity:0.85}}>Switch between English, Hindi, and Telugu. The interface will localize instantly.</p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.chatbot-fab',
      content: (
        <div>
          <h3 style={{margin:'0 0 8px',fontSize:'1.1rem'}}>Support Assistant</h3>
          <p style={{margin:0,fontSize:'0.9rem',opacity:0.85}}>Access the support widget for automated query resolution regarding specific schemes.</p>
        </div>
      ),
      placement: 'top',
      disableBeacon: true,
    },
  ];

  const handleTourEnd = (data) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setTourRun(false);
      localStorage.setItem('tourCompleted', 'true');
    }
  };

  // Force light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  // Sync language
  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  // Sync saved schemes
  useEffect(() => {
    localStorage.setItem('savedSchemes', JSON.stringify(savedSchemes));
  }, [savedSchemes]);

  // Sync submitted applications
  useEffect(() => {
    localStorage.setItem('submittedApplications', JSON.stringify(applications));
  }, [applications]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSelectCategory = (catName) => {
    setActiveCatalogCategory(catName);
    setActiveCatalogSearch(''); // clear search
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchKeyword = (keyword) => {
    setActiveCatalogSearch(keyword);
    setActiveCatalogCategory(''); // clear category
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveScheme = (scheme) => {
    setSavedSchemes(prev => {
      const exists = prev.some(s => s.id === scheme.id);
      if (exists) {
        showToast(t.toastUnbookmarked, 'info');
        return prev.filter(s => s.id !== scheme.id);
      } else {
        showToast(t.toastBookmarked, 'success');
        return [...prev, scheme];
      }
    });
  };

  const registerNewApplication = (appData) => {
    setApplications(prev => [appData, ...prev]);
    showToast(t.toastAppSubmitted, 'success');
  };

  const launchApplyPortal = (scheme) => {
    setSelectedSchemeDetail(null); // close details modal if open
    setSelectedSchemeApply(scheme);
  };

  const handleStartWizard = () => {
    setCurrentView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLangChange = (selectedLang) => {
    setLang(selectedLang);
    // Show toast for language switch
    const newT = translations[selectedLang] || translations.en;
    showToast(newT.toastLanguageChanged, 'success');
  };

  return (
    <div className="app-wrapper">
      <Joyride
        steps={tourSteps}
        run={tourRun}
        continuous
        showProgress
        showSkipButton
        callback={handleTourEnd}
        styles={{
          options: {
            primaryColor: '#3b82f6',
            backgroundColor: '#1e293b',
            textColor: '#f1f5f9',
            arrowColor: '#1e293b',
            overlayColor: 'rgba(0,0,0,0.55)',
            zIndex: 99999,
          },
          buttonNext: {
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            fontSize: '0.9rem',
            padding: '8px 18px',
          },
          buttonBack: {
            color: '#94a3b8',
            fontSize: '0.9rem',
          },
          buttonSkip: {
            color: '#94a3b8',
            fontSize: '0.85rem',
          },
          tooltip: {
            borderRadius: '16px',
            padding: '20px 24px',
            maxWidth: '340px',
          },
          tooltipTitle: {
            fontSize: '1.1rem',
          },
        }}
        locale={{
          back: '← Back',
          close: 'Close',
          last: '🎉 Done!',
          next: 'Next →',
          skip: 'Skip Tour',
        }}
      />
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        savedCount={savedSchemes.length}
        lang={lang}
        setLang={handleLangChange}
      />
      {/* Feature 2: Offline Banner */}
      <OfflineBanner isOnline={isOnline} justCameOnline={justCameOnline} lang={lang} />

      {/* Feature 3: Proactive Deadline Alert Banner */}
      <AlertBanner
        urgentAlerts={urgentAlerts}
        dismissAlert={dismissAlert}
        onOpenScheme={(scheme) => setSelectedSchemeDetail(scheme)}
        schemes={schemes}
        lang={lang}
      />

      {/* Global Toast Alert */}

      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : 'ℹ'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      <main className="main-content-area">
        {currentView === 'home' && (
          <div className="view-enter">
            <HeroSection 
              onSearch={handleSearchKeyword}
              onStartWizard={handleStartWizard}
              totalSchemesCount={schemes.length}
              lang={lang}
              schemes={schemes}
              onSelectScheme={(scheme) => setSelectedSchemeDetail(scheme)}
            />

            {/* Feature 6: Life-event bundler */}
            <LifeEventBundler
              onSearch={handleSearchKeyword}
              lang={lang}
            />
            
            <div className="container" style={{ margin: '4rem auto 2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Schemes Across India</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Explore localized welfare programs by state</p>
              </div>
              <IndiaMap 
                onSelectState={(stateName) => {
                  setActiveCatalogCategory('');
                  setActiveCatalogSearch('');
                  setActiveCatalogState(stateName);
                  setActiveCatalogStrictState(true); // strict: map click shows ONLY that state's schemes
                  setCurrentView('catalog');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
              />
            </div>

            <CategoriesGrid 
              schemes={schemes} 
              onSelectCategory={handleSelectCategory}
              lang={lang}
            />
          </div>
        )}

        {currentView === 'wizard' && (
          <div className="view-enter">
            <EligibilityWizard 
              schemes={schemes}
              onSelectScheme={(scheme) => setSelectedSchemeDetail(scheme)}
              onResetWizard={() => handleSearchKeyword('')}
              lang={lang}
            />
          </div>
        )}

        {currentView === 'catalog' && (
          <div className="view-enter">
          <CatalogView 
              schemes={schemes}
              onSelectScheme={(scheme) => setSelectedSchemeDetail(scheme)}
              savedSchemes={savedSchemes}
              toggleSaveScheme={toggleSaveScheme}
              initialCategory={activeCatalogCategory}
              initialSearchQuery={activeCatalogSearch}
              initialState={activeCatalogState}
              strictStateMode={activeCatalogStrictState}
              lang={lang}
            />
          </div>
        )}

        {currentView === 'analytics' && (
          <AnalyticsDashboard 
            schemes={schemes}
            lang={lang}
            onSelectState={(stateName) => {
              setActiveCatalogCategory('');
              setActiveCatalogSearch('');
              setActiveCatalogState(stateName);
              setActiveCatalogStrictState(true);
              setCurrentView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'saved' && (
          <div className="container personal-dashboard-view view-enter">
            <h1 className="dashboard-page-title">{t.savedSchemes}</h1>
            <p className="dashboard-page-desc">Manage your saved bookmarked schemes and track your active application submissions.</p>

            <div className="dashboard-tabbed-pane">
              {/* Saved Schemes Section */}
              <div className="dashboard-column">
                <h2 className="column-section-title">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {t.bookmarks} ({savedSchemes.length})
                </h2>
                
                {savedSchemes.length > 0 ? (
                  <div className="saved-schemes-list">
                    {savedSchemes.map(scheme => (
                      <div key={scheme.id} className="saved-scheme-mini-card" onClick={() => setSelectedSchemeDetail(scheme)}>
                        <div className="mini-card-header">
                          <span className="badge badge-primary">{scheme.category}</span>
                          <button 
                            className="btn-remove-saved" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaveScheme(scheme);
                            }}
                            aria-label="Remove bookmark"
                          >
                            ✖ Remove
                          </button>
                        </div>
                        <h3>{scheme.title}</h3>
                        <p>{scheme.ministry}</p>
                        <button className="btn btn-secondary btn-sm-card" style={{ marginTop: '1rem', width: '100%' }}>
                          Open Scheme Details
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-dashboard-state">
                    <p>No schemes saved yet. Browse schemes in the library and click the bookmark button to collect them.</p>
                    <button className="btn btn-primary" onClick={() => handleSearchKeyword('')} style={{ marginTop: '1rem' }}>
                      Browse All Schemes
                    </button>
                  </div>
                )}
              </div>

              {/* Submitted Applications History */}
              <div className="dashboard-column">
                <h2 className="column-section-title">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t.activeApplications} ({applications.length})
                </h2>

                {applications.length > 0 ? (
                  <div className="applications-history-list">
                    {applications.map((app, idx) => (
                      <div key={idx} className="application-history-card">
                        <div className="app-card-title-row">
                          <span className="app-date">{app.submissionDate}</span>
                          <span className="app-tracking-code">{app.trackingId}</span>
                        </div>
                        <h3>{app.schemeTitle}</h3>
                        <div className="app-card-status-row">
                          <span>Applicant: <strong>{app.applicantName}</strong></span>
                        </div>

                        {/* Interactive Timeline Track */}
                        <div className="application-timeline-track">
                          <div className="timeline-step done">
                            <span className="timeline-dot"></span>
                            <span className="timeline-lbl">Applied</span>
                          </div>
                          <div className="timeline-step active">
                            <span className="timeline-dot"></span>
                            <span className="timeline-lbl">Verification</span>
                          </div>
                          <div className="timeline-step pending">
                            <span className="timeline-dot"></span>
                            <span className="timeline-lbl">Approval</span>
                          </div>
                        </div>

                        <div className="app-card-footer-tracking">
                          <span className="status-badge-inline">{app.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-dashboard-state">
                    <p>No applications submitted yet. Open any scheme card and select "Apply Online" to register mock submissions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer setCurrentView={setCurrentView} lang={lang} />

      {/* Floating Chatbot Assistant */}
      <ChatbotWidget 
        schemes={schemes} 
        onSelectScheme={(scheme) => setSelectedSchemeDetail(scheme)}
        onStartWizard={handleStartWizard}
        lang={lang}
      />

      {/* OVERLAY DETAILS MODAL */}
      {selectedSchemeDetail && (
        <SchemeDetails 
          scheme={selectedSchemeDetail}
          onClose={() => setSelectedSchemeDetail(null)}
          onApply={launchApplyPortal}
          lang={lang}
        />
      )}

      {/* OVERLAY APPLICATION PORTAL */}
      {selectedSchemeApply && (
        <ApplyPortal 
          scheme={selectedSchemeApply}
          onClose={() => setSelectedSchemeApply(null)}
          onRegisterApplication={registerNewApplication}
          lang={lang}
        />
      )}

      <style>{`
        .app-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .main-content-area {
          flex-grow: 1;
        }

        /* Toast Notifications */
        .toast-notification {
          position: fixed;
          bottom: 6rem;
          right: 2rem;
          background: var(--bg-secondary);
          border-left: 5px solid var(--emerald);
          box-shadow: var(--shadow-lg), 0 0 0 1px rgba(0,0,0,0.05);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          min-width: 320px;
          max-width: 450px;
          z-index: 999;
          animation: slideInRight 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toast-notification.info {
          border-left-color: var(--primary);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .toast-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--emerald-light);
          color: var(--emerald);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .toast-notification.info .toast-icon {
          background: var(--primary-light);
          color: var(--primary);
        }

        .toast-message {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .toast-close {
          font-size: 1.25rem;
          color: var(--text-muted);
          padding: 0 0.5rem;
          cursor: pointer;
        }

        .toast-close:hover {
          color: var(--text-primary);
        }

        /* My Space Personal Dashboard View */
        .personal-dashboard-view {
          padding: 3rem 1rem;
          text-align: left;
        }

        .dashboard-page-title {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.25rem;
        }

        .dashboard-page-desc {
          color: var(--text-secondary);
          font-size: 0.95rem;
          border-bottom: 1.5px solid var(--border-color);
          padding-bottom: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .dashboard-tabbed-pane {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        @media (max-width: 900px) {
          .dashboard-tabbed-pane {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .column-section-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          color: var(--text-primary);
        }

        .saved-schemes-list, .applications-history-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .saved-scheme-mini-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }

        .saved-scheme-mini-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }

        .mini-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .btn-remove-saved {
          font-size: 0.75rem;
          font-weight: 700;
          color: #ef4444;
        }

        .saved-scheme-mini-card h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          line-height: 1.3;
        }

        .saved-scheme-mini-card p {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .empty-dashboard-state {
          padding: 3rem 1.5rem;
          background: var(--bg-secondary);
          border: 1.5px dashed var(--border-color);
          border-radius: var(--radius-md);
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        /* Applications History Cards */
        .application-history-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          box-shadow: var(--shadow-sm);
          text-align: left;
        }

        .app-card-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .app-tracking-code {
          font-family: monospace;
          background: var(--bg-tertiary);
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          color: var(--primary);
          font-size: 0.8rem;
        }

        .application-history-card h3 {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .app-card-status-row {
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
        }

        .app-card-footer-tracking {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          border-top: 1px solid var(--border-color);
          padding-top: 0.75rem;
          margin-top: 0.5rem;
        }

        .status-badge-inline {
          color: var(--emerald);
          font-weight: 700;
        }

        /* Application Timeline */
        .application-timeline-track {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin: 1.5rem 0 1rem 0;
          padding: 0 10px;
        }

        .application-timeline-track::before {
          content: '';
          position: absolute;
          top: 6px;
          left: 10px;
          right: 10px;
          height: 3px;
          background: var(--border-color);
          z-index: 1;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          position: relative;
          z-index: 2;
          width: 60px;
        }

        .timeline-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 3px solid var(--border-color);
          transition: all 0.3s;
        }

        .timeline-lbl {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .timeline-step.done .timeline-dot {
          background: var(--emerald);
          border-color: var(--emerald);
        }

        .timeline-step.done .timeline-lbl {
          color: var(--emerald);
        }

        .timeline-step.active .timeline-dot {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }

        .timeline-step.active .timeline-lbl {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
