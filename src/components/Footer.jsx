import React from 'react';
import { translations } from '../data/localization';

export default function Footer({ setCurrentView, lang = 'en' }) {
  const t = translations[lang] || translations.en;
  const year = new Date().getFullYear();

  return (
    <footer className="gov-footer">

      {/* ── Top footer — dark navy ── */}
      <div className="gov-footer-top">
        <div className="container gov-footer-top-inner">

          <div className="gov-footer-brand">
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none" aria-label="Portal Seal">
              <circle cx="32" cy="32" r="30" stroke="#FF9933" strokeWidth="2" fill="none"/>
              <circle cx="32" cy="32" r="22" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" strokeDasharray="4 2"/>
              <text x="32" y="27" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Arial">SCHEME</text>
              <text x="32" y="37" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Arial">SENSE</text>
            </svg>
            <div>
              <div className="gov-footer-title">SchemeSense Portal</div>
              <div className="gov-footer-dept">Team six_seven</div>
              <div className="gov-footer-gov">Government of India (Prototype)</div>
            </div>
          </div>

          <div className="gov-footer-links-grid">
            <div className="gov-footer-col">
              <h4 className="gov-footer-col-title">Portal Map</h4>
              <ul>
                <li><button onClick={() => setCurrentView('home')}>{t.home}</button></li>
                <li><button onClick={() => setCurrentView('wizard')}>{t.findSchemes}</button></li>
                <li><button onClick={() => setCurrentView('catalog')}>{t.allSchemes}</button></li>
                <li><button onClick={() => setCurrentView('analytics')}>{t.analytics}</button></li>
                <li><button onClick={() => setCurrentView('saved')}>{t.savedSchemes}</button></li>
              </ul>
            </div>

            <div className="gov-footer-col">
              <h4 className="gov-footer-col-title">Scheme Categories</h4>
              <ul>
                <li><button onClick={() => setCurrentView('catalog')}>{t.catEducation}</button></li>
                <li><button onClick={() => setCurrentView('catalog')}>{t.catAgriculture}</button></li>
                <li><button onClick={() => setCurrentView('catalog')}>{t.catBusiness}</button></li>
                <li><button onClick={() => setCurrentView('catalog')}>{t.catHealth}</button></li>
                <li><button onClick={() => setCurrentView('catalog')}>{t.catSocial}</button></li>
              </ul>
            </div>

            <div className="gov-footer-col">
              <h4 className="gov-footer-col-title">Important Links</h4>
              <ul>
                <li><a href="#" onClick={e => e.preventDefault()}>India.gov.in</a></li>
                <li><a href="#" onClick={e => e.preventDefault()}>MyGov.in</a></li>
                <li><a href="#" onClick={e => e.preventDefault()}>Digital India</a></li>
                <li><a href="#" onClick={e => e.preventDefault()}>eSeva Portal</a></li>
                <li><a href="#" onClick={e => e.preventDefault()}>UMANG App</a></li>
              </ul>
            </div>

            <div className="gov-footer-col">
              <h4 className="gov-footer-col-title">Help &amp; Support</h4>
              <ul>
                <li><span>Helpline: 1800-XXX-XXXX</span></li>
                <li><a href="#" onClick={e => e.preventDefault()}>Contact Us</a></li>
                <li><a href="#" onClick={e => e.preventDefault()}>FAQ</a></li>
                <li><a href="#" onClick={e => e.preventDefault()}>Feedback</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tricolor divider ── */}
      <div className="gov-footer-tricolor">
        <span className="tc-s"></span>
        <span className="tc-w"></span>
        <span className="tc-g"></span>
      </div>

      {/* ── Legal links bar ── */}
      <div className="gov-footer-legal-bar">
        <div className="container gov-footer-legal-inner">
          <div className="gov-footer-legal-links">
            <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
            <span className="sep">|</span>
            <a href="#" onClick={e => e.preventDefault()}>Terms of Use</a>
            <span className="sep">|</span>
            <a href="#" onClick={e => e.preventDefault()}>Accessibility Statement</a>
            <span className="sep">|</span>
            <a href="#" onClick={e => e.preventDefault()}>Disclaimer</a>
            <span className="sep">|</span>
            <a href="#" onClick={e => e.preventDefault()}>Sitemap</a>
            <span className="sep">|</span>
            <a href="#" onClick={e => e.preventDefault()}>Contact</a>
          </div>
          <div className="gov-footer-last-updated">
            Last Updated On: <strong>{new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</strong>
          </div>
        </div>
      </div>

      {/* ── Bottom copyright bar ── */}
      <div className="gov-footer-bottom">
        <div className="container gov-footer-bottom-inner">
          <p>
            © {year} SchemeSense Portal. Content Owned &amp; Maintained by Ministry of Electronics &amp; Information Technology (Prototype).
          </p>
          <p className="gov-footer-credits">
            Website conceptualized and developed by <strong>Team six_seven</strong> for <strong>HackathonZ</strong>. &nbsp;
            <span className="gov-footer-disclaimer-inline">This is a demonstration prototype, not an official government service.</span>
          </p>
          <div className="gov-footer-badges">
            <span className="gov-badge">Digital India</span>
            <span className="gov-badge">Make in India</span>
            <span className="gov-badge gov-badge--sec">🔒 SSL Secured</span>
          </div>
        </div>
      </div>

      <style>{`
        .gov-footer {
          margin-top: auto;
          font-size: 0.875rem;
        }

        /* Top dark section */
        .gov-footer-top {
          background: #002244;
          color: #C8D8F0;
          padding: 2.5rem 0 2rem;
        }

        .gov-footer-top-inner {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 3rem;
          align-items: start;
        }

        @media (max-width: 860px) {
          .gov-footer-top-inner {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .gov-footer-brand {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }

        .gov-footer-portal-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 0.2rem;
        }

        .gov-footer-dept {
          font-size: 0.75rem;
          color: #8AAAD0;
          line-height: 1.4;
        }

        .gov-footer-links-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 700px) {
          .gov-footer-links-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 400px) {
          .gov-footer-links-grid {
            grid-template-columns: 1fr;
          }
        }

        .gov-footer-col h4.gov-footer-col-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #FF9933;
          margin-bottom: 0.75rem;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid rgba(255,153,51,0.3);
        }

        .gov-footer-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .gov-footer-col ul li button,
        .gov-footer-col ul li a,
        .gov-footer-col ul li span {
          font-size: 0.82rem;
          color: #A8C0E0;
          text-align: left;
          text-decoration: none;
          line-height: 1.4;
          transition: color 0.1s ease;
          min-height: unset;
          padding: 0;
        }

        .gov-footer-col ul li button:hover,
        .gov-footer-col ul li a:hover {
          color: #FFFFFF;
          text-decoration: underline;
        }

        /* Tricolor divider */
        .gov-footer-tricolor {
          display: flex;
          height: 4px;
        }
        .tc-s { flex: 1; background: #FF9933; }
        .tc-w { flex: 1; background: #FFFFFF; }
        .tc-g { flex: 1; background: #138808; }

        /* Legal bar */
        .gov-footer-legal-bar {
          background: #001A33;
          padding: 0.6rem 0;
          border-bottom: 1px solid #002A4A;
        }

        .gov-footer-legal-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .gov-footer-legal-links {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.25rem;
          font-size: 0.75rem;
        }

        .gov-footer-legal-links a {
          color: #88AACC;
          text-decoration: none;
          transition: color 0.1s ease;
          min-height: unset;
        }

        .gov-footer-legal-links a:hover { color: #FFFFFF; text-decoration: underline; }

        .gov-footer-legal-links .sep { color: #446688; font-size: 0.7rem; }

        .gov-footer-last-updated {
          font-size: 0.72rem;
          color: #667788;
        }

        .gov-footer-last-updated strong { color: #88AACC; }

        /* Bottom copyright */
        .gov-footer-bottom {
          background: #001122;
          padding: 1rem 0;
        }

        .gov-footer-bottom-inner {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .gov-footer-bottom p {
          font-size: 0.75rem;
          color: #556677;
          line-height: 1.5;
        }

        .gov-footer-credits {
          font-size: 0.72rem !important;
          color: #446688 !important;
        }

        .gov-footer-credits strong { color: #88AACC; }

        .gov-footer-disclaimer-inline {
          color: #FF9933;
          font-size: 0.7rem;
        }

        .gov-footer-badges {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }

        .gov-badge {
          background: #112233;
          border: 1px solid #224466;
          color: #88AACC;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 2px;
          letter-spacing: 0.04em;
        }

        .gov-badge--sec {
          border-color: #138808;
          color: #44BB44;
          background: #0A1A0A;
        }
      `}</style>
    </footer>
  );
}
