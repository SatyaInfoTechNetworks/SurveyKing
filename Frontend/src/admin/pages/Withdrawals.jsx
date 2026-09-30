import React, { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, AlertCircle, Search, RefreshCw, Send, ArrowRight, Gift, Mail, Copy, Check } from 'lucide-react';

export default function WithdrawalsPage({ withdrawals, onProcessWithdrawal, statusFilter, setStatusFilter, processingId }) {
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Approval Modal State (specifically for Gift Cards like Amazon, or standard UPI)
  const [approveModalData, setApproveModalData] = useState(null);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [approveNote, setApproveNote] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleOpenApproveModal = (w) => {
    const isGiftCard = String(w.method || '').toUpperCase().includes('AMAZON') ||
                       String(w.method || '').toUpperCase().includes('GIFT') ||
                       String(w.method || '').toUpperCase().includes('GOOGLE_PLAY');

    const defaultEmail = (w.upiId && w.upiId.includes('@')) ? w.upiId.trim() : '';

    setApproveModalData({
      withdrawal: w,
      isGiftCard,
      amountRupees: w.rupeeValue,
      coins: w.amountCoins
    });
    setGiftCardCode('');
    setRecipientEmail(defaultEmail);
    setApproveNote('');
  };

  const handleApproveConfirm = (e) => {
    e?.preventDefault();
    if (!approveModalData) return;
    const { withdrawal, isGiftCard } = approveModalData;

    if (isGiftCard && !giftCardCode.trim()) {
      alert('Please enter the Gift Card voucher code to approve this payout and email it to the user.');
      return;
    }

    if (isGiftCard && (!recipientEmail.trim() || !recipientEmail.includes('@'))) {
      alert('Please enter a valid recipient email address so the redeem code can be delivered via Zoho SMTP.');
      return;
    }

    onProcessWithdrawal(
      withdrawal.id,
      'APPROVE',
      approveNote || (isGiftCard ? `Amazon Gift Card Code: ${giftCardCode.trim()}` : ''),
      {
        giftCardCode: giftCardCode.trim(),
        recipientEmail: recipientEmail.trim()
      }
    );

    setApproveModalData(null);
  };

  const handleRejectConfirm = () => {
    if (!rejectModalId) return;
    onProcessWithdrawal(rejectModalId, 'REJECT', rejectReason || 'Invalid payout destination or policy violation');
    setRejectModalId(null);
    setRejectReason('');
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💸 Withdrawal Queue & Gift Card Delivery Engine</span>
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Approve UPI, Amazon Pay Gift Cards, and other vouchers. When approving Amazon withdrawals, provide the redeem code to instantly dispatch a branded email to the user via Zoho SMTP!
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
              withdrawals.map((w) => {
                const isAmazon = String(w.method || '').toUpperCase().includes('AMAZON');
                return (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontWeight: 800,
                          color: isAmazon ? '#f59e0b' : '#38bdf8',
                          background: isAmazon ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {isAmazon ? '🎁 AMAZON' : w.method}
                        </span>
                        <span style={{ fontFamily: 'monospace', color: '#fff', fontSize: '0.82rem' }}>
                          {w.upiId}
                        </span>
                      </div>

                      {/* Display Gift Card Voucher Code if approved */}
                      {w.giftCardCode && (
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            background: 'rgba(245, 158, 11, 0.18)',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            color: '#fef08a',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '0.78rem',
                            fontWeight: 800
                          }}>
                            🎁 Code: {w.giftCardCode}
                          </span>
                          <button
                            title="Copy Voucher Code"
                            onClick={() => handleCopyCode(w.id, w.giftCardCode)}
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: '4px',
                              padding: '3px 6px',
                              color: copiedId === w.id ? '#10b981' : '#f59e0b',
                              fontSize: '0.70rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            {copiedId === w.id ? <Check size={11} /> : <Copy size={11} />}
                            <span>{copiedId === w.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      )}

                      {/* Display Email Sent Badge */}
                      {w.emailSent && (
                        <div style={{ marginTop: '4px', fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} />
                          <span>Code delivered to {w.emailSentTo || w.upiId}</span>
                        </div>
                      )}
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
                            onClick={() => handleOpenApproveModal(w)}
                            disabled={processingId === w.id}
                            style={{
                              background: isAmazon ? 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.3) 100%)' : 'rgba(16, 185, 129, 0.15)',
                              border: isAmazon ? '1px solid #f59e0b' : '1px solid rgba(16, 185, 129, 0.3)',
                              color: isAmazon ? '#f59e0b' : '#10b981',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {isAmazon ? <Gift size={13} /> : <CheckCircle size={13} />}
                            <span>{isAmazon ? 'Approve & Send Code' : 'Approve'}</span>
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Approve Modal (Asks for Gift Card Voucher Code & Recipient Email) */}
      {approveModalData && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <form
            onSubmit={handleApproveConfirm}
            style={{
              width: '500px',
              maxWidth: '100%',
              background: '#0d131f',
              border: approveModalData.isGiftCard ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)'
            }}
          >
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: approveModalData.isGiftCard ? '#f59e0b' : '#10b981',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {approveModalData.isGiftCard ? <Gift size={22} /> : <CheckCircle size={22} />}
              <span>
                {approveModalData.isGiftCard
                  ? `🎁 Send Gift Card & Approve Payout #${approveModalData.withdrawal.id}`
                  : `✅ Approve Withdrawal #${approveModalData.withdrawal.id}`}
              </span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recipient User:</span>
                <strong style={{ color: '#fff' }}>{approveModalData.withdrawal.userName} (TG: {approveModalData.withdrawal.userTgId})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payout Amount:</span>
                <strong style={{ color: '#10b981' }}>₹{approveModalData.amountRupees} INR ({approveModalData.coins.toLocaleString()} Coins)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <strong style={{ color: '#f59e0b' }}>{approveModalData.withdrawal.method}</strong>
              </div>
            </div>

            {approveModalData.isGiftCard ? (
              <>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#f59e0b', marginBottom: '6px' }}>
                    ENTER GIFT CARD / VOUCHER CODE *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. AMZN-XXXX-YYYY-ZZZZ"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fef08a',
                      fontFamily: 'monospace',
                      fontSize: '1rem',
                      fontWeight: 800,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    This code will be presented in a styled gift card voucher and emailed to the user via Zoho SMTP.
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                    RECIPIENT EMAIL ADDRESS *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                    Sent from <code>StuEarn India &lt;team@satyainfotechnetworks.com&gt;</code> using Zoho SMTP (smtp.zoho.in:587).
                  </div>
                </div>
              </>
            ) : null}

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                ADMIN NOTE (OPTIONAL)
              </label>
              <input
                type="text"
                placeholder="Optional notes or instructions for the recipient"
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setApproveModalData(null)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  padding: '11px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingId === approveModalData.withdrawal.id}
                style={{
                  flex: 1.8,
                  background: approveModalData.isGiftCard
                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: approveModalData.isGiftCard ? '#000' : '#fff',
                  padding: '11px',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {approveModalData.isGiftCard ? <Gift size={16} /> : <CheckCircle size={16} />}
                <span>
                  {processingId === approveModalData.withdrawal.id
                    ? 'Processing...'
                    : (approveModalData.isGiftCard ? 'Send Gift Card & Approve' : 'Confirm Payout Approval')}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

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
              placeholder="Reason (e.g. Incorrect UPI ID / Invalid Email)"
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
                marginBottom: '16px',
                boxSizing: 'border-box'
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
