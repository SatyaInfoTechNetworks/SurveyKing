import React, { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, AlertCircle, Search, RefreshCw, Send, ArrowRight } from 'lucide-react';

export default function WithdrawalsPage({ withdrawals, onProcessWithdrawal, statusFilter, setStatusFilter, processingId }) {
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = (id) => {
    if (window.confirm(`Are you sure you want to APPROVE Withdrawal #${id}? This marks payment as sent and sends an instant Telegram notification to the user.`)) {
      onProcessWithdrawal(id, 'APPROVE');
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectModalId) return;
    onProcessWithdrawal(rejectModalId, 'REJECT', rejectReason || 'Invalid payout destination or policy violation');
    setRejectModalId(null);
    setRejectReason('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            💸 Withdrawal Approval Queue & Refund Engine
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Process UPI, Amazon, Paytm, and Google Play withdrawal requests. Approvals and Rejection refunds automatically alert the user on Telegram.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '10px'
      }}>
        {[
          { id: 'PENDING', label: `⏳ Pending Approvals (${withdrawals.filter(w => w.status === 'PENDING').length})` },
          { id: 'APPROVED', label: '✅ Approved Payouts' },
          { id: 'REJECTED', label: '❌ Rejected & Refunded' },
          { id: 'ALL', label: 'All Withdrawals' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            style={{
              background: statusFilter === tab.id ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: statusFilter === tab.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.06)',
              color: statusFilter === tab.id ? '#f59e0b' : 'var(--text-secondary, #94a3b8)',
              fontWeight: statusFilter === tab.id ? 800 : 500,
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

      {/* Withdrawals Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>ID</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>USER</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>AMOUNT (INR & COINS)</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>METHOD & DESTINATION</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>STATUS</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>REQUESTED AT</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #64748b)' }}>
                  No withdrawal requests found in this queue.
                </td>
              </tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#94a3b8' }}>
                    #{w.id}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{w.userName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>TG ID: {w.userTgId}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.92rem' }}>
                      ₹{w.rupeeValue} INR
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                      {w.amountCoins.toLocaleString()} Coins
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontWeight: 800,
                        color: '#f59e0b',
                        background: 'rgba(245, 158, 11, 0.12)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.72rem'
                      }}>
                        {w.method}
                      </span>
                      <span style={{ fontFamily: 'monospace', color: '#fff', fontSize: '0.82rem' }}>
                        {w.upiId}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      background: w.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : (w.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                      color: w.status === 'APPROVED' ? '#10b981' : (w.status === 'PENDING' ? '#f59e0b' : '#ef4444')
                    }}>
                      {w.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                    {new Date(w.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    {w.status === 'PENDING' ? (
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApprove(w.id)}
                          disabled={processingId === w.id}
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#10b981',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectModalId(w.id)}
                          disabled={processingId === w.id}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <XCircle size={13} /> Reject & Refund
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModalId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '460px',
            background: '#0d131f',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '14px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>
              ❌ Reject & Auto-Refund Withdrawal #{rejectModalId}
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '14px' }}>
              The exact coin amount will be immediately refunded to the user's wallet, and an automated Telegram alert will be sent.
            </p>

            <input
              type="text"
              placeholder="Reason (e.g. Incorrect UPI ID / Bank rejected)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#fff',
                fontSize: '0.85rem',
                marginBottom: '16px'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setRejectModalId(null)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                style={{
                  flex: 1.5,
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                Confirm Rejection & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
