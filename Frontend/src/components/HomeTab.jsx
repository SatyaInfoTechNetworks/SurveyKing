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
        <div className="survey-card" key={survey.surveyId} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
              <div className="survey-icon" style={{ flexShrink: 0 }}>{survey.icon || '🎯'}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="survey-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                  {survey.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Provider: <strong style={{ color: 'var(--accent-gold)' }}>{survey.provider}</strong>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              padding: '4px 10px',
              borderRadius: '9999px',
              color: '#f59e0b',
              fontWeight: 800,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>+{survey.reward.toLocaleString()}</span>
              <Coins size={14} color="#f59e0b" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed rgba(255, 255, 255, 0.08)', paddingTop: '10px', marginTop: '12px' }}>
            <div className="survey-meta" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {survey.estimatedMinutes} min</span>
              <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)' }}>≈ ₹{(survey.reward / 100).toFixed(0)} INR</span>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: 'auto', padding: '8px 16px', fontSize: '0.8rem', flexShrink: 0 }}
              onClick={() => onStartSurvey(survey)}
            >
              <Play size={13} fill="#000" />
              <span>Start Survey</span>
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
