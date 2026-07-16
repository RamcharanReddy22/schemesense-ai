/**
 * PLAN: LifeEventBundler — Feature 6 (HIGH priority)
 * 
 * Problem: myScheme forces users to browse by category. Citizens don't think in categories —
 * they think in life events. "I just had a baby", "I lost my job", "I'm starting a business."
 * 
 * Solution: A new entry-point component on the home page that maps 8 life events to
 * pre-filtered bundles of relevant schemes spanning multiple categories.
 * Each event card immediately opens the CatalogView pre-filtered with relevant scheme IDs.
 * 
 * Tech: Pure React, no new dependencies. Uses existing `onSearch` and scheme filter patterns.
 */

import React, { useState } from 'react';
import { translations } from '../data/localization';

// Life event → search keywords that will trigger relevant schemes in CatalogView
const LIFE_EVENTS = [
  {
    id: 'new_baby',
    emoji: '👶',
    titleEn: 'I just had a baby',
    titleHi: 'मुझे अभी बच्चा हुआ है',
    titleTe: 'నాకు ఇప్పుడే పిల్లవాడు పుట్టాడు',
    descEn: 'Maternity benefits, child nutrition, vaccination support & girl child savings',
    descHi: 'मातृत्व लाभ, बच्चे का पोषण, टीकाकरण और बालिका बचत',
    descTe: 'ప్రసూతి ప్రయోజనాలు, శిశు పోషణ, టీకా మద్దతు',
    keywords: 'maternity child nutrition baby girl',
    color: '#FF9933',
    schemeCount: 8,
  },
  {
    id: 'lost_job',
    emoji: '💼',
    titleEn: 'I lost my job',
    titleHi: 'मेरी नौकरी चली गई',
    titleTe: 'నాకు ఉద్యోగం పోయింది',
    descEn: 'Unemployment support, skill training, MSME loans & self-employment schemes',
    descHi: 'बेरोजगारी सहायता, कौशल प्रशिक्षण, एमएसएमई ऋण',
    descTe: 'నిరుద్యోగ మద్దతు, నైపుణ్య శిక్షణ, MSME రుణాలు',
    keywords: 'employment skill loan unemployment',
    color: '#003366',
    schemeCount: 11,
  },
  {
    id: 'starting_business',
    emoji: '🏪',
    titleEn: "I'm starting a business",
    titleHi: 'मैं व्यवसाय शुरू कर रहा हूँ',
    titleTe: 'నేను వ్యాపారం ప్రారంభిస్తున్నాను',
    descEn: 'Mudra loans, startup grants, MSME registration & women entrepreneur schemes',
    descHi: 'मुद्रा ऋण, स्टार्टअप अनुदान, एमएसएमई पंजीकरण',
    descTe: 'ముద్రా రుణాలు, స్టార్టప్ గ్రాంట్లు, MSME నమోదు',
    keywords: 'mudra business loan startup entrepreneur',
    color: '#138808',
    schemeCount: 9,
  },
  {
    id: 'student',
    emoji: '🎓',
    titleEn: "I'm a student needing aid",
    titleHi: 'मुझे छात्रवृत्ति चाहिए',
    titleTe: 'నాకు స్కాలర్‌షిప్ కావాలి',
    descEn: 'Scholarships, merit awards, free coaching & education loans for all categories',
    descHi: 'छात्रवृत्ति, मेरिट पुरस्कार, मुफ्त कोचिंग',
    descTe: 'స్కాలర్‌షిప్‌లు, మెరిట్ అవార్డులు, ఉచిత కోచింగ్',
    keywords: 'scholarship student education merit',
    color: '#7C3AED',
    schemeCount: 14,
  },
  {
    id: 'farmer',
    emoji: '🌾',
    titleEn: "I'm a farmer in distress",
    titleHi: 'मैं एक किसान हूँ',
    titleTe: 'నేను రైతు',
    descEn: 'PM-KISAN cash, crop insurance, free seeds, irrigation subsidies & loan waivers',
    descHi: 'पीएम-किसान नकद, फसल बीमा, मुफ्त बीज, सिंचाई सब्सिडी',
    descTe: 'PM-KISAN నగదు, పంట బీమా, ఉచిత విత్తనాలు',
    keywords: 'farmer kisan agriculture crop irrigation',
    color: '#D97706',
    schemeCount: 12,
  },
  {
    id: 'senior_citizen',
    emoji: '👴',
    titleEn: "I'm a senior citizen",
    titleHi: 'मैं एक वरिष्ठ नागरिक हूँ',
    titleTe: 'నేను వృద్ధుడిని',
    descEn: 'Old age pension, free medical care, PMVVY savings & disability support',
    descHi: 'वृद्धावस्था पेंशन, मुफ्त चिकित्सा, पीएमवीवीवाई',
    descTe: 'వృద్ధాప్య పెన్షన్, ఉచిత వైద్య సంరక్షణ',
    keywords: 'pension senior elderly old age retirement',
    color: '#0E7490',
    schemeCount: 7,
  },
  {
    id: 'woman_safety',
    emoji: '🌸',
    titleEn: "I'm a woman seeking support",
    titleHi: 'मैं एक महिला हूँ',
    titleTe: 'నేను మహిళను',
    descEn: 'Women entrepreneur loans, maternity benefit, Beti Bachao & widow pension',
    descHi: 'महिला उद्यमी ऋण, मातृत्व लाभ, बेटी बचाओ',
    descTe: 'మహిళా వ్యవస్థాపక రుణాలు, మాతృత్వ ప్రయోజనం',
    keywords: 'women girl female beti maternity widow',
    color: '#DB2777',
    schemeCount: 10,
  },
  {
    id: 'housing',
    emoji: '🏠',
    titleEn: 'I need a home / housing aid',
    titleHi: 'मुझे आवास सहायता चाहिए',
    titleTe: 'నాకు గృహ సహాయం కావాలి',
    descEn: 'PMAY housing subsidy, rural housing scheme & home loan interest subsidies',
    descHi: 'पीएमएवाई आवास सब्सिडी, ग्रामीण आवास योजना',
    descTe: 'PMAY గృహ సబ్సిడీ, గ్రామీణ గృహ పథకం',
    keywords: 'housing home pmay rural awas subsidy',
    color: '#1D4ED8',
    schemeCount: 5,
  },
];

