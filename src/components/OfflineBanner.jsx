/**
 * PLAN: OfflineBanner — Feature 2 (HIGH priority)
 * 
 * Problem: myScheme has zero offline capability. Rural users with intermittent internet
 * see a blank screen. SchemeSense already has a PWA/ServiceWorker via VitePWA that
 * caches the app shell and schemes.json. This component surfaces that capability to users.
 * 
 * Solution: A React hook that listens to navigator.onLine and window online/offline events.
 * When offline: shows a friendly banner explaining cached data is still available.
 * When coming back online: shows a "you're back!" confirmation.
 * Also: an "Apply Later" sync queue in localStorage — if a user clicks Apply while offline,
 * the intent is queued and a toast fires when they reconnect.
 * 
 * Tech: navigator.onLine + window events + localStorage sync queue.
 */

import { useState, useEffect, useCallback } from 'react';

const SYNC_QUEUE_KEY = 'offline_sync_queue_v1';

// ── Hook: useOnlineStatus ──
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustCameOnline(true);
      setTimeout(() => setJustCameOnline(false), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setJustCameOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, justCameOnline };
}

// ── Sync Queue: queue an "apply later" action ──
export function queueOfflineAction(scheme) {
  const existing = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
  const alreadyQueued = existing.some(a => a.id === scheme.id);
  if (!alreadyQueued) {
    existing.push({ id: scheme.id, title: scheme.title, queuedAt: new Date().toISOString() });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(existing));
  }
}

export function getOfflineQueue() {
  return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
}

export function clearOfflineQueue() {
  localStorage.removeItem(SYNC_QUEUE_KEY);
}

// ── OfflineBanner component ──
export default function OfflineBanner({ isOnline, justCameOnline, lang = 'en' }) {
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    setQueueSize(getOfflineQueue().length);
  }, [isOnline]);

  if (isOnline && !justCameOnline) return null;

  if (justCameOnline) {
    return (
      <div className="offline-banner online-restored">
        <span>✅ </span>
        <span>
          {lang === 'hi' ? 'इंटरनेट कनेक्शन बहाल हुआ!' :
           lang === 'te' ? 'ఇంటర్నెట్ కనెక్షన్ తిరిగి వచ్చింది!' :
           'You\'re back online!'}
          {queueSize > 0 && ` ${queueSize} queued action${queueSize > 1 ? 's' : ''} will now sync.`}
        </span>
        <BannerStyles />
      </div>
    );
  }

  return (
    <div className="offline-banner offline-mode">
      <span>📡 </span>
      <div className="offline-banner-text">
        <strong>
          {lang === 'hi' ? 'ऑफलाइन मोड' :
           lang === 'te' ? 'ఆఫ్‌లైన్ మోడ్' :
           'Offline Mode'}
        </strong>
        <span>
          {lang === 'hi' ? ' — सभी 124 योजनाएं कैश में उपलब्ध हैं। "अभी आवेदन करें" बटन बाद में सिंक होगा।' :
           lang === 'te' ? ' — అన్ని 124 పథకాలు కాష్‌లో అందుబాటులో ఉన్నాయి. "ఇప్పుడు దరఖాస్తు" తర్వాత సమకాలీకరించబడుతుంది.' :
           ' — All 124 schemes are available from cache. "Apply Now" actions will sync when you reconnect.'}
        </span>
      </div>
      <BannerStyles />
    </div>
  );
}

function BannerStyles() {
  return (
    <style>{`
      .offline-banner {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.6rem 1.5rem;
        font-size: 0.82rem;
        font-weight: 500;
        line-height: 1.4;
        animation: slideDown 0.3s ease;
      }
      @keyframes slideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .offline-mode {
        background: #1e3a5f;
        color: #bfdbfe;
        border-bottom: 2px solid #2563eb;
      }
      .online-restored {
        background: #f0fdf4;
        color: #15803d;
        border-bottom: 2px solid #16a34a;
      }
      .offline-banner-text { flex: 1; }
      .offline-banner strong { color: white; }
      .online-restored strong { color: #15803d; }
    `}</style>
  );
}
