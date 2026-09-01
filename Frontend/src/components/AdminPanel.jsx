import React, { useState, useEffect } from 'react';
import { Shield, Users, Wallet, Target, Check, X, Ban, Plus, RefreshCw, DollarSign, AlertTriangle } from 'lucide-react';

export default function AdminPanel({ onClose }) {
  const [adminTab, setAdminTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [withdrawals, setWithdrawals] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Survey Form State
  const [showAddSurvey, setShowAddSurvey] = useState(false);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    reward: '5000',
    estimatedMinutes: '6',
    provider: 'CPX Research',
    category: 'General',
    icon: '🎯'
  });

  // Balance Adjust Modal State
  const [adjustingUser, setAdjustingUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const sRes = await fetch('/api/admin/stats');
      const sData = await sRes.json();
      if (sData.success) setStats(sData.stats);

      // 2. Users
      const uRes = await fetch(`/api/admin/users?search=${encodeURIComponent(userSearch)}`);
      const uData = await uRes.json();
      if (uData.success) setUsers(uData.users);

      // 3. Withdrawals
      const wRes = await fetch('/api/admin/withdrawals');
      const wData = await wRes.json();
      if (wData.success) setWithdrawals(wData.withdrawals);

      // 4. Surveys
      const svRes = await fetch('/api/admin/surveys');
      const svData = await svRes.json();
      if (svData.success) setSurveys(svData.surveys);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(userSearch)}`);
    const data = await res.json();
    if (data.success) setUsers(data.users);
  };

  // Toggle Ban / Unban
  const handleToggleBan = async (user) => {
    const newStatus = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        notify(`User ${user.name} is now ${newStatus}`);
        loadAdminData();
      }
    } catch (err) {
      notify('Failed to update user status', 'error');
    }
  };

  // Submit Balance Adjustment
  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    if (!adjustingUser || !adjustAmount) return;

    try {
      const res = await fetch(`/api/admin/users/${adjustingUser.id}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: adjustAmount,
          description: adjustReason || 'Admin adjustment'
        })
      });
      const data = await res.json();
      if (data.success) {
        notify(`Updated balance for ${adjustingUser.name}`);
        setAdjustingUser(null);
        setAdjustAmount('');
        setAdjustReason('');
        loadAdminData();
      }
    } catch (err) {
      notify('Failed to adjust balance', 'error');
    }
  };

  // Approve / Reject Withdrawal
  const handleWithdrawalAction = async (withdrawalId, action) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        notify(data.message);
        loadAdminData();
      } else {
        notify(data.error || 'Failed to process withdrawal', 'error');
      }
    } catch (err) {
      notify('Error processing request', 'error');
    }
  };

  // Add New Survey
  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSurvey)
      });
      const data = await res.json();
      if (data.success) {
        notify(data.message);
        setShowAddSurvey(false);
        setNewSurvey({ title: '', reward: '5000', estimatedMinutes: '6', provider: 'CPX Research', category: 'General', icon: '🎯' });
        loadAdminData();
      }
    } catch (err) {
      notify('Failed to create survey', 'error');
    }
  };

  // Toggle Survey Active Status
  const handleToggleSurvey = async (survey) => {
    try {
      const res = await fetch(`/api/admin/surveys/${survey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !survey.active })
      });
      const data = await res.json();
      if (data.success) {
        notify(`Survey ${survey.surveyId} status toggled`);
        loadAdminData();
      }
    } catch (err) {
      notify('Error toggling survey', 'error');
    }
  };

  return (
    <div style={{ padding: '16px', background: '#0a0e17', minHeight: '100vh', color: '#fff' }}>
      {/* Admin Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
          }}>
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Survey King Admin 👑</h1>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Platform Management & Payout Control</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={loadAdminData}>
            <RefreshCw size={14} />
          </button>
          <button className="btn-secondary" style={{ padding: '8px 14px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }} onClick={onClose}>
            Close Admin
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          fontSize: '0.85rem',
          fontWeight: 600,
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: notification.type === 'success' ? 'var(--accent-green)' : '#ef4444',
          border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
        }}>
          {notification.msg}
        </div>
      )}

      {/* Admin Tab Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'overview', label: '📊 Overview', icon: Shield },
          { id: 'users', label: `👥 Users (${stats?.totalUsers || 0})`, icon: Users },
          { id: 'withdrawals', label: `💸 Payouts (${stats?.pendingWithdrawalsCount || 0})`, icon: Wallet },
          { id: 'surveys', label: `🎯 Surveys (${surveys.length})`, icon: Target }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setAdminTab(t.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: adminTab === t.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
              background: adminTab === t.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: adminTab === t.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL USERS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{stats?.totalUsers || 0}</div>
              <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>{stats?.bannedUsers || 0} Banned</div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PENDING PAYOUTS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>{stats?.pendingWithdrawalsCount || 0} Requests</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '4px' }}>≈ ₹{stats?.pendingWithdrawalsRupees || '0.00'}</div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL PAID OUT</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>₹{stats?.totalPaidOutRupees || '0.00'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{stats?.totalPaidOutCoins?.toLocaleString() || 0} Coins</div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SURVEYS COMPLETED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{stats?.completedSurveys || 0} 🎯</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Verified Webhooks</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {adminTab === 'users' && (
        <div>
          <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Search by Name, Username, or TG ID..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 16px' }}>
              Search
            </button>
          </form>

          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {users.map(u => (
              <div key={u.id} style={{ padding: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{u.name}</span>
                    <span className={`badge ${u.status === 'BANNED' ? '' : 'badge-green'}`} style={{ background: u.status === 'BANNED' ? 'rgba(239, 68, 68, 0.2)' : undefined, color: u.status === 'BANNED' ? '#ef4444' : undefined }}>
                      {u.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    @{u.username} • TG ID: {u.telegramUserId} • Ref: {u.referralCode}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginTop: '4px', fontWeight: 600 }}>
                    Balance: {u.balance.toLocaleString()} 🪙 (≈ ₹{u.balanceRupees}) • Surveys: {u.completedSurveysCount}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                    onClick={() => setAdjustingUser(u)}
                  >
                    🪙 Coins
                  </button>

                  <button
                    className="btn-secondary"
                    style={{
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      background: u.status === 'BANNED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: u.status === 'BANNED' ? 'var(--accent-green)' : '#ef4444'
                    }}
                    onClick={() => handleToggleBan(u)}
                  >
                    {u.status === 'BANNED' ? 'Unban' : 'Ban'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WITHDRAWALS APPROVAL QUEUE */}
      {adminTab === 'withdrawals' && (
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>UPI Payout Requests Queue</h2>

          {withdrawals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No pending or processed withdrawal requests found.
            </div>
          ) : (
            withdrawals.map(w => (
              <div key={w.id} style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                padding: '16px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>{w.userName}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>@{w.userUsername}</span>
                  </div>

                  <span className={`badge ${w.status === 'APPROVED' ? 'badge-green' : ''}`} style={{
                    background: w.status === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' : w.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : undefined,
                    color: w.status === 'PENDING' ? 'var(--accent-gold)' : w.status === 'REJECTED' ? '#ef4444' : undefined
                  }}>
                    {w.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '10px 0' }}>
                  <div>
                    UPI ID: <strong style={{ color: '#fff' }}>{w.upiId}</strong>
                  </div>
                  <div>
                    Payout Value: <strong style={{ color: 'var(--accent-green)' }}>₹{w.rupeeValue} INR</strong> ({w.amountCoins.toLocaleString()} 🪙)
                  </div>
                </div>

                {w.status === 'PENDING' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                    <button
                      className="btn-primary"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', fontSize: '0.85rem', padding: '10px' }}
                      onClick={() => handleWithdrawalAction(w.id, 'APPROVE')}
                    >
                      <Check size={16} /> Approve & Mark Paid
                    </button>

                    <button
                      className="btn-secondary"
                      style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)', fontSize: '0.85rem', padding: '10px' }}
                      onClick={() => handleWithdrawalAction(w.id, 'REJECT')}
                    >
                      <X size={16} /> Reject & Refund Coins
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: SURVEY MANAGER */}
      {adminTab === 'surveys' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Survey Catalog Manager</h2>
            <button className="btn-primary" style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }} onClick={() => setShowAddSurvey(true)}>
              <Plus size={16} /> Add New Survey
            </button>
          </div>

          {surveys.map(s => (
            <div key={s.id} className="survey-card">
              <div className="survey-header">
                <div className="survey-icon-title">
                  <div className="survey-icon">{s.icon || '🎯'}</div>
                  <div>
                    <div className="survey-title">{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {s.surveyId} • Provider: {s.provider}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="survey-reward">+{s.reward.toLocaleString()} 🪙</div>
                  <button
                    style={{ background: 'none', border: 'none', color: s.active ? 'var(--accent-green)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
                    onClick={() => handleToggleSurvey(s)}
                  >
                    {s.active ? '● Active' : '○ Inactive'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Adjust User Balance */}
      {adjustingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              🪙 Adjust Coins for {adjustingUser.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Current Balance: {adjustingUser.balance.toLocaleString()} Coins (≈ ₹{adjustingUser.balanceRupees})
            </p>

            <form onSubmit={handleBalanceSubmit}>
              <div className="input-group">
                <label className="input-label">Coins to Add (+) or Deduct (-)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 5000 or -2000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Reason / Description</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Compensation bonus or correction"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setAdjustingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Survey */}
      {showAddSurvey && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
              🎯 Add New Custom Survey
            </h2>

            <form onSubmit={handleCreateSurvey}>
              <div className="input-group">
                <label className="input-label">Survey Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. E-Commerce Shopping Habits"
                  value={newSurvey.title}
                  onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Reward in Coins (1,000 Coins = ₹10)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 5000"
                  value={newSurvey.reward}
                  onChange={(e) => setNewSurvey({ ...newSurvey, reward: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Estimated Minutes</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="e.g. 6"
                  value={newSurvey.estimatedMinutes}
                  onChange={(e) => setNewSurvey({ ...newSurvey, estimatedMinutes: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Provider</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="CPX Research / BitLabs / Google"
                  value={newSurvey.provider}
                  onChange={(e) => setNewSurvey({ ...newSurvey, provider: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddSurvey(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
