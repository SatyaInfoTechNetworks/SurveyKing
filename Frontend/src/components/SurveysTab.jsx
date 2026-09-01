import React, { useState } from 'react';
import { Target, Clock, Award, Play, ExternalLink, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SurveysTab({ surveys, cpxOfferwallUrl, onStartSurvey, activeParticipation, onCompleteWebhook }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [simulating, setSimulating] = useState(false);

  const categories = ['ALL', 'Technology', 'Shopping', 'Lifestyle', 'Finance'];

  const filteredSurveys = filterCategory === 'ALL'
    ? surveys
    : surveys.filter(s => s.category?.toLowerCase() === filterCategory.toLowerCase());

  const handleSimulateCompletion = async (partId) => {
    setSimulating(true);
    try {
      const res = await onCompleteWebhook(partId, 'COMPLETED');
      if (res?.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Webhook simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

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



      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: filterCategory === cat ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
              background: filterCategory === cat ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: filterCategory === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active Survey Participation Notice */}
      {activeParticipation && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.2) 100%)',
          border: '1px solid var(--accent-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 8px 20px var(--accent-gold-glow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="badge">LIVE PARTICIPATION ACTIVE</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {activeParticipation.participationId}</span>
          </div>

          <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
            {activeParticipation.title}
          </h3>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Completion Reward: <strong style={{ color: 'var(--accent-green)' }}>+{activeParticipation.reward.toLocaleString()} 🪙 (≈ ₹{(activeParticipation.reward / 100).toFixed(2)})</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <a
              href={activeParticipation.providerUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ textDecoration: 'none', justifyContent: 'center' }}
            >
              <ExternalLink size={15} />
              <span>Open Link</span>
            </a>

            <button
              className="btn-primary"
              disabled={simulating}
              onClick={() => handleSimulateCompletion(activeParticipation.participationId)}
            >
              {simulating ? '⏳ Verifying...' : '✅ Test Complete Webhook'}
            </button>
          </div>
        </div>
      )}

      {/* Survey List */}
      {filteredSurveys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <p>No surveys available in this category right now.</p>
        </div>
      ) : (
        filteredSurveys.map(s => (
          <div className="survey-card" key={s.surveyId} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <div className="survey-icon" style={{ flexShrink: 0 }}>{s.icon || '🎯'}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="survey-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Provider: <strong style={{ color: 'var(--accent-gold)' }}>{s.provider}</strong> • {s.category || 'General'}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                padding: '4px 10px',
                borderRadius: '9999px',
                color: '#f59e0b',
                fontWeight: 800,
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>+{s.reward.toLocaleString()}</span>
                <Coins size={14} color="#f59e0b" />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '10px', marginTop: '12px' }}>
              <div className="survey-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {s.estimatedMinutes} mins</span>
                <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)' }}>≈ ₹{(s.reward / 100).toFixed(0)} INR</span>
              </div>

              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '8px 16px', fontSize: '0.8rem', flexShrink: 0 }}
                onClick={() => onStartSurvey(s)}
              >
                <Play size={13} fill="#000" />
                <span>Start Survey</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
