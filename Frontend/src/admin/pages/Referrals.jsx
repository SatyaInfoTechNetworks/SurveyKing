import React, { useState } from 'react';
import { Share2, Users, Gift, Save, CheckCircle, Clock } from 'lucide-react';

export default function ReferralsPage({ referrals, stats, settings, onSaveSettings, savingSettings }) {
  const [referrerCoins, setReferrerCoins] = useState(settings?.referrerRewardCoins || 1000);
  const [refereeCoins, setRefereeCoins] = useState(settings?.refereeRewardCoins || 500);
  const [minSurveyCoins, setMinSurveyCoins] = useState(settings?.minSurveyRewardCoins || 100);
  const [trigger, setTrigger] = useState(settings?.referralTrigger || 'FIRST_SURVEY');

  const handleRulesSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      referrerRewardCoins: parseInt(referrerCoins, 10),
      refereeRewardCoins: parseInt(refereeCoins, 10),
      minSurveyRewardCoins: parseInt(minSurveyCoins, 10),
      referralTrigger: trigger
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            👥 Referral Engine & Viral Growth Rules
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Configure dynamic referral rewards, manage the first-survey qualification barrier (≥ 100 Coins), and view viral referral trees.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>TOTAL REFERRALS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {stats?.total?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#60a5fa', marginTop: '2px' }}>Invited by Friends</div>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>QUALIFIED REFERRALS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
            {stats?.qualified?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>First Survey Completed ✅</div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>PENDING QUALIFICATION</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {stats?.pending?.toLocaleString() || '0'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '2px' }}>Awaiting Survey ⏳</div>
        </div>

        <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>REFERRAL COINS PAID</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa', marginTop: '4px' }}>
            {stats?.coinsPaid?.toLocaleString() || '0'} 🪙
          </div>
          <div style={{ fontSize: '0.7rem', color: '#a78bfa', marginTop: '2px' }}>≈ ₹{((stats?.coinsPaid || 0) / 100).toFixed(2)}</div>
        </div>
      </div>

      {/* Main Grid: Referral Rules Form & Ledger */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px' }}>
        {/* Left: Dynamic Rules Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
          height: 'fit-content'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Gift size={18} color="#f59e0b" />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Referral Incentive Engine</span>
          </div>

          <form onSubmit={handleRulesSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Inviter Reward (Coins)
              </label>
              <input
                type="number"
                value={referrerCoins}
                onChange={(e) => setReferrerCoins(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#f59e0b',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}
              />
              <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>
                ≈ ₹{(referrerCoins / 100).toFixed(2)} INR to Inviter
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Friend Welcome Bonus (Coins)
              </label>
              <input
                type="number"
                value={refereeCoins}
                onChange={(e) => setRefereeCoins(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#60a5fa',
                  fontWeight: 800,
                  fontSize: '0.85rem'
                }}
              />
              <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>
                ≈ ₹{(refereeCoins / 100).toFixed(2)} INR to Friend
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Min Survey Reward to Qualify (Coins)
              </label>
              <input
                type="number"
                value={minSurveyCoins}
                onChange={(e) => setMinSurveyCoins(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Qualification Trigger
              </label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                style={{
                  width: '100%',
                  background: '#151d2e',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value="FIRST_SURVEY">FIRST_SURVEY (Recommended: Must Complete Survey)</option>
                <option value="ON_JOIN">ON_JOIN (Instant on registration)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              style={{
                marginTop: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Save size={15} />
              <span>{savingSettings ? 'Saving...' : 'Update Referral Rules'}</span>
            </button>
          </form>
        </div>

        {/* Right: Referrals Ledger */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>INVITER</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>REFERRED FRIEND</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>REWARD</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #64748b)' }}>
                    No referral connections logged yet.
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{r.inviterName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>TG ID: {r.inviterTgId}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{r.referredName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>TG ID: {r.referredTgId}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        background: r.status === 'QUALIFIED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: r.status === 'QUALIFIED' ? '#10b981' : '#f59e0b'
                      }}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#10b981' }}>
                      +{parseFloat(r.reward_amount).toLocaleString()} 🪙
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                      {new Date(r.created_at).toLocaleDateString()}
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
