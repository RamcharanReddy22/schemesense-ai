import React, { useMemo } from 'react';
import { translations } from '../data/localization';

export default function AnalyticsDashboard({ schemes, lang, onSelectState }) {
  const t = translations[lang] || translations.en;

  // Calculate statistics
  const stats = useMemo(() => {
    let centralCount = 0;
    let stateCount = 0;
    const categoryCounts = {};
    const stateCounts = {};

    schemes.forEach(scheme => {
      // Central vs State
      if (scheme.type === 'Central') {
        centralCount++;
      } else {
        stateCount++;
      }

      // Categories
      categoryCounts[scheme.category] = (categoryCounts[scheme.category] || 0) + 1;

      // States
      if (scheme.state !== 'All') {
        stateCounts[scheme.state] = (stateCounts[scheme.state] || 0) + 1;
      }
    });

    return {
      total: schemes.length,
      central: centralCount,
      state: stateCount,
      categoryCounts,
      stateCounts
    };
  }, [schemes]);

  // Simulated Budgets for visual display (hackathon style)
  const categoryBudgets = {
    "Education & Learning": 42000,
    "Agriculture, Rural & Environment": 89000,
    "Business & Entrepreneurship": 56000,
    "Health & Wellness": 74000,
    "Women and Child": 38000,
    "Social Welfare & Security": 65000
  };

  const categories = Object.keys(categoryBudgets);
  const maxBudget = Math.max(...Object.values(categoryBudgets));

  // Donut chart calculations
  const totalType = stats.central + stats.state;
  const centralAngle = (stats.central / totalType) * 360;
  
  // SVG coordinates helper for Donut
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="container analytics-container view-enter">
      <div className="analytics-header">
        <h1>{t.analytics} Dashboard</h1>
        <p className="analytics-subtitle">Real-time simulated citizen welfare metrics and budget allocations across sectors.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="analytics-stats-grid">
        <div className="stat-card-premium">
          <div className="stat-icon-wrapper blue">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label-text">{t.statsLoaded}</span>
          </div>
        </div>

        <div className="stat-card-premium">
          <div className="stat-icon-wrapper saffron">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-num">{stats.central}</span>
            <span className="stat-label-text">{t.centralSchemesOnly}</span>
          </div>
        </div>

        <div className="stat-card-premium">
          <div className="stat-icon-wrapper emerald">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-num">{stats.state}</span>
            <span className="stat-label-text">{t.stateSchemesOnly}</span>
          </div>
        </div>

        <div className="stat-card-premium">
          <div className="stat-icon-wrapper purple">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-num">98.4%</span>
            <span className="stat-label-text">DBT Disbursement Accuracy</span>
          </div>
        </div>
      </div>

      {/* Visual Graphs Section */}
      <div className="charts-flex-grid">
        {/* Sector Allocation Bar Chart */}
        <div className="chart-panel ">
          <h3 className="chart-panel-title">Sectoral Funding Allocations (₹ in Crores)</h3>
          <p className="chart-desc">Comparative breakdown of budgeted capital support per focus sector.</p>
          <div className="bar-chart-container">
            {categories.map(cat => {
              const val = categoryBudgets[cat];
              const pct = (val / maxBudget) * 100;
              return (
                <div key={cat} className="bar-row">
                  <div className="bar-label">
                    <span>{cat}</span>
                    <strong>₹{val.toLocaleString('en-IN')} Cr</strong>
                  </div>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Central vs State Donut Chart */}
        <div className="chart-panel  donut-panel">
          <h3 className="chart-panel-title">Scheme Origin Ratio</h3>
          <p className="chart-desc">Ratio between Central Government initiatives and State Government-run extensions.</p>
          
          <div className="donut-chart-wrapper">
            <svg width="200" height="200" viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }} className="donut-svg">
              {/* Central Slice */}
              <circle cx="0" cy="0" r="0.75" fill="none" stroke="var(--saffron)" strokeWidth="0.4" strokeDasharray={`${stats.central / totalType * 4.71} 4.71`} />
              {/* State Slice */}
              <circle cx="0" cy="0" r="0.75" fill="none" stroke="var(--emerald)" strokeWidth="0.4" strokeDasharray={`${stats.state / totalType * 4.71} 4.71`} strokeDashoffset={`-${stats.central / totalType * 4.71}`} />
              {/* Inner Hole */}
              <circle cx="0" cy="0" r="0.55" fill="var(--bg-secondary)" />
            </svg>
            <div className="donut-center-label">
              <span className="donut-val">{stats.total}</span>
              <span className="donut-txt">Schemes</span>
            </div>
          </div>

          <div className="donut-legend">
            <div className="legend-item">
              <span className="legend-color saffron"></span>
              <span>{t.centralSchemesOnly} ({Math.round(stats.central / totalType * 100)}%)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color emerald"></span>
              <span>{t.stateSchemesOnly} ({Math.round(stats.state / totalType * 100)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* State-wise Distribution Table */}
      <div className="state-distribution-panel ">
        <h3 className="chart-panel-title">State Specific Welfare Coverage</h3>
        <p className="chart-desc">Local schemes tailored to specific geographic conditions and state policies.</p>
        <div className="states-grid-cards">
          {Object.entries(stats.stateCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([stateName, count]) => (
            <button
              key={stateName}
              className="state-count-chip"
              onClick={() => onSelectState && onSelectState(stateName)}
              title={`View ${count} schemes for ${stateName}`}
            >
              <span className="state-badge-circle">{count}</span>
              <span className="state-chip-name">{stateName}</span>
            </button>
          ))}
          <div className="state-count-chip all-states" style={{ cursor: 'default' }}>
            <span className="state-badge-circle">{stats.central}</span>
            <span className="state-chip-name">Applicable All States (Central)</span>
          </div>
        </div>
      </div>

      <style>{`
        .analytics-container {
          padding: 3rem 1rem;
          text-align: left;
        }

        .analytics-header {
          margin-bottom: 2.5rem;
          border-bottom: 1.5px solid var(--border-color);
          padding-bottom: 1.5rem;
        }

        .analytics-header h1 {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.25rem;
        }

        .analytics-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .analytics-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card-premium {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .stat-card-premium:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-icon-wrapper.blue { background: rgba(37, 99, 235, 0.1); color: var(--primary); }
        .stat-icon-wrapper.saffron { background: rgba(249, 115, 22, 0.1); color: var(--saffron); }
        .stat-icon-wrapper.emerald { background: rgba(16, 185, 129, 0.1); color: var(--emerald); }
        .stat-icon-wrapper.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-num {
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 0.25rem;
          font-family: var(--font-heading);
        }

        .stat-label-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .charts-flex-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        @media (max-width: 900px) {
          .charts-flex-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .chart-panel-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .chart-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .bar-chart-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .bar-row {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .bar-track {
          height: 10px;
          background: var(--bg-tertiary);
          border-radius: 5px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 5px;
          animation: barGrow 1s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: left;
        }

        @keyframes barGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        .donut-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .donut-chart-wrapper {
          position: relative;
          width: 200px;
          height: 200px;
          margin: 1rem 0;
        }

        .donut-center-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          display: flex;
          flex-direction: column;
        }

        .donut-val {
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1;
        }

        .donut-txt {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
        }

        .donut-legend {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          margin-top: 1rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 3px;
        }

        .legend-color.saffron { background: var(--saffron); }
        .legend-color.emerald { background: var(--emerald); }

        .state-distribution-panel {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          box-shadow: var(--shadow-sm);
        }

        .states-grid-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .state-count-chip {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 0.4rem 1rem 0.4rem 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition-fast), border-color var(--transition-fast);
          font-family: var(--font-body);
        }

        .state-count-chip:hover {
          background: var(--primary-light);
          border-color: var(--primary);
        }

        .state-badge-circle {
          background: var(--primary);
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .state-count-chip.all-states .state-badge-circle {
          background: var(--saffron);
        }

        .state-chip-name {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
