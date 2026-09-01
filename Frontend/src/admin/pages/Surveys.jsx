import React, { useState } from 'react';
import { Target, Plus, Play, Pause, Trash2, Edit3, Clock, Coins, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export default function SurveysPage({ liveSurveys, customSurveys, attempts, onCreateSurvey, onEditSurvey, onDeleteSurvey }) {
  const [activeSubTab, setActiveSubTab] = useState('live');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Surveys & Partner Management
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Monitor CPX live surveys, manage custom high-reward survey campaigns, and track real-time user participation attempts.
          </p>
        </div>

        <button
          onClick={onCreateSurvey}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 16px',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}
        >
          <Plus size={16} /> Create Custom Survey
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '10px'
      }}>
        {[
          { id: 'live', label: `🎯 Live Surveys (${liveSurveys.length})` },
          { id: 'custom', label: `📝 Custom Surveys (${customSurveys.length})` },
          { id: 'attempts', label: `📊 User Survey Attempts (${attempts.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              background: activeSubTab === tab.id ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: activeSubTab === tab.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.06)',
              color: activeSubTab === tab.id ? '#f59e0b' : 'var(--text-secondary, #94a3b8)',
              fontWeight: activeSubTab === tab.id ? 800 : 500,
              fontSize: '0.82rem',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-Tab 1: Live Surveys */}
      {activeSubTab === 'live' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>PROVIDER</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>SURVEY ID</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TITLE & CATEGORY</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>REWARD</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>LOI (MINS)</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>CONVERSION</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {liveSurveys.map((s, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontWeight: 800, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      {s.provider}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--text-secondary, #94a3b8)' }}>
                    {s.surveyId}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{s.title}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Category: {s.category}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#f59e0b' }}>
                    +{s.reward.toLocaleString()} 🪙
                  </td>
                  <td style={{ padding: '14px 18px', color: '#fff' }}>
                    ⏱ {s.loi} mins
                  </td>
                  <td style={{ padding: '14px 18px', color: '#10b981', fontWeight: 700 }}>
                    {s.conversionRate || '40%'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub-Tab 2: Custom Surveys */}
      {activeSubTab === 'custom' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>ICON & TITLE</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>SURVEY ID</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>REWARD</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>MINS</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>PRIORITY</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {customSurveys.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #64748b)' }}>
                    No custom surveys created yet. Click "Create Custom Survey" above to launch one.
                  </td>
                </tr>
              ) : (
                customSurveys.map((cs) => (
                  <tr key={cs.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{cs.icon || '🎯'}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{cs.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>{cs.category}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#94a3b8' }}>
                      {cs.survey_id}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#f59e0b' }}>
                      +{parseFloat(cs.reward).toLocaleString()} 🪙
                    </td>
                    <td style={{ padding: '14px 18px', color: '#fff' }}>
                      {cs.estimated_minutes} mins
                    </td>
                    <td style={{ padding: '14px 18px', color: '#60a5fa', fontWeight: 700 }}>
                      P-{cs.priority || 0}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: cs.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: cs.status === 'ACTIVE' ? '#10b981' : '#f59e0b'
                      }}>
                        {cs.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => onEditSurvey(cs)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteSurvey(cs.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub-Tab 3: Survey Attempts */}
      {activeSubTab === 'attempts' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>PARTICIPATION ID</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>USER</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>SURVEY & PROVIDER</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>REWARD</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #64748b)' }}>
                    No survey participation attempts logged yet.
                  </td>
                </tr>
              ) : (
                attempts.map((att) => (
                  <tr key={att.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#f59e0b' }}>
                      {att.participation_id}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{att.userName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>TG ID: {att.userTgId}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{att.survey_id}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>{att.provider}</div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#f59e0b' }}>
                      +{parseFloat(att.reward).toLocaleString()} 🪙
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: att.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: att.status === 'COMPLETED' ? '#10b981' : '#ef4444'
                      }}>
                        {att.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                      {new Date(att.started_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
