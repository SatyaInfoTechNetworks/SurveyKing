import React, { useState, useEffect } from 'react';
import { Home, Target, Wallet, User, Crown, Shield, Globe, Smartphone } from 'lucide-react';
import HomeTab from './components/HomeTab';
import SurveysTab from './components/SurveysTab';
import EarningsTab from './components/EarningsTab';
import ProfileTab from './components/ProfileTab';
import AdminLayout from './admin/layouts/AdminLayout';
import LandingPage from './components/LandingPage';

export default function App() {
  const [viewMode, setViewMode] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/admin') || path === '/app' || path === '/miniapp' || path.startsWith('/app/') || path.startsWith('/miniapp/') || window.Telegram?.WebApp?.initData) {
      return 'app';
    }
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState('home');
  const [showAdmin, setShowAdmin] = useState(() => {
    return window.location.pathname.toLowerCase().includes('/admin');
  });
  const [user, setUser] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [activeParticipation, setActiveParticipation] = useState(null);
  const [cpxOfferwallUrl, setCpxOfferwallUrl] = useState('');
  const [payoutMethods, setPayoutMethods] = useState([]);
  const [referralSettings, setReferralSettings] = useState({ referrerRewardCoins: 1000, refereeRewardCoins: 500, referralTrigger: 'FIRST_SURVEY' });
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
      setUser({
        id: 1,
        telegramUserId: '123456789',
        name: 'Demo King User',
        username: 'demoking',
        balance: 0,
        referralCode: 'SK99887',
        stats: { surveysCompleted: 0, todayEarnings: 0, weekEarnings: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (tgUserId) => {
    try {
      // 1. Fetch Surveys & CPX Offerwall link
      const sRes = await fetch(`/api/telegram/surveys?telegramUserId=${tgUserId}`);
      const sData = await sRes.json();
      if (sData.success) {
        setSurveys(sData.surveys);
        if (sData.cpxOfferwallUrl) setCpxOfferwallUrl(sData.cpxOfferwallUrl);
      }

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

      // 5. Fetch Payout Methods & Referral Settings
      const pmRes = await fetch('/api/admin/payout-methods');
      const pmData = await pmRes.json();
      if (pmData.success) setPayoutMethods(pmData.payoutMethods);

      const refRes = await fetch('/api/admin/referral-settings');
      const refData = await refRes.json();
      if (refData.success) setReferralSettings(refData.settings);
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  };

  // Start Survey Handler
  const handleStartSurvey = async (survey) => {
    try {
      const surveyUrl = survey.href || survey.providerUrl || (survey.id ? `https://live-api.cpx-research.com/index.php?app_id=35805&ext_user_id=${user?.telegramUserId || '1981634693'}&survey_id=${survey.id}` : null);
      if (surveyUrl) {
        window.open(surveyUrl, '_blank');
      }

      if (user && survey.id) {
        fetch(`/api/telegram/surveys/${survey.id}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramUserId: user.telegramUserId,
            directHref: survey.href || undefined
          })
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to start survey:', err);
    }
  };



  // Request Withdrawal Handler
  const handleRequestWithdrawal = async (amount, upiId, method = 'UPI') => {
    if (!user) return;
    const res = await fetch('/api/telegram/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramUserId: user.telegramUserId,
        amount,
        upiId,
        method
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px', background: '#0a0e17' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(245, 158, 11, 0.5)'
        }}>
          <Crown size={38} color="#000" />
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>SURVEY KING 👑</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading your dashboard...</div>
      </div>
    );
  }

  if (viewMode === 'landing') {
    return <LandingPage onLaunchApp={() => setViewMode('app')} />;
  }

  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative', background: '#0a0e17' }}>
      {showAdmin ? (
        <AdminLayout
          onExitAdmin={() => {
            setShowAdmin(false);
            setViewMode('app');
            if (window.location.pathname.includes('/admin')) {
              window.history.pushState({}, '', '/app');
            }
            if (user) loadUserData(user.telegramUserId);
          }}
        />
      ) : (
        <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg-primary)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          {/* Top Application Header Bar */}
          <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 140,
            background: 'rgba(10, 14, 23, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-color)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
              }}>
                <Crown size={20} color="#000" />
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                SURVEY KING 👑
              </div>
            </div>
          </header>

          {/* Screen Content */}
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
            />
          )}

          {activeTab === 'earnings' && (
            <EarningsTab
              user={user}
              transactions={transactions}
              payoutMethods={payoutMethods}
              onRequestWithdrawal={handleRequestWithdrawal}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              referrals={referrals}
              referralSettings={referralSettings}
            />
          )}

          {/* Bottom Navigation Bar */}
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
        </div>
      )}
    </div>
  );
}
