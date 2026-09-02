import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Award,
  ChevronRight,
  Send,
  Zap,
  ShieldCheck
} from 'lucide-react';

export default function LeaderboardTab({ user }) {
  const [period, setPeriod] = useState('all'); // 'all', 'weekly', 'today'
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  const telegramChannelUrl = 'https://t.me/SatyainfotechNetworks';

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period, user?.telegramUserId]);

  const fetchLeaderboard = async (selectedPeriod) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/telegram/leaderboard?period=${selectedPeriod}&telegramUserId=${user?.telegramUserId || '123456789'}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
        setCurrentUserRank(data.currentUserRank || null);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const restEarners = leaderboard.slice(3);

  return (
    <div style={{ padding: '16px 16px 36px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Trophy size={22} color="var(--accent-gold)" />
            <span>Top Earners Leaderboard</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Top survey participants earning real cash daily
          </p>
        </div>

        <button
          onClick={() => fetchLeaderboard(period)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '8px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Refresh"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Period Filter Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: '4px',
        borderRadius: '14px',
        border: '1px solid var(--border-color)'
      }}>
        {[
          { id: 'all', label: 'All Time' },
          { id: 'weekly', label: 'This Week' },
          { id: 'today', label: 'Today' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPeriod(tab.id)}
            style={{
              padding: '10px 0',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: period === tab.id ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
              color: period === tab.id ? '#000' : 'var(--text-secondary)',
              boxShadow: period === tab.id ? '0 4px 12px rgba(245, 158, 11, 0.35)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr 1fr',
          gap: '8px',
          alignItems: 'flex-end',
          margin: '10px 0 6px 0'
        }}>
          {/* #2 Silver */}
          {top2 && (
            <div className="glass-card" style={{
              padding: '12px 8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '18px',
              background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.3)'
            }}>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #cbd5e1 0%, #64748b 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: '#0f172a',
                  border: '2px solid #cbd5e1'
                }}>
                  {top2.name.charAt(0)}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#94a3b8',
                  color: '#000',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  2
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                {top2.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{top2.username}</div>

              <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 900, color: '#cbd5e1' }}>
                {top2.totalEarnings.toLocaleString()} 🪙
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                ₹{top2.rupees}
              </div>
            </div>
          )}

          {/* #1 Gold Champion */}
          {top1 && (
            <div className="glass-card" style={{
              padding: '16px 8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '20px',
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '2px solid rgba(245, 158, 11, 0.6)',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)',
              transform: 'translateY(-6px)'
            }}>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <Crown size={22} color="var(--accent-gold)" style={{ position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)' }} />
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.4rem',
                  color: '#000',
                  border: '3px solid #fbbf24',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
                }}>
                  {top1.name.charAt(0)}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--accent-gold)',
                  color: '#000',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  1
                </div>
              </div>

              <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                {top1.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--accent-gold)' }}>{top1.username}</div>

              <div style={{ marginTop: '8px', fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
                {top1.totalEarnings.toLocaleString()} 🪙
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 800 }}>
                ₹{top1.rupees}
              </div>
            </div>
          )}

          {/* #3 Bronze */}
          {top3 && (
            <div className="glass-card" style={{
              padding: '12px 8px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: '18px',
              background: 'linear-gradient(180deg, rgba(217, 119, 6, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(217, 119, 6, 0.3)'
            }}>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  color: '#fff',
                  border: '2px solid #b45309'
                }}>
                  {top3.name.charAt(0)}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#b45309',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  3
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                {top3.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{top3.username}</div>

              <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 900, color: '#fb923c' }}>
                {top3.totalEarnings.toLocaleString()} 🪙
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                ₹{top3.rupees}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Your Rank Pin Card */}
      {currentUserRank && (
        <div className="glass-card" style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              fontWeight: 900,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              #{currentUserRank.rank}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>You ({currentUserRank.name || 'You'})</span>
                <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>YOUR RANK</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {currentUserRank.surveysCount || 0} Surveys Completed
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
              {(currentUserRank.totalEarnings || 0).toLocaleString()} 🪙
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 700 }}>
              ≈ ₹{currentUserRank.rupees || '0'}
            </div>
          </div>
        </div>
      )}

      {/* Ranked List (Rank 4 to 20) */}
      <div className="glass-card" style={{ padding: '8px 12px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Rank & Participant</span>
          <span>Coins Earned</span>
        </div>

        {restEarners.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 6px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
              <div style={{
                width: '28px',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: item.rank <= 10 ? 'var(--accent-gold)' : 'var(--text-muted)',
                textAlign: 'center'
              }}>
                #{item.rank}
              </div>

              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#fff',
                flexShrink: 0
              }}>
                {item.name.charAt(0)}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {item.username} • {item.surveysCount} surveys
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                {item.totalEarnings.toLocaleString()} 🪙
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontWeight: 700 }}>
                ₹{item.rupees}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Community Contest CTA */}
      <div className="glass-card" style={{
        padding: '14px',
        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(2, 132, 199, 0.18) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>Weekly Leaderboard Rewards 🎁</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Top 10 earners receive direct cash prizes & Lifafa bonuses every Sunday!
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ width: 'auto', padding: '8px 14px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', color: '#fff' }}
          onClick={() => window.open(telegramChannelUrl, '_blank')}
        >
          <Send size={14} /> Join
        </button>
      </div>

    </div>
  );
}
