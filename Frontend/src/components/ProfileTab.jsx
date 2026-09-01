import React, { useState } from 'react';
import { User, Share2, Copy, Check, Users, ShieldAlert, Award, Gift } from 'lucide-react';

export default function ProfileTab({ user, referrals, referralSettings }) {
  const [copied, setCopied] = useState(false);

  const referrerCoins = referralSettings?.referrerRewardCoins || 1000;
  const refereeCoins = referralSettings?.refereeRewardCoins || 500;
  const triggerRule = referralSettings?.referralTrigger === 'ON_JOIN' ? 'when they sign up!' : 'when they complete their first survey!';

  const botUsername = 'survey_king_bot';
  const referralLink = user?.referralCode 
    ? `https://t.me/${botUsername}?start=${user.referralCode}`
    : `https://t.me/${botUsername}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const shareText = encodeURIComponent(`👑 Join me on Survey King & earn real money by taking quick surveys! Use my invite link to get ${refereeCoins.toLocaleString()} bonus Coins! 👇\n${referralLink}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${shareText}`, '_blank');
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <User size={22} color="var(--accent-gold)" />
          <span>Profile & Referrals</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage your account profile and earn bonus coins by inviting friends.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          fontWeight: 800,
          color: '#fff'
        }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{user?.name || 'Survey User'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>@{user?.username || 'telegram_user'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Telegram ID: {user?.telegramUserId || 'N/A'}</div>
        </div>
      </div>

      {/* Refer & Earn Banner Card */}
      <div className="glass-card" style={{ border: '1px solid rgba(245, 158, 11, 0.4)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.15) 100%)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Gift size={20} color="var(--accent-gold)" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Refer & Earn {referrerCoins.toLocaleString()} 🪙</span>
          </div>
          <span className="badge badge-gold">
            You: {referrerCoins.toLocaleString()} 🪙 | Friend: {refereeCoins.toLocaleString()} 🪙
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
          Earn <strong style={{ color: 'var(--accent-gold)' }}>{referrerCoins.toLocaleString()} Coins (₹{(referrerCoins/100).toFixed(0)})</strong> for every friend you invite! Your friend gets <strong style={{ color: 'var(--accent-green)' }}>{refereeCoins.toLocaleString()} bonus Coins</strong> {triggerRule}
        </p>

        {/* Referral Code Box */}
        <div className="input-group" style={{ marginBottom: '12px' }}>
          <label className="input-label">YOUR REFERRAL CODE</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="input-field" 
              value={user?.referralCode || 'SK...' } 
              readOnly 
              style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.1em', color: 'var(--accent-gold)' }}
            />
            <button className="btn-secondary" style={{ width: 'auto', padding: '0 16px' }} onClick={handleCopyLink}>
              {copied ? <Check size={18} color="var(--accent-green)" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn-primary" onClick={handleShareTelegram}>
            <Share2 size={16} />
            <span>Share to Telegram</span>
          </button>

          <button className="btn-secondary" onClick={handleCopyLink}>
            <Copy size={16} />
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Referred Users List */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--accent-gold)" />
            <span>My Referred Friends</span>
          </span>
          <span className="badge badge-green">{referrals.length} Total</span>
        </h3>

        {referrals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No users referred yet. Share your code to start earning referral bonus coins!
          </div>
        ) : (
          referrals.map((ref) => (
            <div key={ref.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{ref.referredName || 'Referred Friend'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : 'Recent'}</div>
              </div>
              <span className={`badge ${ref.status === 'QUALIFIED' ? 'badge-green' : 'badge-gold'}`}>
                {ref.status === 'QUALIFIED' ? `+${referrerCoins.toLocaleString()} 🪙 Earned` : 'Pending Survey'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
