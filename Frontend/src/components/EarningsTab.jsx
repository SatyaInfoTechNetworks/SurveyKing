import React, { useState } from 'react';
import { Wallet, Coins, ArrowUpRight, ArrowDownLeft, Send, Gift, CreditCard, Smartphone, Check, Building, X, Clock, ShieldCheck } from 'lucide-react';

export default function EarningsTab({ user, transactions = [], payoutMethods = [], onRequestWithdrawal }) {
  const [activeSubTab, setActiveSubTab] = useState('redeem'); // 'redeem' | 'history'
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [accountDetails, setAccountDetails] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const coins = user?.balance ?? 0;
  const rupees = (coins / 100).toFixed(2);

  // Fallback payout methods if none loaded yet from database
  const methods = payoutMethods?.length > 0 ? payoutMethods.filter(m => m.active) : [
    {
      id: 1,
      methodId: 'UPI',
      name: 'UPI Transfer (VPA)',
      icon: '⚡',
      placeholder: 'Enter UPI VPA (e.g. username@paytm)',
      tiers: [
        { coins: 1000, rupees: 10 },
        { coins: 2500, rupees: 25 },
        { coins: 5000, rupees: 50 },
        { coins: 10000, rupees: 100 }
      ]
    },
    {
      id: 2,
      methodId: 'BANK',
      name: 'Bank Transfer (IMPS / NEFT)',
      icon: '🏦',
      placeholder: 'Bank Account & IFSC Code',
      tiers: [
        { coins: 1000, rupees: 10 },
        { coins: 2500, rupees: 25 },
        { coins: 5000, rupees: 50 },
        { coins: 10000, rupees: 100 }
      ]
    },
    {
      id: 3,
      methodId: 'AMAZON',
      name: 'Amazon Pay Gift Card',
      icon: '🎁',
      placeholder: 'Enter Email or Mobile Number for Voucher',
      tiers: [
        { coins: 1000, rupees: 10 },
        { coins: 2500, rupees: 25 },
        { coins: 5000, rupees: 50 },
        { coins: 10000, rupees: 100 }
      ]
    },
    {
      id: 4,
      methodId: 'PAYTM',
      name: 'Paytm Wallet Cash',
      icon: '📲',
      placeholder: 'Enter Paytm Registered Mobile Number',
      tiers: [
        { coins: 1000, rupees: 10 },
        { coins: 2500, rupees: 25 },
        { coins: 5000, rupees: 50 },
        { coins: 10000, rupees: 100 }
      ]
    },
    {
      id: 5,
      methodId: 'GOOGLE_PLAY',
      name: 'Google Play Gift Code',
      icon: '🎮',
      placeholder: 'Enter Email Address for Gift Code',
      tiers: [
        { coins: 1000, rupees: 10 },
        { coins: 2500, rupees: 25 },
        { coins: 5000, rupees: 50 }
      ]
    }
  ];

  const activeMethodObj = selectedMethod || methods[0];
  const activeTiers = activeMethodObj?.tiers || [];
  const activeTierObj = selectedTier || activeTiers[0];
  const isBankMethod = activeMethodObj?.methodId === 'BANK' || activeMethodObj?.methodId === 'BANK_TRANSFER';

  const handleOpenWithdrawal = (methodPreset = null) => {
    const targetMethod = methodPreset || methods[0];
    setSelectedMethod(targetMethod);
    if (targetMethod?.tiers?.length > 0) {
      setSelectedTier(targetMethod.tiers[0]);
    }
    setMsg(null);
    setShowModal(true);
  };

  const handleMethodChange = (m) => {
    setSelectedMethod(m);
    if (m.tiers?.length > 0) {
      setSelectedTier(m.tiers[0]);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (!activeTierObj) return;

    if (coins < activeTierObj.coins) {
      setMsg({ type: 'error', text: `Insufficient coins. You need ${activeTierObj.coins.toLocaleString()} Coins for this payout tier.` });
      return;
    }

    let finalDetails = accountDetails;
    if (isBankMethod) {
      if (!bankAccountNumber.trim() || !bankIfscCode.trim()) {
        setMsg({ type: 'error', text: 'Please enter both Bank Account Number and IFSC Code.' });
        return;
      }
      finalDetails = `A/C: ${bankAccountNumber.trim()} | IFSC: ${bankIfscCode.trim().toUpperCase()}${bankHolderName.trim() ? ` | Name: ${bankHolderName.trim()}` : ''}`;
    } else {
      if (!accountDetails.trim()) {
        setMsg({ type: 'error', text: 'Please enter payout destination details.' });
        return;
      }
    }

    setSubmitting(true);
    setMsg(null);

    try {
      const res = await onRequestWithdrawal(activeTierObj.coins, finalDetails, activeMethodObj.methodId);
      if (res?.success) {
        setMsg({ type: 'success', text: res.message || 'Withdrawal requested successfully!' });
        setTimeout(() => {
          setShowModal(false);
          setMsg(null);
          setAccountDetails('');
          setBankAccountNumber('');
          setBankIfscCode('');
          setBankHolderName('');
        }, 2000);
      } else {
        setMsg({ type: 'error', text: res?.error || 'Failed to request withdrawal' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Error submitting request' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '90px' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '14px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Wallet size={22} color="var(--accent-gold)" />
          <span>Earnings & Payouts</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Redeem coin rewards directly to Bank Account, UPI, Paytm, or Gift Cards.
        </p>
      </div>

      {/* Sub-Tabs: Redeem & Balance vs. Wallet History */}
      <div style={{
        display: 'flex',
        background: 'rgba(255, 255, 255, 0.04)',
        padding: '4px',
        borderRadius: '12px',
        marginBottom: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <button
          onClick={() => setActiveSubTab('redeem')}
          style={{
            flex: 1,
            padding: '9px',
            borderRadius: '9px',
            border: 'none',
            background: activeSubTab === 'redeem' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
            color: activeSubTab === 'redeem' ? '#000' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>💸 Redeem Payout</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          style={{
            flex: 1,
            padding: '9px',
            borderRadius: '9px',
            border: 'none',
            background: activeSubTab === 'history' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
            color: activeSubTab === 'history' ? '#000' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <span>📜 Wallet History ({transactions.length})</span>
        </button>
      </div>

      {activeSubTab === 'redeem' ? (
        <>
          {/* Main Balance Card */}
          <div className="glass-card balance-card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                AVAILABLE COIN BALANCE
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>Rate: 1,000 🪙 = ₹10</span>
            </div>

            <div className="balance-amount" style={{ margin: '10px 0' }}>
              <Coins size={32} color="var(--accent-gold)" />
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>{coins.toLocaleString()}</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontWeight: 600, marginLeft: '4px' }}>Coins</span>
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--accent-green)', fontWeight: 800, marginBottom: '16px' }}>
              ≈ ₹{rupees} INR Live Value
            </div>

            <button 
              className="btn-primary" 
              onClick={() => handleOpenWithdrawal()}
              style={{ padding: '12px', fontSize: '0.95rem' }}
            >
              <Send size={17} />
              <span>Redeem Coins & Withdraw Payout</span>
            </button>
          </div>

          {/* Breakdown Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Today</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>
                +{user?.stats?.todayEarnings ? user.stats.todayEarnings.toLocaleString() : '0'} 🪙
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>This Week</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>
                {user?.stats?.weekEarnings ? user.stats.weekEarnings.toLocaleString() : '0'} 🪙
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Surveys</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {user?.stats?.surveysCompleted || 0} Done
              </div>
            </div>
          </div>

          {/* Supported Payout Gateways Cards */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={16} color="var(--accent-gold)" />
              <span>Select Payment Channel</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {methods.map((m) => (
                <div
                  key={m.methodId}
                  onClick={() => handleOpenWithdrawal(m)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.3rem'
                    }}>
                      {m.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{m.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {m.tiers?.length || 0} Redeem Tiers (From {m.tiers?.[0]?.coins?.toLocaleString() || '1,000'} 🪙)
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '7px 14px', fontSize: '0.78rem' }}
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Wallet Transactions History Sub-Tab */
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              📜 Wallet Transaction Ledger
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest {transactions.length} Events</span>
          </div>

          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No transactions recorded yet. Complete a survey or invite friends to get started!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {transactions.map((tx) => {
                const isPositive = parseFloat(tx.amount || 0) > 0;
                const absoluteAmt = Math.abs(parseFloat(tx.amount || 0));
                const formattedTime = tx.createdAt
                  ? new Date(tx.createdAt).toLocaleString([], {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })
                  : 'Just now';

                return (
                  <div
                    key={tx.id || Math.random()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isPositive ? '#10b981' : '#ef4444'
                        }}
                      >
                        {isPositive ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, wordBreak: 'break-word' }}>
                          {tx.description || tx.type}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', fontWeight: 500 }}>
                          {formattedTime}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        color: isPositive ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '3px'
                      }}>
                        <span>{isPositive ? '+' : '-'}{absoluteAmt.toLocaleString()}</span>
                        <Coins size={13} color={isPositive ? '#10b981' : '#ef4444'} />
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
                        ≈ ₹{(absoluteAmt / 100).toFixed(2)} INR
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Multi-Method Mobile-Responsive Withdrawal Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  💸 Choose Payout Method
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Select redemption channel and coin tier.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#94a3b8', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Payout Method Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
              {methods.map((m) => {
                const isSel = activeMethodObj?.methodId === m.methodId;
                return (
                  <button
                    key={m.methodId}
                    type="button"
                    onClick={() => handleMethodChange(m)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: isSel ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                      background: isSel ? 'rgba(245, 158, 11, 0.18)' : 'rgba(15, 23, 42, 0.6)',
                      color: isSel ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{m.icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Payout Tier Cards */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Select Payout Tier:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {activeTiers.map((t, idx) => {
                  const isTierSel = activeTierObj?.coins === t.coins;
                  const isAffordable = coins >= t.coins;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedTier(t)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: isTierSel ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                        background: isTierSel ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                        cursor: 'pointer',
                        opacity: isAffordable ? 1 : 0.55,
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>₹{t.rupees} INR</div>
                      <div style={{ fontSize: '0.74rem', color: isAffordable ? 'var(--accent-gold)' : '#ef4444', fontWeight: 700, marginTop: '2px' }}>
                        {t.coins.toLocaleString()} 🪙
                      </div>
                      {isTierSel && (
                        <div style={{ position: 'absolute', top: '6px', right: '6px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {msg && (
              <div style={{
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '0.82rem',
                background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: msg.type === 'success' ? 'var(--accent-green)' : '#ef4444',
                border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit}>
              {isBankMethod ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                      <span>🏦 Bank Account Number</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter Bank Account Number"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                      <span>⚡ Bank IFSC Code</span>
                      <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. SBIN0001234 / HDFC0000123"
                      value={bankIfscCode}
                      onChange={(e) => setBankIfscCode(e.target.value.toUpperCase())}
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                      required
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label" style={{ fontSize: '0.78rem' }}>
                      <span>👤 Account Holder Full Name (Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Name registered with Bank"
                      value={bankHolderName}
                      onChange={(e) => setBankHolderName(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label className="input-label" style={{ fontSize: '0.78rem' }}>{activeMethodObj?.name} Destination</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={activeMethodObj?.placeholder || 'Enter VPA / Number / Email'}
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '10px' }}>
                  Cancel
                </button>

                <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '10px' }}>
                  {submitting ? 'Submitting...' : `Redeem ₹${activeTierObj?.rupees || 0}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
