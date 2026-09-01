import React, { useState, useEffect } from 'react';
import { Shield, Users, Wallet, Target, Plus, CheckCircle, XCircle, AlertCircle, RefreshCw, X, Edit, Trash, Settings, CreditCard, Gift, Save } from 'lucide-react';

export default function AdminPanel({ onClose, onRefreshData }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [referralSettings, setReferralSettings] = useState({
    referrerRewardCoins: 1000,
    refereeRewardCoins: 500,
    referralTrigger: 'FIRST_SURVEY'
  });

  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // New Survey Form State
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyId, setSurveyId] = useState('');
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyReward, setSurveyReward] = useState('5000');
  const [surveyMinutes, setSurveyMinutes] = useState('8');
  const [surveyProvider, setSurveyProvider] = useState('CPX Research');
  const [surveyCategory, setSurveyCategory] = useState('General');
  const [surveyIcon, setSurveyIcon] = useState('🔥');

  // Edit Balance Modal State
  const [balanceModalUser, setBalanceModalUser] = useState(null);
  const [coinAdjustment, setCoinAdjustment] = useState('');

  // Referral Settings Form State
  const [savingReferral, setSavingReferral] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const stRes = await fetch('/api/admin/stats');
      const stData = await stRes.json();
      if (stData.success) setStats(stData.stats);

      // 2. Users
      const uRes = await fetch('/api/admin/users');
      const uData = await uRes.json();
      if (uData.success) setUsers(uData.users);

      // 3. Withdrawals
      const wRes = await fetch('/api/admin/withdrawals');
      const wData = await wRes.json();
      if (wData.success) setWithdrawals(wData.withdrawals);

      // 4. Surveys
      const sRes = await fetch('/api/admin/surveys');
      const sData = await sRes.json();
      if (sData.success) setSurveys(sData.surveys);

      // 5. Payout Methods
      const pmRes = await fetch('/api/admin/payout-methods');
      const pmData = await pmRes.json();
      if (pmData.success) setPayoutMethods(pmData.payoutMethods);

      // 6. Referral Settings
      const refRes = await fetch('/api/admin/referral-settings');
      const refData = await refRes.json();
      if (refData.success) setReferralSettings(refData.settings);

    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `User status changed to ${newStatus}` });
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update user status' });
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!balanceModalUser || !coinAdjustment) return;
    try {
      const res = await fetch(`/api/admin/users/${balanceModalUser.id}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(coinAdjustment), description: 'Admin Manual Coin Adjustment' })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Updated coin balance for ${balanceModalUser.name}` });
        setBalanceModalUser(null);
        setCoinAdjustment('');
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to adjust balance' });
    }
  };

  const handleProcessWithdrawal = async (withdrawalId, action) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to process withdrawal action' });
    }
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId,
          title: surveyTitle,
          reward: parseFloat(surveyReward),
          estimatedMinutes: parseInt(surveyMinutes, 10),
          provider: surveyProvider,
          category: surveyCategory,
          icon: surveyIcon
        })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Custom survey created successfully!' });
        setShowSurveyModal(false);
        setSurveyId('');
        setSurveyTitle('');
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to create survey' });
    }
  };

  const handleSaveReferralSettings = async (e) => {
    e.preventDefault();
    setSavingReferral(true);
    try {
      const res = await fetch('/api/admin/referral-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(referralSettings)
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Referral reward rules updated successfully!' });
        loadAdminData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to save referral settings' });
    } finally {
      setSavingReferral(false);
    }
  };

  const handleTogglePayoutMethod = async (methodObj) => {
    try {
      const res = await fetch(`/api/admin/payout-methods/${methodObj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !methodObj.active })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: `Payout method '${methodObj.name}' updated!` });
        loadAdminData();
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update payout method' });
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.telegram_user_id?.includes(searchUser)
  );

  return (
    <div style={{ padding: '16px', background: '#070a12', minHeight: 'calc(100vh - 60px)', color: '#fff' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '14px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={24} color="var(--accent-gold)" />
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)', margin: 0 }}>
              Survey King — Admin Control Panel 👑
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              Live system management, user banning, payouts, referral rules & tier settings
            </p>
          </div>
        </div>

        <button className="btn-secondary" style={{ width: 'auto', padding: '6px 12px' }} onClick={onClose}>
          <X size={16} />
        </button>
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

      {/* Admin Sub-Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        <button
          className={`btn-secondary ${activeTab === 'overview' ? 'active-pill' : ''}`}
          style={{ padding: '8px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '9999px' }}
          onClick={() => setActiveTab('overview')}
        >
          Overview KPIs
        </button>

        <button
          className={`btn-secondary ${activeTab === 'users' ? 'active-pill' : ''}`}
          style={{ padding: '8px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '9999px' }}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>

        <button
          className={`btn-secondary ${activeTab === 'withdrawals' ? 'active-pill' : ''}`}
          style={{ padding: '8px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '9999px' }}
          onClick={() => setActiveTab('withdrawals')}
        >
          Withdrawals Queue
        </button>

        <button
          className={`btn-secondary ${activeTab === 'referrals' ? 'active-pill' : ''}`}
          style={{ padding: '8px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '9999px' }}
          onClick={() => setActiveTab('referrals')}
        >
          Referral Rules 👥
        </button>

        <button
          className={`btn-secondary ${activeTab === 'payouts' ? 'active-pill' : ''}`}
          style={{ padding: '8px 14px', fontSize: '0.8rem', width: 'auto', borderRadius: '9999px' }}
          onClick={() => setActiveTab('payouts')}
        >
          Payout Options 💳
        </button>
      </div>

      {/* TAB 1: OVERVIEW KPIs */}
      {activeTab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL REGISTERED USERS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {stats?.totalUsers || 0}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BANNED USERS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
                {stats?.bannedUsers || 0}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PENDING WITHDRAWALS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>
                {stats?.pendingWithdrawals || 0}
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL PAID OUT (INR)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>
                ₹{stats?.totalApprovedWithdrawalsInr ? stats.totalApprovedWithdrawalsInr.toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div>
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Search user by Name, Username or Telegram ID..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            style={{ marginBottom: '14px' }}
          />

          {filteredUsers.map((u) => (
            <div key={u.id} className="glass-card" style={{ marginBottom: '10px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                    {u.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(@{u.username})</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    ID: {u.telegram_user_id} | Code: {u.referral_code}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '2px' }}>
                    Balance: {parseFloat(u.balance || 0).toLocaleString()} 🪙 (≈ ₹{(parseFloat(u.balance || 0)/100).toFixed(2)})
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <span className={`badge ${u.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                    {u.status}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.7rem', width: 'auto' }}
                      onClick={() => setBalanceModalUser(u)}
                    >
                      Coins ±
                    </button>

                    <button
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: u.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleToggleUserStatus(u.id, u.status)}
                    >
                      {u.status === 'ACTIVE' ? 'Ban 🚫' : 'Unban 🟢'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: WITHDRAWALS QUEUE */}
      {activeTab === 'withdrawals' && (
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>
            Pending & History Payout Queue
          </h3>

          {withdrawals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No withdrawal requests found.</div>
          ) : (
            withdrawals.map((w) => (
              <div key={w.id} className="glass-card" style={{ marginBottom: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>
                      {w.userName} (@{w.userUsername})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                      {w.method || 'UPI'} Payout: {parseFloat(w.amount).toLocaleString()} 🪙 (₹{w.rupeeAmount.toFixed(2)} INR)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Destination: <code style={{ color: 'var(--accent-green)' }}>{w.upiId}</code>
                    </div>
                  </div>

                  <div>
                    {w.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => handleProcessWithdrawal(w.id, 'APPROVE')}
                        >
                          Approve ✅
                        </button>
                        <button
                          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                          onClick={() => handleProcessWithdrawal(w.id, 'REJECT')}
                        >
                          Reject & Refund ❌
                        </button>
                      </div>
                    ) : (
                      <span className={`badge ${w.status === 'APPROVED' ? 'badge-green' : 'badge-red'}`}>
                        {w.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: REFERRAL RULES CONFIGURATION */}
      {activeTab === 'referrals' && (
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gift size={20} />
            <span>Referral Program Settings Engine</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Customize referral reward coins for inviter & invited friend, and trigger conditions.
          </p>

          <form onSubmit={handleSaveReferralSettings}>
            <div className="input-group">
              <label className="input-label">Referrer Reward Coins (Inviter User)</label>
              <input
                type="number"
                className="input-field"
                value={referralSettings.referrerRewardCoins}
                onChange={(e) => setReferralSettings({ ...referralSettings, referrerRewardCoins: e.target.value })}
                placeholder="1000"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Referee Reward Coins (Invited Friend)</label>
              <input
                type="number"
                className="input-field"
                value={referralSettings.refereeRewardCoins}
                onChange={(e) => setReferralSettings({ ...referralSettings, refereeRewardCoins: e.target.value })}
                placeholder="500"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Reward Trigger Condition Rule</label>
              <select
                className="input-field"
                value={referralSettings.referralTrigger}
                onChange={(e) => setReferralSettings({ ...referralSettings, referralTrigger: e.target.value })}
              >
                <option value="FIRST_SURVEY">On Completing 1st Survey (Recommended)</option>
                <option value="ON_JOIN">On Sign Up / Bot Registration (/start)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" disabled={savingReferral}>
              <Save size={16} />
              <span>{savingReferral ? 'Saving Rules...' : 'Save Referral Rules'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: PAYOUT OPTIONS & TIERS */}
      {activeTab === 'payouts' && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CreditCard size={20} />
            <span>Payout Options & Coin Tiers</span>
          </h3>

          {payoutMethods.map((m) => (
            <div key={m.id} className="glass-card" style={{ marginBottom: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {m.methodId}</div>
                  </div>
                </div>

                <button
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    border: 'none',
                    background: m.active ? '#10b981' : '#ef4444',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleTogglePayoutMethod(m)}
                >
                  {m.active ? 'Active 🟢' : 'Disabled 🔴'}
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Configured Tiers:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {m.tiers?.map((t, i) => (
                  <span key={i} className="badge badge-gold">
                    ₹{t.rupees} = {t.coins.toLocaleString()} 🪙
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BALANCE ADJUSTMENT MODAL */}
      {balanceModalUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              Adjust Coin Balance for {balanceModalUser.name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Enter positive coins to add (e.g. 5000) or negative to deduct (e.g. -2000).
            </p>

            <form onSubmit={handleAdjustBalance}>
              <div className="input-group">
                <label className="input-label">Coin Amount Adjustment</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="+5000 or -2000"
                  value={coinAdjustment}
                  onChange={(e) => setCoinAdjustment(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
                <button type="button" className="btn-secondary" onClick={() => setBalanceModalUser(null)}>
                  Cancel
                </button>

                <button type="submit" className="btn-primary">
                  Save Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
