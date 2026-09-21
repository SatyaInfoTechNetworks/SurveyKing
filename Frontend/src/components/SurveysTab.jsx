import React, { useState, useEffect } from 'react';
import { Target, Clock, Award, Play, ExternalLink, Coins, Star, Globe, CheckCircle } from 'lucide-react';

export default function SurveysTab({ surveys, ouSurveys = [], clickedSurveys = {}, onStartSurvey }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterProvider, setFilterProvider] = useState('ALL');
  const [now, setNow] = useState(Date.now());

  // 1-second interval to update live countdown and auto-remove surveys after 60 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Normalize CPX surveys to a unified shape
  const cpxNormalized = (surveys || []).map(s => ({
    ...s,
    _type: 'cpx',
    isFeatured: false,
    coinsReward: s.reward,
    provider: s.provider || 'CPX Research'
  }));

  // Normalize OU surveys to a unified shape
  const ouNormalized = (ouSurveys || []).map(s => ({
    ...s,
    id: s.id,
    surveyId: `ou_${s.id}`,
    title: s.title,
    reward: s.coinsReward,
    coinsReward: s.coinsReward,
    estimatedMinutes: s.loi || 0,
    category: 'General',
    icon: '🌐',
    provider: 'opinion_universe',
    providerName: 'Opinion Universe',
    _type: 'ou',
    isFeatured: s.isFeatured || false
  }));

  // Sort OU surveys: Featured first, then highest coins reward
  const ouSorted = [...ouNormalized].sort((a, b) => {
    if (b.isFeatured !== a.isFeatured) return b.isFeatured ? 1 : -1;
    return (b.coinsReward || 0) - (a.coinsReward || 0);
  });

  // Opinion Universe surveys ALWAYS on the top of everything!
  const allSurveys = [...ouSorted, ...cpxNormalized];

  const providerFilters = ['ALL', 'CPX Research', 'Opinion Universe'];

  const filtered = allSurveys.filter(s => {
    const rawId = String(s.id || s.surveyId || '').replace('ou_', '');
    const clickTime = clickedSurveys[rawId] || clickedSurveys[String(s.surveyId)] || clickedSurveys[String(s.id)];

    // After 60 seconds (1 minute), do not show survey to user at all
    if (clickTime && (now - clickTime) >= 60000) {
      return false;
    }

    const pName = s.providerName || (s.provider === 'opinion_universe' ? 'Opinion Universe' : s.provider);
    const matchProvider = filterProvider === 'ALL' || pName === filterProvider;
    const matchCategory = filterCategory === 'ALL' || s.category?.toLowerCase() === filterCategory.toLowerCase();
    return matchProvider && matchCategory;
  });

  const categories = ['ALL', 'Technology', 'Shopping', 'Lifestyle', 'Finance', 'General'];

  return (
    <div style={{ padding: '16px' }}>
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={24} color="var(--accent-gold)" />
          <span>Available Surveys</span>
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Complete quick surveys to earn instant Coins (1,000 Coins = ₹10.00).
        </p>
      </div>

      {/* Provider Filters */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '10px' }}>
        {providerFilters.map(p => (
          <button key={p} onClick={() => setFilterProvider(p)} style={{
            padding: '5px 12px', borderRadius: '9999px', whiteSpace: 'nowrap',
            border: filterProvider === p ? '1px solid #6366f1' : '1px solid var(--border-color)',
            background: filterProvider === p ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
            color: filterProvider === p ? '#a5b4fc' : 'var(--text-secondary)',
            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
          }}>
            {p === 'Opinion Universe' ? '🌐 ' : p === 'CPX Research' ? '🎯 ' : ''}{p}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCategory(cat)} style={{
            padding: '6px 14px', borderRadius: '9999px', whiteSpace: 'nowrap',
            border: filterCategory === cat ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
            background: filterCategory === cat ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
            color: filterCategory === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Survey List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <p>No surveys available right now. Check back soon!</p>
        </div>
      ) : (
        filtered.map((s, i) => {
          const rawId = String(s.id || s.surveyId || '').replace('ou_', '');
          const clickTime = clickedSurveys[rawId] || clickedSurveys[String(s.surveyId)] || clickedSurveys[String(s.id)];
          const isRecentlyClicked = Boolean(clickTime && (now - clickTime) < 60000);
          const secondsRemaining = isRecentlyClicked ? Math.max(1, 60 - Math.floor((now - clickTime) / 1000)) : 0;

          return (
            <div
              className="survey-card"
              key={s.surveyId || s.id || i}
              style={{
                background: s.isFeatured
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(99,102,241,0.06) 100%)'
                  : 'var(--bg-card)',
                border: s.isFeatured
                  ? '1px solid rgba(245,158,11,0.35)'
                  : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                marginBottom: '12px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Featured Badge */}
              {s.isFeatured && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#000', fontSize: '0.62rem', fontWeight: 900,
                  padding: '3px 10px 3px 8px',
                  borderBottomLeftRadius: '8px',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Star size={10} fill="#000" /> FEATURED
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  {/* Survey image or icon */}
                  {s.imageUrl ? (
                    <img src={s.imageUrl} alt="" style={{ width: 44, height: 44, borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} />
                  ) : (
                    <div className="survey-icon" style={{ flexShrink: 0 }}>{s.icon || '🎯'}</div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="survey-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {s._type === 'ou' ? (
                        <span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                          🌐 {s.providerName || 'Opinion Universe'}
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700 }}>
                          🎯 {s.provider}
                        </span>
                      )}
                      <span style={{ color: 'var(--text-muted)' }}>{s.category || 'General'}</span>
                    </div>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)',
                  padding: '4px 10px', borderRadius: '9999px', color: '#f59e0b',
                  fontWeight: 800, fontSize: '0.9rem', whiteSpace: 'nowrap', flexShrink: 0,
                  display: 'inline-flex', alignItems: 'center', gap: '4px'
                }}>
                  <span>+{(s.coinsReward || s.reward || 0).toLocaleString()}</span>
                  <Coins size={14} color="#f59e0b" />
                </div>
              </div>

              {/* Survey Description / About */}
              {s.description && (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px', lineHeight: 1.4 }}>
                  {s.description}
                </div>
              )}

              {/* How to Qualify Tips Box */}
              {s.qualificationTips && (
                <div style={{
                  marginTop: '10px',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.76rem',
                  color: '#c7d2fe',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ color: '#a5b4fc', display: 'block', marginBottom: '2px', fontSize: '0.76rem' }}>
                      How to Qualify:
                    </strong>
                    <div style={{ whiteSpace: 'pre-line', fontSize: '0.74rem', color: '#e0e7ff', lineHeight: 1.4 }}>
                      {s.qualificationTips}
                    </div>
                  </div>
                </div>
              )}

              {/* Recently Clicked / In Progress Notification */}
              {isRecentlyClicked && (
                <div style={{
                  marginTop: '10px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '0.74rem',
                  color: '#fcd34d',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>⏳</span>
                  <span>Survey opened in new tab! Clearing from your list in <strong>{secondsRemaining}s</strong></span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '12px' }}>
                <div className="survey-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                  <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {s.estimatedMinutes || s.loi || 0} mins
                  </span>
                  <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)' }}>
                    ≈ ₹{((s.coinsReward || s.reward || 0) / 100).toFixed(0)} INR
                  </span>
                  {s._type === 'ou' && s.ir > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6366f1' }}>
                      IR: {s.ir}%
                    </span>
                  )}
                </div>

                {isRecentlyClicked ? (
                  <button
                    disabled
                    style={{
                      width: 'auto', padding: '8px 14px', fontSize: '0.76rem', flexShrink: 0,
                      background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                      color: '#94a3b8', borderRadius: '8px', cursor: 'default', fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', gap: '5px'
                    }}
                  >
                    <CheckCircle size={13} color="#10b981" />
                    <span>Started ({secondsRemaining}s)</span>
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: '0.8rem', flexShrink: 0 }}
                    onClick={() => onStartSurvey(s)}
                  >
                    <Play size={13} fill="#000" />
                    <span>Start Survey</span>
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
