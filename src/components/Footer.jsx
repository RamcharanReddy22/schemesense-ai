import React from 'react';
import { translations } from '../data/localization';

export default function Footer({ setCurrentView, lang = 'en' }) {
  const t = translations[lang] || translations.en;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-section">
      <div className="container footer-container">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <svg width="30" height="30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" stroke="var(--primary)" strokeWidth="8" />
                <circle cx="50" cy="50" r="30" stroke="var(--saffron)" strokeWidth="6" strokeDasharray="10 5" />
                <circle cx="50" cy="50" r="15" fill="var(--emerald)" />
              </svg>
              <span className="footer-brand-name">SchemeSense AI</span>
            </div>
            <p className="footer-brand-desc">
              Discover and evaluate government welfare schemes matching your exact eligibility. Empowering citizens through intelligence.
            </p>
            <div className="footer-disclaimer-card">
              <strong style={{ color: 'var(--saffron)' }}>Disclaimer:</strong> This is a simulation portal developed for demonstration and educational purposes. All application submissions and scheme data matchings are simulated and are not processed by actual government departments.
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-title">Explore</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => setCurrentView('home')}>{t.home}</button></li>
              <li><button onClick={() => setCurrentView('wizard')}>{t.findSchemes}</button></li>
              <li><button onClick={() => setCurrentView('catalog')}>{t.allSchemes}</button></li>
              <li><button onClick={() => setCurrentView('saved')}>{t.savedSchemes}</button></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-title">Popular Categories</h4>
            <ul className="footer-links-list">
              <li><button onClick={() => setCurrentView('catalog')}>{t.catEducation}</button></li>
              <li><button onClick={() => setCurrentView('catalog')}>{t.catAgriculture}</button></li>
              <li><button onClick={() => setCurrentView('catalog')}>{t.catBusiness}</button></li>
              <li><button onClick={() => setCurrentView('catalog')}>{t.catSocial}</button></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-title">Accessibility & Support</h4>
            <ul className="footer-links-list">
              <li><button onClick={handleScrollToTop}>Back to Top ↑</button></li>
              <li><span>Helpline: 1800-XXX-XXXX</span></li>
              <li><span>Email: support@schemesense.ai</span></li>
              <li><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>v1.0.0 (Stable)</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SchemeSense AI Portal. Built with high-fidelity components.</p>
          <div className="footer-badge-group">
            <span className="gov-emblem-badge">Digital India Initiative</span>
            <span className="gov-emblem-badge secure">SSL Secured</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-section {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 4rem 0 2rem 0;
          margin-top: auto;
          font-size: 0.9rem;
          transition: background-color var(--transition-normal);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.2fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          text-align: left;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-brand-name {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .footer-brand-desc {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .footer-disclaimer-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .footer-links-col {
          text-align: left;
        }

        .footer-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: var(--text-primary);
        }

        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-links-list button {
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 550;
        }

        .footer-links-list button:hover {
          color: var(--primary);
        }

        .footer-links-list span {
          color: var(--text-secondary);
          font-size: 0.88rem;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-bottom p {
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .footer-badge-group {
          display: flex;
          gap: 0.75rem;
        }

        .gov-emblem-badge {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .gov-emblem-badge.secure {
          border-color: rgba(16, 185, 129, 0.3);
          color: var(--emerald);
          background: var(--emerald-light);
        }
      `}</style>
    </footer>
  );
}
