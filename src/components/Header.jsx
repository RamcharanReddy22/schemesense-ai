import React, { useState } from 'react';
import { translations } from '../data/localization';

export default function Header({ currentView, setCurrentView, theme, toggleTheme, savedCount, lang, setLang }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[lang] || translations.en;

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header-nav">
      <div className="container header-container">
        <div className="logo-section" onClick={() => handleNavClick('home')}>
          {/* Clean, minimal geometric logo mark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
            <rect x="2" y="2" width="28" height="28" rx="6" fill="var(--primary)" />
            <path d="M9 16h14M16 9v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="3" fill="var(--saffron)" />
          </svg>
          <div className="logo-text">
            <span className="logo-title">Scheme<span style={{ color: 'var(--saffron)' }}>Sense</span></span>
          </div>
        </div>

        <nav className="desktop-nav">
          <button 
            className={`nav-link ${currentView === 'home' ? 'active' : ''}`} 
            onClick={() => handleNavClick('home')}
          >
            {t.home}
          </button>
          <button 
            className={`nav-link ${currentView === 'wizard' ? 'active' : ''}`} 
            onClick={() => handleNavClick('wizard')}
          >
            {t.findSchemes}
          </button>
          <button 
            className={`nav-link ${currentView === 'catalog' ? 'active' : ''}`} 
            onClick={() => handleNavClick('catalog')}
          >
            {t.allSchemes}
          </button>
          <button 
            className={`nav-link ${currentView === 'analytics' ? 'active' : ''}`} 
            onClick={() => handleNavClick('analytics')}
          >
            {t.analytics}
          </button>
          <button 
            className={`nav-link saved-btn ${currentView === 'saved' ? 'active' : ''}`} 
            onClick={() => handleNavClick('saved')}
          >
            {t.savedSchemes}
            {savedCount > 0 && <span className="saved-badge">{savedCount}</span>}
          </button>
        </nav>

        <div className="header-actions">
          {/* Language Selector Dropdown */}
          <div className="language-dropdown-wrapper">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="lang-select-box"
              aria-label="Select Language"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>

          {/* Dark / Light Toggle */}
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
            {theme === 'light' ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer + backdrop */}
      {isMobileMenuOpen && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="mobile-nav-drawer">
            <button
              className={`mobile-nav-link ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              {t.home}
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'wizard' ? 'active' : ''}`}
              onClick={() => handleNavClick('wizard')}
            >
              {t.findSchemes}
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'catalog' ? 'active' : ''}`}
              onClick={() => handleNavClick('catalog')}
            >
              {t.allSchemes}
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'analytics' ? 'active' : ''}`}
              onClick={() => handleNavClick('analytics')}
            >
              {t.analytics}
            </button>
            <button
              className={`mobile-nav-link ${currentView === 'saved' ? 'active' : ''}`}
              onClick={() => handleNavClick('saved')}
            >
              {t.savedSchemes} ({savedCount})
            </button>
          </div>
        </>
      )}

      <style>{`
        .header-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          transition: background-color var(--transition-normal);
          backdrop-filter: blur(12px);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .logo-svg {
          animation: spin-slow 20s linear infinite;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.1;
        }

        .logo-title {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: var(--text-primary);
        }

        .logo-subtitle {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.2px;
          text-transform: uppercase;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        @media (max-width: 900px) {
          .desktop-nav {
            display: none;
          }
        }

        .nav-link {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          position: relative;
        }

        .nav-link:hover {
          color: var(--primary);
          background: var(--primary-light);
        }

        .nav-link.active {
          color: var(--primary);
          background: var(--primary-light);
        }

        .saved-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .saved-badge {
          background: var(--saffron);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .lang-select-box {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          padding: 0.35rem 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          cursor: pointer;
        }

        .lang-select-box:hover {
          border-color: var(--primary);
        }

        .theme-toggle {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        .theme-toggle:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .mobile-menu-toggle {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }

        @media (max-width: 900px) {
          .mobile-menu-toggle {
            display: flex;
          }
        }

        .mobile-nav-drawer {
          display: none;
          flex-direction: column;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          padding: 1rem;
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          box-shadow: var(--shadow-md);
          z-index: 99;
          animation: slideDown 0.25s ease-out;
        }

        @media (max-width: 900px) {
          .mobile-nav-drawer {
            display: flex;
          }
        }

        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .mobile-nav-link {
          text-align: left;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          width: 100%;
        }

        .mobile-nav-link.active, .mobile-nav-link:hover {
          color: var(--primary);
          background: var(--primary-light);
        }

        @media (max-width: 480px) {
          .header-container {
            height: 60px;
          }
          .logo-subtitle {
            display: none;
          }
          .logo-title {
            font-size: 1.15rem;
          }
          .lang-select-box {
            font-size: 0.78rem;
            padding: 0.3rem 0.4rem;
          }
          .theme-toggle, .mobile-menu-toggle {
            width: 34px;
            height: 34px;
          }
          .mobile-nav-drawer {
            top: 60px;
          }
          .header-actions {
            gap: 0.4rem;
          }
        }
      `}</style>
    </header>
  );
}
