import React, { useState, useEffect } from 'react';
import { Home, Target, Wallet, User, Crown, Shield } from 'lucide-react';
import HomeTab from './components/HomeTab';
import SurveysTab from './components/SurveysTab';
import EarningsTab from './components/EarningsTab';
import ProfileTab from './components/ProfileTab';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [activeParticipation, setActiveParticipation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Telegram WebApp & Authenticate
  useEffect(() => {
    let tgUser = { id: 123456789, first_name: 'Survey', last_name: 'King', username: 'surveyking_dev' };
    let startParam = null;

    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        tgUser = tg.initDataUnsafe.user;
      }
      if (tg.initDataUnsafe?.start_param) {
        startParam = tg.initDataUnsafe.start_param;
      }
    }

    authenticateUser(tgUser, startParam);
  }, []);

  const authenticateUser = async (tgUser, referralCode) => {
    try {
      const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Survey User';
      const payload = {
        telegramUserId: String(tgUser.id),
        name,
        username: tgUser.username || 'user',
        referralCode
      };

      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        loadUserData(data.user.telegramUserId);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      // Fallback dev user
      setUser({
        id: 1,
        telegramUserId: '123456789',
        name: 'Demo King User',
        username: 'demoking',
        balance: 12550,
        referralCode: 'SK99887',
        stats: { surveysCompleted: 7, todayEarnings: 8000, weekEarnings: 12550 }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (tgUserId) => {
    try {
      // 1. Fetch Surveys
      const sRes = await fetch('/api/telegram/surveys');
      const sData = await sRes.json();
      if (sData.success) setSurveys(sData.surveys);

      // 2. Fetch User Me
      const uRes = await fetch(`/api/telegram/me?telegramUserId=${tgUserId}`);
      const uData = await uRes.json();
      if (uData.success) setUser(uData.user);

      // 3. Fetch Transactions
      const tRes = await fetch(`/api/telegram/transactions?telegramUserId=${tgUserId}`);
      const tData = await tRes.json();
      if (tData.success) setTransactions(tData.transactions);

      // 4. Fetch Referrals
      const rRes = await fetch(`/api/telegram/referrals?telegramUserId=${tgUserId}`);
      const rData = await rRes.json();
      if (rData.success) setReferrals(rData.referrals);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  // Start Survey Handler
  const handleStartSurvey = async (survey) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/telegram/surveys/${survey.surveyId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramUserId: user.telegramUserId })
      });

      const data = await res.json();
      if (data.success) {
        setActiveParticipation(data.participation);
        setActiveTab('surveys');
        // Open provider simulator window if accessible
        window.open(data.participation.providerUrl, '_blank');
      }
    } catch (err) {
      console.error('Failed to start survey:', err);
    }
  };

  // Trigger Provider Webhook Completion
  const handleCompleteWebhook = async (participationId, status = 'COMPLETED') => {
    try {
      const res = await fetch('/api/webhooks/surveys/cpx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participationId, status })
      });

      const data = await res.json();
      if (data.success) {
        if (user) {
          loadUserData(user.telegramUserId);
        }
        if (activeParticipation?.participationId === participationId) {
          setActiveParticipation(null);
        }
      }
      return data;
    } catch (err) {
      console.error('Error triggering webhook:', err);
      throw err;
    }
  };

  // Request Withdrawal Handler
  const handleRequestWithdrawal = async (amount, upiId) => {
    if (!user) return;
    const res = await fetch('/api/telegram/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramUserId: user.telegramUserId,
        amount,
        upiId
      })
    });

    const data = await res.json();
    if (data.success) {
      loadUserData(user.telegramUserId);
    }
    return data;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(245, 158, 11, 0.5)'
        }}>
          <Crown size={36} color="#000" />
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>SURVEY KING 👑</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative' }}>
      {/* Admin Quick Launch Floating Button */}
      <button
        onClick={() => setShowAdmin(!showAdmin)}
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          zIndex: 150,
          background: showAdmin ? '#ef4444' : 'rgba(245, 158, 11, 0.2)',
          border: `1px solid ${showAdmin ? '#ef4444' : 'var(--accent-gold)'}`,
          color: showAdmin ? '#fff' : 'var(--accent-gold)',
          padding: '6px 12px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <Shield size={14} />
        <span>{showAdmin ? 'Close Admin' : '👑 Admin Panel'}</span>
      </button>

      {showAdmin ? (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      ) : (
        <>
          {/* Tab Screen Content */}
          {activeTab === 'home' && (
            <HomeTab
              user={user}
              surveys={surveys}
              onStartSurvey={handleStartSurvey}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'surveys' && (
            <SurveysTab
              surveys={surveys}
              onStartSurvey={handleStartSurvey}
              activeParticipation={activeParticipation}
              onCompleteWebhook={handleCompleteWebhook}
            />
          )}

          {activeTab === 'earnings' && (
            <EarningsTab
              user={user}
              transactions={transactions}
              onRequestWithdrawal={handleRequestWithdrawal}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              referrals={referrals}
              onCompleteWebhook={handleCompleteWebhook}
            />
          )}

          {/* Bottom Fixed Navigation Bar */}
          <nav className="bottom-nav">
            <button
              className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <Home size={22} />
              <span>Home</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'surveys' ? 'active' : ''}`}
              onClick={() => setActiveTab('surveys')}
            >
              <Target size={22} />
              <span>Surveys</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => setActiveTab('earnings')}
            >
              <Wallet size={22} />
              <span>Earnings</span>
            </button>

            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={22} />
              <span>Profile</span>
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
