import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Ban, Eye, Search } from 'lucide-react';

export default function FraudPage({ stats, flags, onSelectUser }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            🚨 Fraud & Security Risk Operations Center
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Automated anomaly detection across multiple Telegram accounts, abnormal survey completion speed, and duplicate withdrawal attempts.
          </p>
        </div>
      </div>

      {/* Risk KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>HIGH RISK USERS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
            {stats?.highRiskUsers || 3}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '2px' }}>Flagged for Review ⚠️</div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>MULTIPLE ACCOUNTS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {stats?.multipleAccounts || 2}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '2px' }}>Same IP Clusters</div>
        </div>

        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>SUSPICIOUS ACTIVITY</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
            {stats?.suspiciousActivity || 5}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#60a5fa', marginTop: '2px' }}>Rapid Completions</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>BLOCKED USERS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {stats?.blockedUsers || 1}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Enforced Banned</div>
        </div>
      </div>

      {/* Flags Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
          🚨 Active Risk & Anomaly Alerts
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>USER</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>RISK LEVEL</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>FLAG TYPE</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>DESCRIPTION / SIGNAL</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>IP ADDRESS</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((fl) => (
              <tr key={fl.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{fl.userName || 'User'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>TG ID: {fl.userTgId || fl.userId}</div>
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: '9999px',
                    background: fl.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : (fl.risk_level === 'MEDIUM' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
                    color: fl.risk_level === 'HIGH' ? '#ef4444' : (fl.risk_level === 'MEDIUM' ? '#f59e0b' : '#10b981')
                  }}>
                    {fl.risk_level} RISK
                  </span>
                </td>
                <td style={{ padding: '14px 18px', color: '#fff', fontWeight: 600 }}>
                  {fl.flag_type}
                </td>
                <td style={{ padding: '14px 18px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.8rem' }}>
                  {fl.description}
                </td>
                <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--text-muted, #64748b)' }}>
                  {fl.ip || '103.21.125.10'}
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <button
                    onClick={() => onSelectUser(fl.userId || fl.user_id)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={13} /> Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
