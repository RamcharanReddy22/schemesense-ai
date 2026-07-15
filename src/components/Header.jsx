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
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
            <rect x="1" y="1" width="30" height="30" rx="3" fill="var(--saffron)" stroke="var(--text-primary)" strokeWidth="2"/>
            <text x="16" y="22" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="900" fontFamily="serif">S</text>
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
          border-bottom: 2px solid var(--border-color);
          transition: background-color var(--transition-normal);
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
        }

        .logo-svg {
          transition: transform var(--transition-fast);
        }

        .logo-section:hover .logo-svg {
          transform: rotate(-3deg);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.1;
        }

        .logo-title {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: var(--text-primary);
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        @media (max-width: 900px) {
          .desktop-nav { display: none; }
        }

        .nav-link {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 0.4rem 0.85rem;
          border-radius: 3px;
          position: relative;
          border-bottom: 2px solid transparent;
          font-family: var(--font-body);
          min-height: unset;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .nav-link.active {
          color: var(--saffron);
          border-bottom: 2px solid var(--saffron);
          background: none;
        }

        .saved-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .saved-badge {
          background: var(--saffron);
          color: white;
          font-size: 0.68rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 2px;
          border: 1px solid var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .lang-select-box {
          background: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          padding: 0.3rem 0.5rem;
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 3px;
          color: var(--text-primary);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          min-height: unset;
          font-family: var(--font-body);
        }

        .lang-select-box:hover {
          transform: translate(-1px, -1px);
          box-shadow: var(--shadow-md);
        }

        .theme-toggle {
          width: 36px;
          height: 36px;
          border-radius: 3px;
          border: 2px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          box-shadow: var(--shadow-sm);
          min-height: unset;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .theme-toggle:hover {
          transform: translate(-1px, -1px);
          box-shadow: var(--shadow-md);
          color: var(--text-primary);
        }

        .mobile-menu-toggle {
          display: none;
          width: 36px;
          height: 36px;
          border-radius: 3px;
          border: 2px solid var(--border-color);
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          box-shadow: var(--shadow-sm);
          min-height: unset;
        }

        @media (max-width: 900px) {
          .mobile-menu-toggle { display: flex; }
        }

        .mobile-nav-drawer {
          display: none;
          flex-direction: column;
          background: var(--bg-secondary);
          border-bottom: 2px solid var(--border-color);
          padding: 0.75rem 1rem;
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          box-shadow: var(--shadow-lg);
          z-index: 99;
          animation: slideDown 0.2s ease-out;
        }

        @media (max-width: 900px) {
          .mobile-nav-drawer { display: flex; }
        }

        @keyframes slideDown {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .mobile-nav-link {
          text-align: left;
          padding: 0.7rem 0.75rem;
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: 3px;
          width: 100%;
          font-family: var(--font-body);
          min-height: unset;
        }

        .mobile-nav-link.active {
          color: var(--saffron);
          background: var(--saffron-light);
        }

        .mobile-nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        @media (max-width: 480px) {
          .header-container { height: 56px; }
          .logo-title { font-size: 1.15rem; }
          .lang-select-box { font-size: 0.75rem; padding: 0.25rem 0.35rem; }
          .theme-toggle, .mobile-menu-toggle { width: 32px; height: 32px; }
          .mobile-nav-drawer { top: 56px; }
          .header-actions { gap: 0.35rem; }
        }
      `}</style>
    </header>
  );
}
