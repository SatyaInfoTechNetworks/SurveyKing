import React, { useState } from 'react';
import { X, Plus, Save, Target } from 'lucide-react';

export default function SurveyModal({ survey, onClose, onSave, loading }) {
  const [surveyId, setSurveyId] = useState(survey?.survey_id || '');
  const [title, setTitle] = useState(survey?.title || '');
  const [reward, setReward] = useState(survey?.reward || '5000');
  const [estimatedMinutes, setEstimatedMinutes] = useState(survey?.estimated_minutes || '8');
  const [category, setCategory] = useState(survey?.category || 'General');
  const [icon, setIcon] = useState(survey?.icon || '🎯');
  const [entryUrl, setEntryUrl] = useState(survey?.entry_url || '');
  const [priority, setPriority] = useState(survey?.priority || 0);
  const [status, setStatus] = useState(survey?.status || 'ACTIVE');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!surveyId || !title || !reward) return alert('Please fill in required fields');

    onSave({
      surveyId,
      title,
      reward: parseFloat(reward),
      estimatedMinutes: parseInt(estimatedMinutes, 10),
      category,
      icon,
      entryUrl,
      priority: parseInt(priority, 10) || 0,
      status
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 250,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '520px',
        maxWidth: '100%',
        background: '#0d131f',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={20} color="#f59e0b" />
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
              {survey ? 'Edit Custom Survey' : 'Create Custom High-Payout Survey'}
            </span>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
              Survey Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fintech & Digital Banking Survey"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Unique Survey ID *
              </label>
              <input
                type="text"
                required
                disabled={!!survey}
                placeholder="e.g. SK_FIN_9901"
                value={surveyId}
                onChange={(e) => setSurveyId(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Reward Coins * (1000 = ₹10)
              </label>
              <input
                type="number"
                required
                placeholder="5000"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#f59e0b',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Estimated Mins
              </label>
              <input
                type="number"
                placeholder="8"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: '#151d2e',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="General">General</option>
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Shopping">Shopping</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Icon Emoji
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
              Direct Survey Entry URL
            </label>
            <input
              type="url"
              placeholder="https://partner-surveys.com/start?subid={user_id}"
              value={entryUrl}
              onChange={(e) => setEntryUrl(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  width: '100%',
                  background: '#151d2e',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="ACTIVE">ACTIVE (Live)</option>
                <option value="PAUSED">PAUSED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Priority (High first)
              </label>
              <input
                type="number"
                placeholder="10"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '10px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Save size={16} />
            <span>{survey ? 'Update Survey' : 'Publish Survey to Users'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