export default function LifeEventBundler({ onSearch, lang = 'en' }) {
  const [hoveredId, setHoveredId] = useState(null);
  const t = translations[lang] || translations.en;

  const getTitle = (event) => {
    if (lang === 'hi') return event.titleHi;
    if (lang === 'te') return event.titleTe;
    return event.titleEn;
  };
  const getDesc = (event) => {
    if (lang === 'hi') return event.descHi;
    if (lang === 'te') return event.descTe;
    return event.descEn;
  };

  return (
    <section className="life-event-section">
      <div className="container">
        <div className="life-event-header">
          <div className="life-event-badge">✨ NEW</div>
          <h2 className="life-event-title">
            {lang === 'hi' ? 'जीवन की परिस्थिति बताएं' :
             lang === 'te' ? 'మీ జీవిత సందర్భం చెప్పండి' :
             'Tell us your situation'}
          </h2>
          <p className="life-event-subtitle">
            {lang === 'hi' ? 'अपनी स्थिति चुनें — हम सभी संबंधित योजनाओं का बंडल तुरंत दिखाएंगे' :
             lang === 'te' ? 'మీ పరిస్థితిని ఎంచుకోండి — మేము వెంటనే అన్ని సంబంధిత పథకాలను చూపిస్తాము' :
             "Choose your life event — we'll instantly bundle every relevant scheme across all categories"}
          </p>
        </div>

        <div className="life-event-grid">
          {LIFE_EVENTS.map(event => (
            <button
              key={event.id}
              className={`life-event-card ${hoveredId === event.id ? 'hovered' : ''}`}
              style={{ '--event-color': event.color }}
              onMouseEnter={() => setHoveredId(event.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSearch(event.keywords)}
              aria-label={`Find schemes for: ${getTitle(event)}`}
            >
              <div className="life-event-emoji">{event.emoji}</div>
              <div className="life-event-card-body">
                <h3 className="life-event-card-title">{getTitle(event)}</h3>
                <p className="life-event-card-desc">{getDesc(event)}</p>
              </div>
              <div className="life-event-card-footer">
                <span className="life-event-count">~{event.schemeCount} schemes</span>
                <span className="life-event-arrow">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .life-event-section {
          padding: 4rem 0;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          border-top: 1px solid #e2e8f0;
        }
        .life-event-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .life-event-badge {
          display: inline-block;
          background: linear-gradient(135deg, #003366, #0066cc);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          margin-bottom: 0.75rem;
        }
        .life-event-title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 800;
          color: #003366;
          margin: 0 0 0.5rem;
        }
        .life-event-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          max-width: 520px;
          margin: 0 auto;
        }
        .life-event-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }
        .life-event-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .life-event-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--event-color);
          transform: scaleX(0);
          transition: transform 0.2s ease;
        }
        .life-event-card:hover, .life-event-card.hovered {
          border-color: var(--event-color);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .life-event-card:hover::before, .life-event-card.hovered::before {
          transform: scaleX(1);
        }
        .life-event-emoji {
          font-size: 2rem;
          line-height: 1;
        }
        .life-event-card-body {
          flex: 1;
        }
        .life-event-card-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.35rem;
          line-height: 1.3;
        }
        .life-event-card-desc {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }
        .life-event-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #f1f5f9;
        }
        .life-event-count {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--event-color);
        }
        .life-event-arrow {
          color: var(--event-color);
          font-size: 1rem;
          font-weight: 700;
          transition: transform 0.15s;
        }
        .life-event-card:hover .life-event-arrow {
          transform: translateX(4px);
        }
        @media (max-width: 600px) {
          .life-event-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </section>
  );
}
