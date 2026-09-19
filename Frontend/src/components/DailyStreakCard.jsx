import React, { useState, useEffect } from 'react';
import { Flame, Check, Play, Lock, AlertCircle, Sparkles, Coins } from 'lucide-react';

export default function DailyStreakCard({ user, onRewardClaimed }) {
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchStreak();
  }, [user?.telegramUserId]);

  const fetchStreak = async () => {
    if (!user?.telegramUserId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/telegram/streak?telegramUserId=${user.telegramUserId}`);
      const data = await res.json();
      if (data.success) {
        setStreakData(data.streak);
      }
    } catch (err) {
      console.error('Failed to load streak status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAdStreak = () => {
    setErrorMsg('');
    setSuccessMsg('');

    const blockId = streakData?.adsgramBlockId || '46060';

    // Verify Adsgram Controller window script is available
    if (window.Adsgram) {
      try {
        const AdController = window.Adsgram.init({ blockId });
        AdController.show()
          .then((result) => {
            // User watched ad completely! Execute reward claim
            submitClaim();
          })
          .catch((error) => {
            console.warn('Adsgram Ad closed or failed:', error);
            setErrorMsg('Ad was not completed. Watch full ad to claim your streak reward!');
          });
      } catch (err) {
        console.error('Error invoking Adsgram:', err);
        submitClaim(); // Fallback direct claim if ad blocker active
      }
    } else {
      // Direct API claim fallback if script loading slow
      submitClaim();
    }
  };

  const submitClaim = async () => {
    try {
      setClaiming(true);
      const res = await fetch('/api/telegram/streak/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramUserId: user.telegramUserId })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        fetchStreak();
        if (onRewardClaimed) onRewardClaimed(data.newBalance);
      } else {
        setErrorMsg(data.error || 'Failed to claim streak');
      }
    } catch (err) {
      setErrorMsg('Network error claiming streak');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading Daily Streak Rewards...</div>
      </div>
    );
  }

  const days = streakData?.days || [
    { day: 1, reward: 100, claimed: false },
    { day: 2, reward: 125, claimed: false },
    { day: 3, reward: 150, claimed: false },
    { day: 4, reward: 175, claimed: false },
    { day: 5, reward: 200, claimed: false },
    { day: 6, reward: 225, claimed: false },
    { day: 7, reward: 250, claimed: false }
  ];

  return (
    <div className="glass-card" style={{
      padding: '16px',
      marginBottom: '20px',
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.15) 100%)',
      border: '1px solid rgba(245, 158, 11, 0.4)',
      borderRadius: '20px'
    }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
          }}>
            <Flame size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>7-Day Daily Streak</span>
              <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                {streakData?.currentStreak || 0} DAYS 🔥
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Watch a quick video ad daily to collect bonus coins! (Miss 1 day = Reset)
            </div>
          </div>
        </div>
      </div>

      {/* 7 Days Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '14px' }}>
        {days.map((item) => {
          const isCurrent = item.isCurrent;
          const isClaimed = item.claimed;

          return (
            <div
              key={item.day}
              style={{
                background: isClaimed
                  ? 'rgba(16, 185, 129, 0.2)'
                  : (isCurrent ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)' : 'rgba(15, 23, 42, 0.6)'),
                border: isClaimed
                  ? '1px solid rgba(16, 185, 129, 0.5)'
                  : (isCurrent ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)'),
                borderRadius: '12px',
                padding: '8px 2px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: isCurrent ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                DAY {item.day}
              </span>

              <div style={{ margin: '4px 0' }}>
                {isClaimed ? (
                  <Check size={16} color="#10b981" />
                ) : (
                  <Coins size={16} color={isCurrent ? '#f59e0b' : '#64748b'} />
                )}
              </div>

              <span style={{ fontSize: '0.68rem', fontWeight: 900, color: isClaimed ? '#10b981' : (isCurrent ? '#fff' : 'var(--text-muted)') }}>
                +{item.reward}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      {streakData?.canClaimToday ? (
        <button
          onClick={handleClaimAdStreak}
          disabled={claiming}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
          }}
        >
          <Play size={18} fill="#fff" />
          <span>{claiming ? 'Processing Reward...' : 'Watch Ad & Claim Today\'s Streak'}</span>
        </button>
      ) : (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '10px 14px',
          textAlign: 'center',
          color: '#10b981',
          fontSize: '0.8rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          <Check size={16} />
          <span>Today's Streak Claimed! Come back tomorrow for Day {(streakData?.currentStreak || 0) + 1}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '8px', textAlign: 'center', fontWeight: 700 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '8px', textAlign: 'center', fontWeight: 800 }}>
          {successMsg}
        </div>
      )}
    </div>
  );
}
