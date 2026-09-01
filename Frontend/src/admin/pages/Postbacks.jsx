import React, { useState } from 'react';
import { Radio, Search, CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, ShieldCheck } from 'lucide-react';

export default function PostbacksPage({ postbacks, stats, onSelectPostback, filter, setFilter, search, setSearch, onRefresh, retryLoading }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            📡 Postback Webhooks & Idempotency Monitor
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Real-time webhook ingestion engine from CPX Research and partners with cryptographic signature checks and double-reward prevention.
          </p>
        </div>

        <button
          onClick={onRefresh}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} className={retryLoading ? 'spin-anim' : ''} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Postbacks KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>TOTAL POSTBACKS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {stats?.total?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#60a5fa', marginTop: '2px' }}>Live Webhook Stream</div>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>SUCCESSFUL (CREDITED)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {stats?.successful?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Wallet Rewarded ✅</div>
        </div>

        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>FAILED / ERRORS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
            {stats?.failed?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '2px' }}>Needs Safe Retry ⚠️</div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>DUPLICATES (IDEMPOTENT)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {stats?.duplicates?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '2px' }}>Double Payouts Blocked 🛡️</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
          <Search size={16} color="var(--text-muted, #64748b)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Transaction ID, User ID, Offer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 12px 8px 36px',
              fontSize: '0.85rem',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'All Postbacks' },
            { id: 'SUCCESS', label: 'Successful (Credited)' },
            { id: 'FAILED', label: 'Failed' },
            { id: 'DUPLICATES', label: 'Duplicates' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: filter === f.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                color: filter === f.id ? '#f59e0b' : 'var(--text-secondary, #94a3b8)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: filter === f.id ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Postbacks Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TIMESTAMP</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>PROVIDER</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TRANSACTION ID</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>USER TG ID</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>REWARD COINS</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>STATUS</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {postbacks.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #64748b)' }}>
                  No postback logs matching your filter criteria.
                </td>
              </tr>
            ) : (
              postbacks.map((pb) => (
                <tr
                  key={pb.id}
                  onClick={() => onSelectPostback(pb.id)}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontSize: '0.78rem' }}>
                    {new Date(pb.created_at).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontWeight: 800, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      {pb.provider}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#fff', fontWeight: 600 }}>
                    {pb.trans_id || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: 'var(--text-secondary, #94a3b8)' }}>
                    {pb.user_id || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: '#10b981' }}>
                    +{parseFloat(pb.amount_local || 0).toLocaleString()} 🪙
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      background: pb.idempotency_status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : (pb.idempotency_status === 'DUPLICATE' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                      color: pb.idempotency_status === 'SUCCESS' ? '#10b981' : (pb.idempotency_status === 'DUPLICATE' ? '#f59e0b' : '#ef4444')
                    }}>
                      {pb.idempotency_status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectPostback(pb.id); }}
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
                      <Eye size={13} /> Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
