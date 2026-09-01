import React from 'react';
import { X, Radio, CheckCircle, XCircle, AlertCircle, RefreshCw, ShieldCheck, Clock, Globe, ArrowRight } from 'lucide-react';

export default function PostbackDrawer({ postback, onClose, onRetry, retryLoading }) {
  if (!postback) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '560px',
        maxWidth: '90vw',
        background: '#0d131f',
        borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: postback.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: postback.status === 'COMPLETED' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: postback.status === 'COMPLETED' ? '#10b981' : '#ef4444'
            }}>
              <Radio size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>Postback Event #{postback.id}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                Provider: <strong style={{ color: '#f59e0b' }}>{postback.provider}</strong> • Trans ID: {postback.trans_id || 'N/A'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Details Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Status Badge Banner */}
          <div style={{
            padding: '14px',
            borderRadius: '10px',
            background: postback.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: postback.status === 'COMPLETED' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {postback.status === 'COMPLETED' ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Delivery Status</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: postback.status === 'COMPLETED' ? '#10b981' : '#ef4444' }}>
                  {postback.status} (Raw: {postback.raw_status})
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Idempotency State</div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: postback.idempotency_status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: postback.idempotency_status === 'SUCCESS' ? '#10b981' : '#f59e0b'
              }}>
                {postback.idempotency_status}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '8px' }}>
              📡 Postback Payload Inspection
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>Target User (TG ID):</span>
                <div style={{ color: '#fff', fontWeight: 700, marginTop: '2px' }}>{postback.user_id || 'N/A'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>Transaction ID:</span>
                <div style={{ color: '#f59e0b', fontWeight: 700, marginTop: '2px' }}>{postback.trans_id || 'N/A'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>Reward Coins:</span>
                <div style={{ color: '#10b981', fontWeight: 800, marginTop: '2px' }}>
                  +{parseFloat(postback.amount_local || 0).toLocaleString()} 🪙
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>Amount USD:</span>
                <div style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>${postback.amount_usd || '0.00'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>Processing Latency:</span>
                <div style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>{postback.processing_time_ms || 0} ms</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>Wallet Credited:</span>
                <div style={{ color: postback.wallet_credited ? '#10b981' : '#ef4444', fontWeight: 700, marginTop: '2px' }}>
                  {postback.wallet_credited ? 'YES ✅' : 'NO ❌'}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>IP Address:</span>
                <div style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>{postback.ip || '127.0.0.1'}</div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>Received At:</span>
                <div style={{ color: '#fff', fontWeight: 600, marginTop: '2px' }}>{new Date(postback.created_at).toLocaleTimeString()}</div>
              </div>
            </div>

            {postback.error_reason && (
              <div style={{
                marginTop: '8px',
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: '0.8rem'
              }}>
                <strong>Error Reason:</strong> {postback.error_reason}
              </div>
            )}
          </div>

          {/* Safe Retry Action */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              🛡️ Safe Postback Retry
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', marginBottom: '12px' }}>
              Retrying verifies database idempotency first. If the user was already credited, duplicate payouts are strictly prevented.
            </div>

            <button
              onClick={() => onRetry(postback.id)}
              disabled={retryLoading || postback.wallet_credited === 1}
              style={{
                width: '100%',
                background: postback.wallet_credited === 1 ? 'rgba(255, 255, 255, 0.08)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: postback.wallet_credited === 1 ? '#64748b' : '#000',
                border: 'none',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: postback.wallet_credited === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={15} className={retryLoading ? 'spin-anim' : ''} />
              <span>{postback.wallet_credited === 1 ? 'Postback Already Credited (Safe Lock)' : 'Retry Postback Safely'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
