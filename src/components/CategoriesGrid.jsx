import React from 'react';
import { translations } from '../data/localization';
import './CategoriesGrid.css';

export default function CategoriesGrid({ schemes, onSelectCategory, lang = 'en' }) {
  const t = translations[lang] || translations.en;

  // Define categories with details
  const categories = [
    {
      name: 'Education & Learning',
      displayName: t.catEducation,
      description: 'Scholarships, credit cards, fee waivers, and academic training assistance.',
      iconColor: 'var(--primary)',
      iconBg: 'var(--primary-light)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      )
    },
    {
      name: 'Agriculture, Rural & Environment',
      displayName: t.catAgriculture,
      description: 'Direct cash support, crop insurance, agribusiness loans, and subsidies.',
      iconColor: 'var(--emerald)',
      iconBg: 'var(--emerald-light)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v8M9 11l3-3 3 3" />
        </svg>
      )
    },
    {
      name: 'Business & Entrepreneurship',
      displayName: t.catBusiness,
      description: 'Collateral-free commercial loans, greenfield startup funds, and training grants.',
      iconColor: '#8b5cf6',
      iconBg: '#f3e8ff',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      name: 'Health & Wellness',
      displayName: t.catHealth,
      description: 'Free healthcare insurance, maternal health assistance, and medical cover.',
      iconColor: '#ef4444',
      iconBg: '#fee2e2',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
    {
      name: 'Women and Child',
      displayName: t.catWomen,
      description: 'Girl savings accounts, milestone educational support, and maternal benefits.',
      iconColor: '#ec4899',
      iconBg: '#fce7f3',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
          <path d="M12 12v10M9 19h6" />
        </svg>
      )
    },
    {
      name: 'Social Welfare & Security',
      displayName: t.catSocial,
      description: 'Old-age pensions, unorganized sector safety nets, and accident insurances.',
      iconColor: 'var(--saffron)',
      iconBg: 'var(--saffron-light)',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  // Helper to count schemes in each category
  const getSchemeCount = (categoryName) => {
    return schemes.filter(s => s.category === categoryName).length;
  };

  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Browse Schemes by Category</h2>
          <p className="section-desc">
            Explore welfare programs structured across major sectors of socioeconomic empowerment.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((cat, idx) => {
            const count = getSchemeCount(cat.name);
            return (
              <div 
                key={idx} 
                className="category-card"
                onClick={() => onSelectCategory(cat.name)}
                style={{ '--hover-accent': cat.iconColor }}
              >
                <div className="cat-icon-container" style={{ color: cat.iconColor, background: cat.iconBg }}>
                  {cat.icon}
                </div>
                <div className="cat-content">
                  <h3>{cat.displayName}</h3>
                  <p>{cat.description}</p>
                  <div className="cat-footer-row">
                    <span className="count-label">{count} Active Programs</span>
                    <span className="arrow-icon">→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
