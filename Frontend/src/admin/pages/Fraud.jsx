import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Ban, Eye, Search, Coins, Check, RefreshCw } from 'lucide-react';

export default function FraudPage({ stats, flags, onSelectUser, onRefresh }) {
  const [loadingId, setLoadingId] = useState(null);
  const [msg, setMsg] = useState(null);

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'BANNED' ? 'ACTIVE' : 'BANNED';
    if (!window.confirm(`Are you sure you want to change user #${userId} status to ${newStatus}?`)) return;

    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason: 'Admin Fraud Operations Action' })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ User #${userId} updated to ${newStatus}`);
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || 'Failed to update user status');
      }
    } catch (e) {
      alert('Network error updating user status');
    } finally {
      setLoadingId(null);
    }
  };

  const handleAdjustBalance = async (userId, userName) => {
    const amountStr = window.prompt(`Enter coin amount to adjust for ${userName} (#${userId}) (Use positive to add, negative to deduct):`, '1000');
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return alert('Invalid coin amount');

    const reason = window.prompt('Enter reason for audit log:', 'Fraud audit balance adjustment') || 'Admin fraud adjustment';

    setLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason })
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || 'Failed to adjust balance');
      }
    } catch (e) {
      alert('Network error adjusting balance');
    } finally {
      setLoadingId(null);
    }
  };

  const handleResolveFlag = async (flagId) => {
    setLoadingId(flagId);
    try {
      const res = await fetch(`/api/admin/fraud/flags/${flagId}/resolve`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ Flag #${flagId} resolved`);
        if (onRefresh) onRefresh();
      } else {
        alert(data.error || 'Failed to resolve flag');
      }
    } catch (e) {
      alert('Network error resolving flag');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Notification Toast */}
      {msg && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '8px',
          color: '#10b981',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            🚨 Fraud & Security Risk Operations Center
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Automated anomaly detection across multiple Telegram accounts, abnormal survey completion speed, and manual risk controls.
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} /> Refresh Flags
          </button>
        )}
      </div>

      {/* Risk KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>HIGH RISK USERS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
            {stats?.highRiskUsers ?? 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '2px' }}>Flagged for Review ⚠️</div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>MULTIPLE ACCOUNTS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {stats?.multipleAccounts ?? 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '2px' }}>Same IP Clusters</div>
        </div>

        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>SUSPICIOUS ACTIVITY</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
            {stats?.suspiciousActivity ?? 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#60a5fa', marginTop: '2px' }}>Rapid Completions</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>BLOCKED USERS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {stats?.blockedUsers ?? 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Enforced Banned</div>
        </div>
      </div>

      {/* Flags & User Handling Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
          🚨 Active Risk & Anomaly Alerts (Direct User Management)
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>USER IDENTIFIERS</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>RISK LEVEL</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>FLAG TYPE</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>DESCRIPTION / SIGNAL</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>IP ADDRESS</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>MANUAL ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!flags || flags.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted, #64748b)' }}>
                  No active fraud flags or security anomalies detected. System integrity normal.
                </td>
              </tr>
            ) : (
              flags.map((fl) => {
                const uid = fl.userId || fl.user_id;
                const isBanned = fl.userStatus === 'BANNED';

                return (
                  <tr key={fl.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{fl.userName || 'User'}</span>
                        <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                          DB ID: #{uid}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                        TG ID: <code style={{ color: '#60a5fa' }}>{fl.userTgId || fl.user_id}</code> {fl.userUsername ? `(${fl.userUsername})` : ''}
                      </div>
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
                    <td style={{ padding: '14px 18px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.8rem', maxWidth: '280px' }}>
                      {fl.description}
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--text-muted, #64748b)' }}>
                      {fl.ip || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* Ban / Unban Button */}
                        <button
                          onClick={() => handleToggleStatus(uid, fl.userStatus)}
                          disabled={loadingId === uid}
                          style={{
                            background: isBanned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            border: `1px solid ${isBanned ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            color: isBanned ? '#10b981' : '#ef4444',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Ban size={12} /> {isBanned ? 'Unban User' : 'Ban User'}
                        </button>

                        {/* Adjust Balance Button */}
                        <button
                          onClick={() => handleAdjustBalance(uid, fl.userName)}
                          disabled={loadingId === uid}
                          style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            color: '#f59e0b',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Coins size={12} /> Adjust Bal
                        </button>

                        {/* Resolve Flag Button */}
                        <button
                          onClick={() => handleResolveFlag(fl.id)}
                          disabled={loadingId === fl.id}
                          style={{
                            background: 'rgba(59, 130, 246, 0.12)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            color: '#60a5fa',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={12} /> Resolve
                        </button>

                        {/* Investigate Button */}
                        <button
                          onClick={() => onSelectUser(uid)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={12} /> Investigate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
