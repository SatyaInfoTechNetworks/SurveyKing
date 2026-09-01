import React from 'react';
import {
  Users,
  Target,
  Coins,
  CreditCard,
  Radio,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function Dashboard({ stats, liveActivity, onNavigateTab }) {
  const kpis = [
    {
      title: 'Total Registered Users',
      value: stats?.totalUsers?.toLocaleString() || '0',
      growth: stats?.usersGrowth || '+12.4%',
      icon: Users,
      color: '#3b82f6',
      tab: 'users'
    },
    {
      title: 'Surveys Completed',
      value: stats?.completedSurveys?.toLocaleString() || '0',
      growth: stats?.completedGrowth || '+8.2%',
      icon: Target,
      color: '#10b981',
      tab: 'surveys'
    },
    {
      title: 'Coins Distributed',
      value: `${(stats?.totalCoinsIssued || 0).toLocaleString()} 🪙`,
      growth: stats?.coinsGrowth || '+14.8%',
      icon: Coins,
      color: '#f59e0b',
      tab: 'wallet'
    },
    {
      title: 'Pending Withdrawals',
      value: stats?.pendingWithdrawals || 0,
      growth: 'Queue Active',
      icon: CreditCard,
      color: '#ef4444',
      badge: stats?.pendingWithdrawals > 0 ? 'NEEDS APPROVAL' : null,
      tab: 'withdrawals'
    },
    {
      title: 'Total Payouts Paid',
      value: `₹${stats?.totalPaidRupees || '0.00'}`,
      growth: 'INR Sent',
      icon: TrendingUp,
      color: '#8b5cf6',
      tab: 'withdrawals'
    },
    {
      title: 'Total Postbacks',
      value: stats?.totalPostbacks?.toLocaleString() || '0',
      growth: 'CPX Stream',
      icon: Radio,
      color: '#ec4899',
      tab: 'postbacks'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div style={{
        padding: '24px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(13, 19, 31, 0.8) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            👑 Survey King Enterprise Core
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            System Dashboard & Live Real-Time Operations
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted, #94a3b8)', marginTop: '4px' }}>
            Real-time MySQL ledger tracking, automated Telegram dispatch, and instant CPX postbacks.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => onNavigateTab('withdrawals')}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            Review Withdrawals ({stats?.pendingWithdrawals || 0})
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.tab)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: `${kpi.color}20`,
                  border: `1px solid ${kpi.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: kpi.color
                }}>
                  <Icon size={20} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: kpi.color, background: `${kpi.color}15`, padding: '2px 8px', borderRadius: '9999px' }}>
                    {kpi.growth}
                  </span>
                  <ArrowUpRight size={14} color="var(--text-muted, #64748b)" />
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>{kpi.title}</div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginTop: '4px', letterSpacing: '-0.02em' }}>
                {kpi.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Charts & Live Activity Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Left: Quick Performance Summary */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#f59e0b" />
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Platform Conversion Funnel</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Real-Time 24H</span>
          </div>

          {/* Metrics Progression Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff', marginBottom: '6px' }}>
                <span>Surveys Completion Rate</span>
                <span style={{ fontWeight: 800, color: '#10b981' }}>60.8%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '60.8%', height: '100%', background: '#10b981', borderRadius: '9999px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff', marginBottom: '6px' }}>
                <span>Referral Conversion Rate</span>
                <span style={{ fontWeight: 800, color: '#3b82f6' }}>48.5%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '48.5%', height: '100%', background: '#3b82f6', borderRadius: '9999px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff', marginBottom: '6px' }}>
                <span>CPX Postback Success Rate</span>
                <span style={{ fontWeight: 800, color: '#f59e0b' }}>98.6%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: '98.6%', height: '100%', background: '#f59e0b', borderRadius: '9999px' }}></div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              onClick={() => onNavigateTab('users')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Users size={14} /> Search Users
            </button>

            <button
              onClick={() => onNavigateTab('surveys')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#fff',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Target size={14} /> Custom Surveys
            </button>
          </div>
        </div>

        {/* Right: Real-time Live Activity Feed */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={17} color="#f59e0b" />
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Live System Stream</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>● Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
            {(!liveActivity || liveActivity.length === 0) ? (
              <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.82rem', textAlign: 'center', padding: '20px' }}>
                No events recorded yet.
              </div>
            ) : (
              liveActivity.map((ev) => (
                <div key={ev.id} style={{
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{ev.badge}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{ev.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>{ev.user}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#f59e0b' }}>{ev.amount}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted, #64748b)' }}>
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
