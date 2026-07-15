import React, { useState } from 'react';
import { translations } from '../data/localization';

export default function Header({ currentView, setCurrentView, theme, toggleTheme, savedCount, lang, setLang }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  const t = translations[lang] || translations.en;

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleFontSize = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    if (size === 'small')  root.style.fontSize = '14px';
    if (size === 'normal') root.style.fontSize = '16px';
    if (size === 'large')  root.style.fontSize = '19px';
  };

  return (
    <>
      {/* ── Tricolor accent strip ── */}
      <div className="tricolor-strip">
        <span className="tc-saffron"></span>
        <span className="tc-white"></span>
        <span className="tc-green"></span>
      </div>

      {/* ── Main government header ── */}
      <header className="gov-header">
        <div className="container gov-header-inner">

          {/* Left: Seal + Portal Identity */}
          <div className="gov-portal-identity" onClick={() => handleNavClick('home')} style={{cursor:'pointer'}}>
            {/* Circular seal placeholder — NOT national emblem */}
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="gov-seal-svg" aria-label="Portal Seal">
              <circle cx="32" cy="32" r="30" stroke="#003366" strokeWidth="2.5" fill="#fff"/>
              <circle cx="32" cy="32" r="25" stroke="#FF9933" strokeWidth="1.5" fill="none" strokeDasharray="4 2"/>
              <circle cx="32" cy="32" r="18" stroke="#003366" strokeWidth="1" fill="#EEF3F9"/>
              <text x="32" y="27" textAnchor="middle" fontSize="7" fontWeight="700" fill="#003366" fontFamily="Arial">SCHEME</text>
              <text x="32" y="37" textAnchor="middle" fontSize="7" fontWeight="700" fill="#003366" fontFamily="Arial">SENSE</text>
              <text x="32" y="47" textAnchor="middle" fontSize="5" fill="#777" fontFamily="Arial">PORTAL</text>
              <circle cx="32" cy="32" r="3" fill="#FF9933"/>
            </svg>

            <div className="gov-portal-info">
              <div className="gov-portal-name">SchemeSense <span className="gov-portal-name-hi">| सरकारी योजना पोर्टल</span></div>
              <div className="gov-portal-dept">Ministry of Electronics &amp; Information Technology, Govt. of India</div>
              <div className="gov-portal-tagline">Welfare Scheme Aggregation &amp; Eligibility Assessment System</div>
            </div>
          </div>

          {/* Right: Language + Accessibility */}
          <div className="gov-header-controls">
            <div className="gov-lang-row">
              <span className="gov-control-label">भाषा / Language:</span>
              <div className="gov-lang-btns">
                {['en','hi','te'].map(l => (
                  <button
                    key={l}
                    className={`gov-lang-btn ${lang === l ? 'active' : ''}`}
                    onClick={() => setLang(l)}
                  >
                    {l === 'en' ? 'English' : l === 'hi' ? 'हिंदी' : 'తెలుగు'}
                  </button>
                ))}
              </div>
            </div>

            <div className="gov-a11y-row">
              <span className="gov-control-label">Accessibility:</span>
              <div className="gov-a11y-btns">
                <button className={`gov-a11y-btn ${fontSize==='small'?'active':''}`} onClick={() => handleFontSize('small')} title="Decrease font size">A-</button>
                <button className={`gov-a11y-btn ${fontSize==='normal'?'active':''}`} onClick={() => handleFontSize('normal')} title="Normal font size">A</button>
                <button className={`gov-a11y-btn gov-a11y-btn--lg ${fontSize==='large'?'active':''}`} onClick={() => handleFontSize('large')} title="Increase font size">A+</button>
                <button className="gov-a11y-btn gov-contrast-btn" onClick={toggleTheme} title="Toggle high contrast">
                  {theme === 'light' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Trust / Prototype banner ── */}
      <div className="trust-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        <span>
          <strong>Prototype — SchemeSense Hackathon Submission.</strong>&nbsp;
          This portal is a demonstration prototype developed for educational and research purposes. It is <strong>not</strong> an official Government of India service. No data submitted here is processed by any government department.
        </span>
      </div>

      {/* ── Government navigation bar ── */}
      <nav className="gov-nav" role="navigation" aria-label="Main navigation">
        <div className="container gov-nav-inner">
          <div className="gov-nav-links">
            {[
              { key: 'home',      label: t.home },
              { key: 'wizard',    label: t.findSchemes },
              { key: 'catalog',   label: t.allSchemes },
              { key: 'analytics', label: t.analytics },
              { key: 'saved',     label: t.savedSchemes, badge: savedCount },
            ].map(item => (
              <button
                key={item.key}
                className={`gov-nav-link ${currentView === item.key ? 'active' : ''}`}
                onClick={() => handleNavClick(item.key)}
              >
                {item.label}
                {item.badge > 0 && <span className="gov-nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>

          <button
            className="gov-mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {isMobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <>
          <div style={{position:'fixed',inset:0,zIndex:98,background:'rgba(0,0,0,0.4)'}} onClick={() => setIsMobileMenuOpen(false)}/>
          <div className="gov-mobile-drawer">
            {[
              { key: 'home',      label: t.home },
              { key: 'wizard',    label: t.findSchemes },
              { key: 'catalog',   label: t.allSchemes },
              { key: 'analytics', label: t.analytics },
              { key: 'saved',     label: t.savedSchemes },
            ].map(item => (
              <button key={item.key} className={`gov-mobile-link ${currentView===item.key?'active':''}`} onClick={() => handleNavClick(item.key)}>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`
        /* ── Tricolor strip ── */
        .tricolor-strip {
          display: flex;
          height: 5px;
          width: 100%;
        }
        .tc-saffron { flex: 1; background: #FF9933; }
        .tc-white   { flex: 1; background: #FFFFFF; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; }
        .tc-green   { flex: 1; background: #138808; }

        /* ── Main header ── */
        .gov-header {
          background: #FFFFFF;
          border-bottom: 2px solid #003366;
          padding: 0.75rem 0;
        }

        .gov-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .gov-portal-identity {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .gov-seal-svg {
          flex-shrink: 0;
          transition: opacity 0.15s ease;
        }
        .gov-portal-identity:hover .gov-seal-svg { opacity: 0.85; }

        .gov-portal-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .gov-portal-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: #003366;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .gov-portal-name-hi {
          font-size: 1rem;
          font-weight: 600;
          color: #444;
        }

        .gov-portal-dept {
          font-size: 0.78rem;
          color: #555;
          font-weight: 500;
        }

        .gov-portal-tagline {
          font-size: 0.72rem;
          color: #888;
        }

        /* ── Accessibility & Language controls ── */
        .gov-header-controls {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.4rem;
        }

        .gov-lang-row, .gov-a11y-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .gov-control-label {
          font-size: 0.72rem;
          color: #666;
          white-space: nowrap;
        }

        .gov-lang-btns, .gov-a11y-btns {
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .gov-lang-btn {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border: 1px solid #CCCCCC;
          background: #F5F5F5;
          color: #333;
          border-radius: 2px;
          transition: all 0.1s ease;
          min-height: unset;
        }

        .gov-lang-btn:hover { background: #E8E8E8; border-color: #003366; color: #003366; }
        .gov-lang-btn.active { background: #003366; color: #fff; border-color: #003366; }

        .gov-a11y-btn {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.2rem 0.45rem;
          border: 1px solid #CCCCCC;
          background: #F5F5F5;
          color: #333;
          border-radius: 2px;
          transition: all 0.1s ease;
          min-height: unset;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gov-a11y-btn--lg { font-size: 1rem; padding: 0.1rem 0.35rem; }
        .gov-a11y-btn.active { background: #003366; color: #fff; border-color: #003366; }
        .gov-a11y-btn:hover { background: #E0E8F0; border-color: #003366; }

        .gov-contrast-btn { padding: 0.25rem 0.4rem; }

        /* ── Trust banner ── */
        .trust-banner {
          background: #FFFCE6;
          border-bottom: 1px solid #E8D870;
          padding: 0.4rem 1.5rem;
          font-size: 0.72rem;
          color: #5A5000;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          line-height: 1.4;
        }

        /* ── Government nav bar ── */
        .gov-nav {
          background: #003366;
          border-bottom: 3px solid #FF9933;
        }

        .gov-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .gov-nav-links {
          display: flex;
          align-items: stretch;
        }

        @media (max-width: 860px) {
          .gov-nav-links { display: none; }
        }

        .gov-nav-link {
          color: #FFFFFF;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.75rem 1.1rem;
          border-bottom: 3px solid transparent;
          border-radius: 0;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: background 0.1s ease, border-color 0.1s ease;
          min-height: unset;
          white-space: nowrap;
          margin-bottom: -3px;
        }

        .gov-nav-link:hover { background: rgba(255,255,255,0.12); border-bottom-color: #FF9933; }
        .gov-nav-link.active { background: rgba(255,255,255,0.18); border-bottom-color: #FF9933; color: #FFD080; }

        .gov-nav-badge {
          background: #FF9933;
          color: #fff;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 2px;
          min-width: 18px;
          text-align: center;
        }

        .gov-mobile-menu-toggle {
          display: none;
          color: #fff;
          padding: 0.5rem;
          min-height: unset;
        }

        @media (max-width: 860px) {
          .gov-mobile-menu-toggle { display: flex; align-items: center; }
        }

        .gov-mobile-drawer {
          display: flex;
          flex-direction: column;
          background: #002A55;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99;
          padding: 5rem 1.5rem 2rem;
          gap: 0.25rem;
          overflow-y: auto;
          animation: slideIn 0.2s ease;
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        .gov-mobile-link {
          text-align: left;
          padding: 0.9rem 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: #FFFFFF;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          width: 100%;
          border-radius: 0;
          min-height: unset;
        }

        .gov-mobile-link.active { color: #FF9933; background: rgba(255,153,51,0.1); }
        .gov-mobile-link:hover { background: rgba(255,255,255,0.08); }

        @media (max-width: 600px) {
          .gov-header { padding: 0.5rem 0; }
          .gov-seal-svg { width: 48px; height: 48px; }
          .gov-portal-name { font-size: 1rem; }
          .gov-portal-name-hi { display: none; }
          .gov-portal-dept { display: none; }
          .gov-header-controls { display: none; }
        }
      `}</style>
    </>
  );
}
