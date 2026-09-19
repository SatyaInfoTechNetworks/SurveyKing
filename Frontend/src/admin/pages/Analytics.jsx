import React from 'react';
import { TrendingUp, Users, Target, Coins, Radio, Award, DollarSign, CreditCard, BarChart2, ShieldCheck } from 'lucide-react';

export default function AnalyticsPage({ analytics }) {
  const payoutMethods = analytics?.payoutMethodBreakdown || [
    { method: 'UPI', count: 12, totalCoins: 65000, rupees: '650.00' },
    { method: 'PAYTM', count: 8, totalCoins: 40000, rupees: '400.00' },
    { method: 'AMAZON', count: 5, totalCoins: 25000, rupees: '250.00' },
    { method: 'GOOGLE_PLAY', count: 3, totalCoins: 15000, rupees: '150.00' }
  ];

  const topEarners = analytics?.topEarners || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          📈 Enterprise Analytics & Deep Financial Telemetry
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
          Real-time insights across user retention cohorts, survey completion funnels, payout method distributions, top earners, and net platform profit margins.
        </p>
      </div>

      {/* Top Level Financial Summary Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(13, 19, 31, 0.85) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px'
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>ESTIMATED GROSS REVENUE (USD)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
            {analytics?.revenueAnalytics?.grossPublisherUsd || '$0.00'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>CPX Publisher Payouts</div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase' }}>ESTIMATED REVENUE (INR)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa', marginTop: '2px' }}>
            {analytics?.revenueAnalytics?.grossPublisherInr || '₹0.00'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>@ ₹85.00 INR / USD</div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>COINS DISTRIBUTED (INR)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
            ₹{((parseFloat(analytics?.revenueAnalytics?.coinsIssued?.replace(/,/g, '') || 0)) / 100).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #94a3b8)', marginTop: '2px' }}>{analytics?.revenueAnalytics?.coinsIssued || '0'} Coins</div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, textTransform: 'uppercase' }}>ESTIMATED NET MARGIN</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
            {analytics?.revenueAnalytics?.netProfitInr || '₹0.00'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Margin: {analytics?.revenueAnalytics?.grossMargin || '100%'}</div>
        </div>
      </div>

      {/* Grid: Analytic Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 1. User Retention & Growth */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Users size={18} color="#3b82f6" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>User Growth & Retention Cohorts</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Daily Registrations</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
                {analytics?.userAnalytics?.dailyRegistrations || '+0.0%'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>D7 User Retention</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                {analytics?.userAnalytics?.retentionD7 || '78.5%'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Daily Active Users (DAU)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {analytics?.userAnalytics?.dau?.toLocaleString() ?? 0}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Monthly Active Users (MAU)</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {analytics?.userAnalytics?.mau?.toLocaleString() ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Survey Funnel Analytics */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target size={18} color="#10b981" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Survey Conversion Funnel</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Survey Starts</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {analytics?.surveyAnalytics?.starts?.toLocaleString() ?? 0}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Completions</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                {analytics?.surveyAnalytics?.completes?.toLocaleString() ?? 0}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Conversion Rate</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                {analytics?.surveyAnalytics?.conversionRate || '0.0%'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Average Reward</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#a78bfa', marginTop: '4px' }}>
                {analytics?.surveyAnalytics?.avgReward || '0 Coins'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Payout Method Distribution & Top Earners */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
        {/* Payout Method Breakdown */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <CreditCard size={18} color="#f59e0b" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Withdrawal Methods Distribution</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {payoutMethods.map((pm, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#fff', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700 }}>{pm.method}</span>
                  <span style={{ fontWeight: 800, color: '#f59e0b' }}>₹{pm.rupees} ({pm.count} payouts)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, Math.max(15, pm.count * 15))}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)', borderRadius: '9999px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Earners Leaderboard */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.95rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#f59e0b" />
            <span>Top Platform Earners Leaderboard</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>USER</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TG ID</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>COMPLETED</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>TOTAL EARNED</th>
              </tr>
            </thead>
            <tbody>
              {topEarners.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted, #64748b)' }}>
                    No earnings activity recorded yet.
                  </td>
                </tr>
              ) : (
                topEarners.map((user, idx) => (
                  <tr key={user.userId || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '10px 16px', fontWeight: 700, color: '#fff' }}>
                      <span style={{ color: '#f59e0b', marginRight: '6px' }}>#{idx + 1}</span>
                      {user.userName}
                    </td>
                    <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: '#60a5fa' }}>
                      {user.userTgId}
                    </td>
                    <td style={{ padding: '10px 16px', color: '#10b981', fontWeight: 700 }}>
                      {user.completedSurveys} surveys
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 800, color: '#f59e0b' }}>
                      {user.totalEarnedCoins.toLocaleString()} 🪙 (₹{user.earnedRupees})
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
