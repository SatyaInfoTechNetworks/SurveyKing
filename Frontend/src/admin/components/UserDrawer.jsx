import React, { useState } from 'react';
import { X, Shield, Wallet, Target, Share2, ShieldAlert, CheckCircle, XCircle, Plus, Minus, ArrowRight, UserCheck, Ban, Trash2 } from 'lucide-react';

export default function UserDrawer({ user, onClose, onRefresh, onAdjustBalance, onToggleStatus, onDeleteUser }) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [coinAdjustment, setCoinAdjustment] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleBalanceSubmit = async (type) => {
    const amount = parseFloat(coinAdjustment);
    if (!amount || isNaN(amount)) return alert('Please enter a valid coin amount');
    const finalAmount = type === 'DEBIT' ? -Math.abs(amount) : Math.abs(amount);

    setLoading(true);
    await onAdjustBalance(user.id, finalAmount, adjustReason || `Manual ${type} by Super Admin`);
    setCoinAdjustment('');
    setAdjustReason('');
    setLoading(false);
  };

  const handleStatusSubmit = async () => {
    const nextStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    setLoading(true);
    await onToggleStatus(user.id, nextStatus, banReason || `Status changed to ${nextStatus}`);
    setBanReason('');
    setLoading(false);
  };

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
        width: '600px',
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
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.1rem',
              color: '#000'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{user.name || 'Anonymous User'}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
                TG ID: <strong style={{ color: '#fff' }}>{user.telegramUserId}</strong> • {user.username || '@user'}
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

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '0 24px',
          gap: '16px',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          {[
            { id: 'overview', label: '👤 Profile & Actions' },
            { id: 'wallet', label: '💰 Wallet Ledger' },
            { id: 'surveys', label: '🎯 Surveys' },
            { id: 'referrals', label: '👥 Referrals' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 4px',
                color: activeSubTab === tab.id ? '#f59e0b' : 'var(--text-muted, #64748b)',
                fontWeight: activeSubTab === tab.id ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                borderBottom: activeSubTab === tab.id ? '2px solid #f59e0b' : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeSubTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quick Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Current Balance</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                    {user.wallet?.balance?.toLocaleString() || '0'} 🪙
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#10b981' }}>≈ ₹{user.wallet?.rupees || '0.00'}</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Surveys Completed</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                    {user.surveys?.completed || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>Started: {user.surveys?.started || 0}</div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Referrals Qualified</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
                    {user.referrals?.qualified || 0}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>Invited: {user.referrals?.invited || 0}</div>
                </div>
              </div>

              {/* Full User Metadata Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>📋 Account Identification & Referral Details</span>
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontFamily: 'monospace', background: 'rgba(245, 158, 11, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                    User #{user.id}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem' }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.72rem', marginBottom: '2px' }}>Personal Referral Code</div>
                    <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.95rem', fontFamily: 'monospace', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{user.referralCode || 'N/A'}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.72rem', marginBottom: '2px' }}>Referred By (Inviter)</div>
                    <div style={{ fontWeight: 700, color: user.referredBy ? '#60a5fa' : '#94a3b8', fontSize: '0.85rem' }}>
                      {user.referredBy ? `Invited by ${user.referredBy}` : 'DIRECT (Organic Join)'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.72rem', marginBottom: '2px' }}>Joined Date & Time</div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.78rem' }}>
                      {user.joinedAt ? new Date(user.joinedAt).toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.72rem', marginBottom: '2px' }}>Lifetime Earnings</div>
                    <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.85rem' }}>
                      +{parseFloat(user.wallet?.totalEarned || 0).toLocaleString()} 🪙 (₹{((user.wallet?.totalEarned || 0) / 100).toFixed(2)})
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Risk Banner */}
              <div style={{
                padding: '14px',
                borderRadius: '10px',
                background: user.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: user.status === 'ACTIVE' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Account Status</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: user.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
                    {user.status}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Risk Evaluation</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: user.risk?.level === 'HIGH' ? '#ef4444' : (user.risk?.level === 'MEDIUM' ? '#f59e0b' : '#10b981') }}>
                    {user.risk?.level || 'LOW'} RISK
                  </div>
                </div>
              </div>

              {/* Action 1: Manual Balance Adjustment */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  🪙 Manual Balance Adjustment (Audit Logged)
                </div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="number"
                    placeholder="Coins Amount (e.g. 5000)"
                    value={coinAdjustment}
                    onChange={(e) => setCoinAdjustment(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Reason / Note"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    style={{
                      flex: 1.5,
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleBalanceSubmit('CREDIT')}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '8px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={14} /> Credit Coins
                  </button>
                  <button
                    onClick={() => handleBalanceSubmit('DEBIT')}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      padding: '8px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Minus size={14} /> Debit Coins
                  </button>
                </div>
              </div>

              {/* Action 2: Ban / Unban Control */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                  🛡️ Security & Account Enforcement
                </div>
                <input
                  type="text"
                  placeholder="Reason for ban / unban..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    marginBottom: '10px'
                  }}
                />
                <button
                  onClick={handleStatusSubmit}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: user.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                    border: 'none',
                    color: '#fff',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {user.status === 'ACTIVE' ? <Ban size={16} /> : <UserCheck size={16} />}
                  <span>{user.status === 'ACTIVE' ? 'Ban User from Survey King' : 'Unban & Reactivate User'}</span>
                </button>
              </div>

              {/* Action 3: Permanent User Deletion */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ef4444', marginBottom: '6px' }}>
                  🗑️ Danger Zone: Permanent Account Deletion
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '12px' }}>
                  Permanently purges this user, their wallet ledger, withdrawals, and survey participation history. This action cannot be undone.
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`⚠️ DANGER: Are you sure you want to PERMANENTLY DELETE user "${user.name}" (TG ID: ${user.telegramUserId})?\n\nAll balances, survey records, referrals, and transactions will be purged.`)) {
                      onDeleteUser(user.id);
                    }
                  }}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#ef4444',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Trash2 size={16} />
                  <span>Permanently Delete User Account</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'wallet' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                Wallet Transactions ({user.transactions?.length || 0})
              </div>
              {(!user.transactions || user.transactions.length === 0) ? (
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.82rem', textAlign: 'center', padding: '30px' }}>
                  No transaction records found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {user.transactions.map((tx) => (
                    <div key={tx.id} style={{
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{tx.type}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>{tx.description || tx.reference_id}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: tx.amount > 0 ? '#10b981' : '#ef4444' }}>
                          {tx.amount > 0 ? '+' : ''}{parseFloat(tx.amount).toLocaleString()} 🪙
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #64748b)' }}>
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'surveys' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                Survey Participations ({user.participations?.length || 0})
              </div>
              {(!user.participations || user.participations.length === 0) ? (
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.82rem', textAlign: 'center', padding: '30px' }}>
                  No survey attempts logged yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {user.participations.map((sp) => (
                    <div key={sp.id} style={{
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{sp.survey_id} ({sp.provider})</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>ID: {sp.participation_id}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: sp.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: sp.status === 'COMPLETED' ? '#10b981' : '#ef4444'
                        }}>
                          {sp.status}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, marginTop: '4px' }}>
                          +{parseFloat(sp.reward).toLocaleString()} 🪙
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'referrals' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                Invited Referrals ({user.referralList?.length || 0})
              </div>
              {(!user.referralList || user.referralList.length === 0) ? (
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.82rem', textAlign: 'center', padding: '30px' }}>
                  No referrals invited yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {user.referralList.map((ref) => (
                    <div key={ref.id} style={{
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>{ref.referredName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>TG ID: {ref.referredTgId}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: ref.status === 'QUALIFIED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: ref.status === 'QUALIFIED' ? '#10b981' : '#f59e0b'
                        }}>
                          {ref.status}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>
                          +{parseFloat(ref.reward_amount).toLocaleString()} 🪙
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
