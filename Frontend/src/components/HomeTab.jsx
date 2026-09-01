import React from 'react';
import { Sparkles, TrendingUp, ShieldCheck, Play, ArrowRight, Zap, Coins } from 'lucide-react';

export default function HomeTab({ user, surveys, onStartSurvey, onNavigate }) {
  const topSurveys = surveys.slice(0, 3);
  const coins = user?.balance ?? 0;
  const rupees = (coins / 100).toFixed(2);

  return (
    <div style={{ padding: '16px' }}>
      {/* Welcome Greeting Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Welcome Back</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{user?.name || 'Survey King User'} 👋</div>
        </div>

        <div className="badge">
          <Sparkles size={13} />
          <span>VIP Level 1</span>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="glass-card balance-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>AVAILABLE COIN BALANCE</span>
          <span className="badge badge-green">1,000 🪙 = ₹10</span>
        </div>

        <div className="balance-amount">
          <Coins size={32} color="var(--accent-gold)" />
          <span>{coins.toLocaleString()}</span>
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600, marginLeft: '4px' }}>Coins</span>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 700, marginBottom: '14px' }}>
          ≈ ₹{rupees} INR Payout Value
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn-primary" onClick={() => onNavigate('surveys')}>
            <Play size={16} fill="#000" />
            <span>Take Surveys</span>
          </button>

          <button className="btn-secondary" onClick={() => onNavigate('earnings')}>
            <TrendingUp size={16} />
            <span>Withdraw Payout</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Today</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>
            +{user?.stats?.todayEarnings ? user.stats.todayEarnings.toLocaleString() : '0'} 🪙
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This Week</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>
            {user?.stats?.weekEarnings ? user.stats.weekEarnings.toLocaleString() : '0'} 🪙
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {user?.stats?.surveysCompleted || 0} 🎯
          </div>
        </div>
      </div>

      {/* Recommended Surveys Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={18} color="var(--accent-gold)" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>Highest Coin Rewards</h2>
        </div>
        <button 
          onClick={() => onNavigate('surveys')}
          style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span>See All</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Quick Survey Cards */}
      {topSurveys.map((survey) => (
        <div className="survey-card" key={survey.surveyId}>
          <div className="survey-header">
            <div className="survey-icon-title">
              <div className="survey-icon">{survey.icon || '🎯'}</div>
              <div>
                <div className="survey-title">{survey.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Provider: {survey.provider}</div>
              </div>
            </div>
            <div className="survey-reward">+{survey.reward.toLocaleString()} 🪙</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '10px', marginTop: '4px' }}>
            <div className="survey-meta">
              <span className="meta-item">⏱ {survey.estimatedMinutes} min</span>
              <span className="meta-item" style={{ color: 'var(--accent-green)' }}>≈ ₹{(survey.reward / 100).toFixed(0)} INR</span>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => onStartSurvey(survey)}
            >
              Start Survey
            </button>
          </div>
        </div>
      ))}

      {/* Trust Banner */}
      <div style={{
        marginTop: '20px',
        padding: '14px',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <ShieldCheck size={28} color="var(--accent-green)" />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          <strong style={{ color: '#fff' }}>Instant Coin Crediting:</strong> 1,000 Coins equal ₹10.00. Redeem via UPI, Amazon, Paytm, or Google Play anytime!
        </div>
      </div>
    </div>
  );
}
