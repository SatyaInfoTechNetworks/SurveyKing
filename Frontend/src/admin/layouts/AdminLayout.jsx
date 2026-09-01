import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Admin Pages
import DashboardPage from '../pages/Dashboard';
import UsersPage from '../pages/Users';
import SurveysPage from '../pages/Surveys';
import PostbacksPage from '../pages/Postbacks';
import WalletPage from '../pages/Wallet';
import WithdrawalsPage from '../pages/Withdrawals';
import ReferralsPage from '../pages/Referrals';
import TelegramPage from '../pages/Telegram';
import FraudPage from '../pages/Fraud';
import AnalyticsPage from '../pages/Analytics';
import SettingsPage from '../pages/Settings';
import AuditLogsPage from '../pages/AuditLogs';

// Drawers & Modals
import UserDrawer from '../components/UserDrawer';
import PostbackDrawer from '../components/PostbackDrawer';
import SurveyModal from '../components/SurveyModal';

export default function AdminLayout({ onExitAdmin }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');

  // Module Data States
  const [stats, setStats] = useState(null);
  const [liveActivity, setLiveActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('ALL');

  const [liveSurveys, setLiveSurveys] = useState([]);
  const [customSurveys, setCustomSurveys] = useState([]);
  const [surveyAttempts, setSurveyAttempts] = useState([]);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState(null);
  const [surveyModalLoading, setSurveyModalLoading] = useState(false);

  const [postbacks, setPostbacks] = useState([]);
  const [postbackStats, setPostbackStats] = useState(null);
  const [selectedPostback, setSelectedPostback] = useState(null);
  const [postbackFilter, setPostbackFilter] = useState('ALL');
  const [postbackSearch, setPostbackSearch] = useState('');
  const [retryLoading, setRetryLoading] = useState(false);

  const [walletLedger, setWalletLedger] = useState([]);
  const [walletTypeFilter, setWalletTypeFilter] = useState('ALL');

  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState('PENDING');
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState(null);

  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [referralSettings, setReferralSettings] = useState(null);
  const [savingReferralSettings, setSavingReferralSettings] = useState(false);

  const [telegramStatus, setTelegramStatus] = useState(null);
  const [telegramNotifications, setTelegramNotifications] = useState([]);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const [fraudStats, setFraudStats] = useState(null);
  const [fraudFlags, setFraudFlags] = useState([]);

  const [analytics, setAnalytics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    loadAllData();
  }, [activeTab, userFilter, userSearch, postbackFilter, postbackSearch, walletTypeFilter, withdrawalFilter]);

  const showNotification = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await fetch('/api/admin/dashboard');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setLiveActivity(data.liveActivity || []);
        }
      } else if (activeTab === 'users') {
        const res = await fetch(`/api/admin/users?filter=${userFilter}&search=${encodeURIComponent(userSearch)}`);
        const data = await res.json();
        if (data.success) setUsers(data.users || []);
      } else if (activeTab === 'surveys') {
        const [lRes, cRes, aRes] = await Promise.all([
          fetch('/api/admin/surveys/live'),
          fetch('/api/admin/surveys/custom'),
          fetch('/api/admin/surveys/attempts')
        ]);
        const [lData, cData, aData] = await Promise.all([lRes.json(), cRes.json(), aRes.json()]);
        if (lData.success) setLiveSurveys(lData.surveys || []);
        if (cData.success) setCustomSurveys(cData.surveys || []);
        if (aData.success) setSurveyAttempts(aData.attempts || []);
      } else if (activeTab === 'postbacks') {
        const res = await fetch(`/api/admin/postbacks?filter=${postbackFilter}&search=${encodeURIComponent(postbackSearch)}`);
        const data = await res.json();
        if (data.success) {
          setPostbacks(data.postbacks || []);
          setPostbackStats(data.stats || null);
        }
      } else if (activeTab === 'wallet') {
        const res = await fetch(`/api/admin/wallet/ledger?type=${walletTypeFilter}`);
        const data = await res.json();
        if (data.success) setWalletLedger(data.ledger || []);
      } else if (activeTab === 'withdrawals') {
        const res = await fetch(`/api/admin/withdrawals?status=${withdrawalFilter}`);
        const data = await res.json();
        if (data.success) setWithdrawals(data.withdrawals || []);
      } else if (activeTab === 'referrals') {
        const [rRes, sRes] = await Promise.all([
          fetch('/api/admin/referrals/list'),
          fetch('/api/admin/referral-settings')
        ]);
        const [rData, sData] = await Promise.all([rRes.json(), sRes.json()]);
        if (rData.success) {
          setReferrals(rData.referrals || []);
          setReferralStats(rData.stats || null);
        }
        if (sData.success) setReferralSettings(sData.settings || null);
      } else if (activeTab === 'telegram') {
        const res = await fetch('/api/admin/telegram/status');
        const data = await res.json();
        if (data.success) {
          setTelegramStatus(data.bot || null);
          setTelegramNotifications(data.notifications || []);
        }
      } else if (activeTab === 'fraud') {
        const res = await fetch('/api/admin/fraud');
        const data = await res.json();
        if (data.success) {
          setFraudStats(data.stats || null);
          setFraudFlags(data.flags || []);
        }
      } else if (activeTab === 'analytics') {
        const res = await fetch('/api/admin/analytics');
        const data = await res.json();
        if (data.success) setAnalytics(data);
      } else if (activeTab === 'settings') {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success) setSettings(data);
      } else if (activeTab === 'audit') {
        const res = await fetch('/api/admin/audit-logs');
        const data = await res.json();
        if (data.success) setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleSelectUser = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/details`);
      const data = await res.json();
      if (data.success) setSelectedUser(data.user);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdjustBalance = async (userId, amount, reason) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        handleSelectUser(userId);
        loadAllData();
      } else {
        alert(data.error || 'Failed to adjust balance');
      }
    } catch (e) {
      alert('Error updating balance');
    }
  };

  const handleToggleUserStatus = async (userId, status, reason) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        handleSelectUser(userId);
        loadAllData();
      }
    } catch (e) {
      alert('Error updating user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        setSelectedUser(null);
        loadAllData();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (e) {
      alert('Error deleting user');
    }
  };

  // Survey Actions
  const handleSaveSurvey = async (surveyPayload) => {
    setSurveyModalLoading(true);
    try {
      const isEdit = !!editingSurvey;
      const url = isEdit ? `/api/admin/surveys/custom/${editingSurvey.id}` : '/api/admin/surveys/custom';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyPayload)
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        setShowSurveyModal(false);
        setEditingSurvey(null);
        loadAllData();
      } else {
        alert(data.error || 'Failed to save survey');
      }
    } catch (e) {
      alert('Error saving survey');
    } finally {
      setSurveyModalLoading(false);
    }
  };

  const handleDeleteSurvey = async (surveyDbId) => {
    if (!window.confirm('Are you sure you want to delete this custom survey?')) return;
    try {
      const res = await fetch(`/api/admin/surveys/custom/${surveyDbId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadAllData();
      }
    } catch (e) {
      alert('Error deleting survey');
    }
  };

  // Postback Actions
  const handleSelectPostback = async (postbackId) => {
    try {
      const res = await fetch(`/api/admin/postbacks/${postbackId}`);
      const data = await res.json();
      if (data.success) setSelectedPostback(data.postback);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetryPostback = async (postbackId) => {
    setRetryLoading(true);
    try {
      const res = await fetch(`/api/admin/postbacks/${postbackId}/retry`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        handleSelectPostback(postbackId);
        loadAllData();
      } else {
        alert(data.error || 'Retry failed');
      }
    } catch (e) {
      alert('Error retrying postback');
    } finally {
      setRetryLoading(false);
    }
  };

  // Withdrawal Actions
  const handleProcessWithdrawal = async (withdrawalId, action, note = '') => {
    setProcessingWithdrawalId(withdrawalId);
    try {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, note })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadAllData();
      } else {
        alert(data.error || 'Failed to process withdrawal');
      }
    } catch (e) {
      alert('Error processing withdrawal');
    } finally {
      setProcessingWithdrawalId(null);
    }
  };

  // Referral Settings Action
  const handleSaveReferralSettings = async (newSettings) => {
    setSavingReferralSettings(true);
    try {
      const res = await fetch('/api/admin/referral-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadAllData();
      }
    } catch (e) {
      alert('Error saving referral rules');
    } finally {
      setSavingReferralSettings(false);
    }
  };

  // Telegram Broadcast
  const handleSendBroadcast = async (payload) => {
    setBroadcastLoading(true);
    try {
      const res = await fetch('/api/admin/telegram/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadAllData();
      } else {
        alert(data.error || 'Failed to send broadcast');
      }
    } catch (e) {
      alert('Error sending broadcast');
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Payout Method CRUD
  const handleSavePayoutMethod = async (methodId, active, tiers) => {
    try {
      const res = await fetch(`/api/admin/payout-methods/${methodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active, tiers })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadAllData();
      }
    } catch (e) {
      alert('Error updating payout method');
    }
  };

  const handleCreatePayoutMethod = async (payload) => {
    try {
      const res = await fetch('/api/admin/payout-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadAllData();
      } else {
        alert(data.error || 'Failed to create payout method');
      }
    } catch (e) {
      alert('Error creating payout method');
    }
  };

  const handleDeletePayoutMethod = async (methodId) => {
    try {
      const res = await fetch(`/api/admin/payout-methods/${methodId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        loadAllData();
      } else {
        alert(data.error || 'Failed to delete payout method');
      }
    } catch (e) {
      alert('Error deleting payout method');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e17', color: '#fff' }}>
      {/* Toast Notification */}
      {msg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 500,
          background: msg.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '0.85rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        onExitAdmin={onExitAdmin}
        pendingCount={stats?.pendingWithdrawals || 0}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          onRefresh={loadAllData}
          loading={loading}
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
          onExitAdmin={onExitAdmin}
        />

        <main style={{ flex: 1, padding: '24px 32px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              liveActivity={liveActivity}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'users' && (
            <UsersPage
              users={users}
              onSelectUser={handleSelectUser}
              onRefresh={loadAllData}
              onDeleteUser={handleDeleteUser}
              search={userSearch}
              setSearch={setUserSearch}
              filter={userFilter}
              setFilter={setUserFilter}
            />
          )}

          {activeTab === 'surveys' && (
            <SurveysPage
              liveSurveys={liveSurveys}
              customSurveys={customSurveys}
              attempts={surveyAttempts}
              onCreateSurvey={() => { setEditingSurvey(null); setShowSurveyModal(true); }}
              onEditSurvey={(survey) => { setEditingSurvey(survey); setShowSurveyModal(true); }}
              onDeleteSurvey={handleDeleteSurvey}
            />
          )}

          {activeTab === 'postbacks' && (
            <PostbacksPage
              postbacks={postbacks}
              stats={postbackStats}
              onSelectPostback={handleSelectPostback}
              filter={postbackFilter}
              setFilter={setPostbackFilter}
              search={postbackSearch}
              setSearch={setPostbackSearch}
              onRefresh={loadAllData}
              retryLoading={retryLoading}
            />
          )}

          {activeTab === 'wallet' && (
            <WalletPage
              ledger={walletLedger}
              typeFilter={walletTypeFilter}
              setTypeFilter={setWalletTypeFilter}
            />
          )}

          {activeTab === 'withdrawals' && (
            <WithdrawalsPage
              withdrawals={withdrawals}
              onProcessWithdrawal={handleProcessWithdrawal}
              statusFilter={withdrawalFilter}
              setStatusFilter={setWithdrawalFilter}
              processingId={processingWithdrawalId}
            />
          )}

          {activeTab === 'referrals' && (
            <ReferralsPage
              referrals={referrals}
              stats={referralStats}
              settings={referralSettings}
              onSaveSettings={handleSaveReferralSettings}
              savingSettings={savingReferralSettings}
            />
          )}

          {activeTab === 'telegram' && (
            <TelegramPage
              botStatus={telegramStatus}
              notifications={telegramNotifications}
              onSendBroadcast={handleSendBroadcast}
              broadcastLoading={broadcastLoading}
            />
          )}

          {activeTab === 'fraud' && (
            <FraudPage
              stats={fraudStats}
              flags={fraudFlags}
              onSelectUser={handleSelectUser}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage analytics={analytics} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              settings={settings}
              onSavePayoutMethod={handleSavePayoutMethod}
              onCreatePayoutMethod={handleCreatePayoutMethod}
              onDeletePayoutMethod={handleDeletePayoutMethod}
              onSaveReferralSettings={handleSaveReferralSettings}
              savingReferral={savingReferralSettings}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogsPage logs={auditLogs} />
          )}
        </main>
      </div>

      {/* Drawers & Modals */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRefresh={loadAllData}
          onAdjustBalance={handleAdjustBalance}
          onToggleStatus={handleToggleUserStatus}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {selectedPostback && (
        <PostbackDrawer
          postback={selectedPostback}
          onClose={() => setSelectedPostback(null)}
          onRetry={handleRetryPostback}
          retryLoading={retryLoading}
        />
      )}

      {showSurveyModal && (
        <SurveyModal
          survey={editingSurvey}
          onClose={() => { setShowSurveyModal(false); setEditingSurvey(null); }}
          onSave={handleSaveSurvey}
          loading={surveyModalLoading}
        />
      )}
    </div>
  );
}
