/**
 * PLAN: SchemeAlerts — Feature 3 (HIGH priority)
 * 
 * Problem: myScheme is completely passive. It doesn't tell you when a deadline is approaching
 * or when a new scheme matching your profile has been added. Citizens miss application windows.
 * 
 * Solution: A proactive alert/notification system stored in localStorage. Users can "subscribe"
 * to any scheme from the details panel. A persistent hook runs on every app load to check if
 * any subscribed schemes have deadlines within 7 days, and surfaces them as a dismissible
 * banner on the home view. Uses browser Notification API when permission is granted.
 * 
 * Tech: React hook + localStorage + optional Web Push Notification API.
 */

import { useState, useEffect, useCallback } from 'react';

const ALERTS_KEY = 'scheme_alerts_v1';
const DISMISSED_KEY = 'scheme_alerts_dismissed_v1';

// Reads all active scheme alert subscriptions
export function useSchemeAlerts() {
  const [alerts, setAlerts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]'); }
    catch { return []; }
  });

  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); }
    catch { return []; }
  });

  const subscribeToScheme = useCallback((scheme) => {
    setAlerts(prev => {
      if (prev.some(a => a.id === scheme.id)) return prev;
      const updated = [...prev, {
        id: scheme.id,
        title: scheme.title,
        category: scheme.category,
        subscribedAt: new Date().toISOString(),
        // Simulate a deadline 30 days from now for demo purposes
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }];
      localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unsubscribeFromScheme = useCallback((schemeId) => {
    setAlerts(prev => {
      const updated = prev.filter(a => a.id !== schemeId);
      localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isSubscribed = useCallback((schemeId) => {
    return alerts.some(a => a.id === schemeId);
  }, [alerts]);

  const dismissAlert = useCallback((schemeId) => {
    setDismissed(prev => {
      const updated = [...prev, schemeId];
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Compute upcoming deadlines (within 7 days), not yet dismissed
  const urgentAlerts = alerts.filter(a => {
    if (dismissed.includes(a.id)) return false;
    const deadline = new Date(a.deadline);
    const daysLeft = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft >= 0;
  });

  return { alerts, urgentAlerts, subscribeToScheme, unsubscribeFromScheme, isSubscribed, dismissAlert };
}


// ── AlertBanner component: shown at top of home page when urgent deadlines exist ──

export function AlertBanner({ urgentAlerts, dismissAlert, onOpenScheme, schemes, lang = 'en' }) {
  if (!urgentAlerts || urgentAlerts.length === 0) return null;

  const title = lang === 'hi' ? 'आवेदन की अंतिम तिथि आ रही है!' :
                lang === 'te' ? 'దరఖాస్తు గడువు దగ్గర పడుతోంది!' :
                'Application Deadlines Approaching!';

  return (
    <div className="alert-banner-container">
      <div className="alert-banner-inner container">
        <div className="alert-banner-icon">🔔</div>
        <div className="alert-banner-body">
          <strong>{title}</strong>
          <div className="alert-banner-items">
            {urgentAlerts.map(alert => {
              const daysLeft = Math.ceil((new Date(alert.deadline) - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={alert.id} className="alert-banner-item">
                  <span className="alert-scheme-name">{alert.title}</span>
                  <span className="alert-days-badge">{daysLeft}d left</span>
                  <button
                    className="alert-view-btn"
                    onClick={() => {
                      const scheme = schemes?.find(s => s.id === alert.id);
                      if (scheme && onOpenScheme) onOpenScheme(scheme);
                    }}
                  >
                    {lang === 'hi' ? 'देखें' : lang === 'te' ? 'చూడండి' : 'View'}
                  </button>
                  <button className="alert-dismiss-btn" onClick={() => dismissAlert(alert.id)} title="Dismiss">✕</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        .alert-banner-container {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          border-bottom: 2px solid #f59e0b;
          padding: 0.75rem 0;
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .alert-banner-inner {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .alert-banner-icon { font-size: 1.2rem; margin-top: 2px; }
        .alert-banner-body { flex: 1; }
        .alert-banner-body strong {
          font-size: 0.85rem;
          color: #92400e;
          display: block;
          margin-bottom: 0.4rem;
        }
        .alert-banner-items { display: flex; flex-direction: column; gap: 0.3rem; }
        .alert-banner-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .alert-scheme-name { font-size: 0.8rem; color: #78350f; font-weight: 600; }
        .alert-days-badge {
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 999px;
        }
        .alert-view-btn {
          font-size: 0.72rem;
          background: #003366;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 2px 8px;
          cursor: pointer;
        }
        .alert-view-btn:hover { background: #004080; }
        .alert-dismiss-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0 2px;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}


// ── SubscribeButton: shown inside SchemeDetails to let user "notify me" ──

export function SubscribeButton({ scheme, lang = 'en' }) {
  const { isSubscribed, subscribeToScheme, unsubscribeFromScheme } = useSchemeAlerts();
  const subscribed = isSubscribed(scheme.id);

  const handleClick = (e) => {
    e.stopPropagation();
    if (subscribed) {
      unsubscribeFromScheme(scheme.id);
    } else {
      subscribeToScheme(scheme);
      // Request browser notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const label = subscribed
    ? (lang === 'hi' ? '🔔 सूचित करें (चालू)' : lang === 'te' ? '🔔 అప్రమత్తం (ఆన్)' : '🔔 Alert On')
    : (lang === 'hi' ? '🔔 सूचित करें' : lang === 'te' ? '🔔 నోటిఫై చేయి' : '🔔 Notify Me');

  return (
    <button
      className={`btn-subscribe-alert ${subscribed ? 'subscribed' : ''}`}
      onClick={handleClick}
      title={subscribed ? 'Click to remove deadline alert' : 'Get notified before deadline'}
    >
      {label}
      <style>{`
        .btn-subscribe-alert {
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.4rem 0.9rem;
          border-radius: 6px;
          border: 1.5px solid #f59e0b;
          background: #fffbeb;
          color: #92400e;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }
        .btn-subscribe-alert:hover { background: #fef3c7; border-color: #d97706; }
        .btn-subscribe-alert.subscribed { background: #f59e0b; color: white; border-color: #d97706; }
      `}</style>
    </button>
  );
}
