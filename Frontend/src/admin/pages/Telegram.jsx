import React, { useState } from 'react';
import { Bot, Send, CheckCircle, XCircle, RefreshCw, MessageSquare, Radio } from 'lucide-react';

export default function TelegramPage({ botStatus, notifications, onSendBroadcast, broadcastLoading }) {
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [targetUser, setTargetUser] = useState('');

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMsg) return alert('Please enter message text');
    onSendBroadcast({
      message: broadcastMsg,
      targetUserId: targetUser || null
    });
    setBroadcastMsg('');
    setTargetUser('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            🤖 Telegram Bot Management & Notification Ledger
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Real-time status monitoring of @survey_king_bot, broadcast messaging system, and full notification delivery audit.
          </p>
        </div>
      </div>

      {/* Bot Health & KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>BOT STATUS</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            ONLINE & LISTENING
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Polling Active 🟢</div>
        </div>

        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>BOT USERNAME</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
            @survey_king_bot
          </div>
          <div style={{ fontSize: '0.7rem', color: '#60a5fa', marginTop: '2px' }}>Verified Mini App Bot</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>ACTIVE TELEGRAM USERS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {botStatus?.totalUsers || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Active Today: {botStatus?.activeToday || 0}</div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>NOTIFICATIONS DISPATCHED</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {notifications.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Instant Earnings Alerts</div>
        </div>
      </div>

      {/* Main Grid: Broadcast Tool & Notification Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px' }}>
        {/* Left: Broadcast Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
          height: 'fit-content'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MessageSquare size={18} color="#f59e0b" />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Telegram Announcement Broadcast</span>
          </div>

          <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Target User (Leave empty for All Users)
              </label>
              <input
                type="text"
                placeholder="Telegram User ID (Optional)"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
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
                Broadcast Message (Markdown Supported) *
              </label>
              <textarea
                rows={5}
                required
                placeholder="🎉 New High Paying Survey Available! Earn +10,000 Coins right now inside Survey King 👑"
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={broadcastLoading}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                padding: '11px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Send size={15} />
              <span>{broadcastLoading ? 'Dispatching Broadcast...' : 'Dispatch Telegram Broadcast'}</span>
            </button>
          </form>
        </div>

        {/* Right: Notification Delivery Ledger */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
            Live Dispatch Stream ({notifications.length})
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>RECIPIENT (TG ID)</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TYPE</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>MESSAGE SNIPPET</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>DELIVERY</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>TIME</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #64748b)' }}>
                    No telegram notification dispatches logged yet.
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#fff', fontWeight: 600 }}>
                      {n.telegram_user_id}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b'
                      }}>
                        {n.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.78rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: n.status === 'SENT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: n.status === 'SENT' ? '#10b981' : '#ef4444'
                      }}>
                        {n.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                      {new Date(n.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
