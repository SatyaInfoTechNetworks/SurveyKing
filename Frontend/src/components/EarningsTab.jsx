import React, { useState } from 'react';
import { Wallet, Coins, ArrowUpRight, ArrowDownLeft, Send } from 'lucide-react';

export default function EarningsTab({ user, transactions, onRequestWithdrawal }) {
  const [showModal, setShowModal] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [coinAmount, setCoinAmount] = useState('5000');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const coins = user?.balance ?? 12550;
  const rupees = (coins / 100).toFixed(2);
  const withdrawRupees = ((parseFloat(coinAmount) || 0) / 100).toFixed(2);

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    try {
      const res = await onRequestWithdrawal(coinAmount, upiId);
      if (res?.success) {
        setMsg({ type: 'success', text: res.message || 'Withdrawal requested successfully!' });
        setTimeout(() => {
          setShowModal(false);
          setMsg(null);
          setUpiId('');
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
    <div style={{ padding: '16px' }}>
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={24} color="var(--accent-gold)" />
          <span>My Earnings & Payouts</span>
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Track coin earnings, transaction history, and UPI withdrawals.
        </p>
      </div>

      {/* Main Balance Card */}
      <div className="glass-card balance-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVAILABLE COIN BALANCE</span>
          <span className="badge badge-green">Rate: 1,000 🪙 = ₹10</span>
        </div>

        <div className="balance-amount">
          <Coins size={36} color="var(--accent-gold)" />
          <span>{coins.toLocaleString()}</span>
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600, marginLeft: '4px' }}>Coins</span>
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--accent-green)', fontWeight: 700, marginBottom: '14px' }}>
          ≈ ₹{rupees} INR Payout Value
        </div>

        <button 
          className="btn-primary" 
          onClick={() => setShowModal(true)}
        >
          <Send size={16} />
          <span>Request UPI Withdrawal</span>
        </button>
      </div>

      {/* Breakdown Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>
            +{user?.stats?.todayEarnings ? user.stats.todayEarnings.toLocaleString() : '8,000'} 🪙
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This Week</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>
            {user?.stats?.weekEarnings ? user.stats.weekEarnings.toLocaleString() : '12,550'} 🪙
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Surveys</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {user?.stats?.surveysCompleted || 7} Completed
          </div>
        </div>
      </div>

      {/* Wallet Transactions List */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Recent Wallet History</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 50</span>
        </h3>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No transaction history yet. Complete your first survey to earn coins!
          </div>
        ) : (
          transactions.map((tx) => {
            const isPositive = tx.amount > 0;
            const absoluteAmt = Math.abs(tx.amount);
            return (
              <div className="tx-item" key={tx.id || Math.random()}>
                <div className="tx-info">
                  <div className={`tx-icon ${isPositive ? 'income' : 'outcome'}`}>
                    {isPositive ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{tx.description || tx.type}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Today'}
                    </div>
                  </div>
                </div>

                <div className={`tx-amount ${isPositive ? 'positive' : 'negative'}`}>
                  {isPositive ? '+' : '-'}{absoluteAmt.toLocaleString()} 🪙
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    ≈ ₹{(absoluteAmt / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Withdrawal Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              💸 Request UPI Payout
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '14px' }}>
              Conversion Rate: 1,000 Coins = ₹10.00 INR (Min 5,000 Coins)
            </div>

            {msg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '14px',
                fontSize: '0.85rem',
                background: msg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: msg.type === 'success' ? 'var(--accent-green)' : '#ef4444',
                border: `1px solid ${msg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit}>
              <div className="input-group">
                <label className="input-label">UPI VPA Address</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. username@paytm or mobilenumber@ybl"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Amount in Coins (🪙)</label>
                <input
                  type="number"
                  min="5000"
                  max={coins}
                  step="500"
                  className="input-field"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  required
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', marginTop: '6px', fontWeight: 700 }}>
                  You will receive: ₹{withdrawRupees} INR in your UPI account
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>

                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Payout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
