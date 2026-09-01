import React, { useState } from 'react';
import { Wallet, Filter, Search, ArrowDownRight, ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function WalletPage({ ledger, typeFilter, setTypeFilter }) {
  const types = [
    { id: 'ALL', label: 'All Transactions' },
    { id: 'SURVEY_REWARD', label: '🎯 Survey Rewards' },
    { id: 'REFERRAL_REWARD', label: '👥 Referral Rewards' },
    { id: 'WITHDRAWAL', label: '💸 Withdrawals' },
    { id: 'WITHDRAWAL_REFUND', label: '🔄 Refunds' },
    { id: 'ADMIN_ADJUSTMENT', label: '⚡ Admin Adjustments' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            💰 Universal Wallet Ledger
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Complete immutable transaction log of all credits, debits, referral qualifications, and withdrawal refunds across the entire platform.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '10px',
        overflowX: 'auto'
      }}>
        {types.map(t => (
          <button
            key={t.id}
            onClick={() => setTypeFilter(t.id)}
            style={{
              background: typeFilter === t.id ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: typeFilter === t.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.06)',
              color: typeFilter === t.id ? '#f59e0b' : 'var(--text-secondary, #94a3b8)',
              fontWeight: typeFilter === t.id ? 800 : 500,
              fontSize: '0.82rem',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TX ID</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>USER</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TYPE</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>AMOUNT</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>DESCRIPTION / REF</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>TIMESTAMP</th>
            </tr>
          </thead>
          <tbody>
            {ledger.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #64748b)' }}>
                  No transaction ledger records found.
                </td>
              </tr>
            ) : (
              ledger.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#94a3b8' }}>
                    #{tx.id}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{tx.userName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>TG ID: {tx.userTgId}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: tx.type.includes('REWARD') || tx.type.includes('REFUND') ? 'rgba(16, 185, 129, 0.12)' : (tx.type.includes('WITHDRAWAL') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
                      color: tx.type.includes('REWARD') || tx.type.includes('REFUND') ? '#10b981' : (tx.type.includes('WITHDRAWAL') ? '#ef4444' : '#f59e0b')
                    }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 800, color: tx.amount > 0 ? '#10b981' : '#ef4444' }}>
                    {tx.amount > 0 ? '+' : ''}{parseFloat(tx.amount).toLocaleString()} 🪙
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.8rem' }}>
                    {tx.description || tx.reference_id}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                    {new Date(tx.created_at).toLocaleString()}
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
