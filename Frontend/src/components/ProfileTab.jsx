import React, { useState } from 'react';
import { User, Share2, Copy, Check, Users, Gift, Terminal } from 'lucide-react';

export default function ProfileTab({ user, referrals, onCompleteWebhook }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [testPartId, setTestPartId] = useState('');
  const [webhookLog, setWebhookLog] = useState('');

  const refCode = user?.referralCode || 'SK12345';
  const refLink = `https://t.me/survey_king_bot?start=${refCode}`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(`👑 Join Survey King and start earning real cash by taking quick surveys! Use my referral code: ${refCode}`);
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`;
    window.open(shareUrl, '_blank');
  };

  const triggerTestWebhook = async () => {
    if (!testPartId) return;
    try {
      setWebhookLog('⏳ Sending POST /api/webhooks/surveys/cpx...');
      const res = await onCompleteWebhook(testPartId, 'COMPLETED');
      setWebhookLog('✅ Server Response: ' + JSON.stringify(res, null, 2));
    } catch (err) {
      setWebhookLog('❌ Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* Title */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={24} color="var(--accent-gold)" />
          <span>Profile & Referrals</span>
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage your Telegram profile and earn 1,500 Coins (₹15) per referred friend.
        </p>
      </div>

      {/* User Info Card */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#fff'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{user?.name || 'Survey King User'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>@{user?.username || 'user'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Telegram ID: <code>{user?.telegramUserId || '123456789'}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Program Card */}
      <div className="glass-card" style={{ border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={20} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Refer & Earn 1,500 🪙</h3>
          </div>
          <span className="badge">1,500 Coins = ₹15</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
          Earn <strong>1,500 Coins (₹15.00)</strong> when your referred friend completes their first qualifying survey!
        </p>

        {/* Referral Code Box */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: 'var(--radius-md)', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>YOUR REFERRAL CODE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.05em' }}>{refCode}</div>
          </div>

          <button className="btn-secondary" onClick={() => copyToClipboard(refCode, 'code')}>
            {copiedCode ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Share Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn-primary" onClick={shareToTelegram}>
            <Share2 size={16} />
            <span>Share to Telegram</span>
          </button>

          <button className="btn-secondary" onClick={() => copyToClipboard(refLink, 'link')}>
            {copiedLink ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
            <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Referral Stats List */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={18} /> My Referred Users</span>
          <span className="badge badge-green">{referrals.length} Total</span>
        </h3>

        {referrals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No users referred yet. Share your code to start earning referral bonus coins!
          </div>
        ) : (
          referrals.map(r => (
            <div className="tx-item" key={r.id || Math.random()}>
              <div className="tx-info">
                <div className="tx-icon income">👥</div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{r.name || 'User'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{r.username || 'user'}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${r.status === 'QUALIFIED' ? 'badge-green' : ''}`}>
                  {r.status === 'QUALIFIED' ? 'QUALIFIED +1,500 🪙' : 'PENDING'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Developer Webhook Tester */}
      <div className="glass-card" style={{ border: '1px dashed rgba(255, 255, 255, 0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Terminal size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Webhook & Provider Test Console</h3>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
          Directly trigger provider completion webhook callbacks for testing:
        </p>

        <div className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder="Enter participationId (e.g. PART_...)"
            value={testPartId}
            onChange={(e) => setTestPartId(e.target.value)}
          />
        </div>

        <button className="btn-secondary" style={{ width: '100%' }} onClick={triggerTestWebhook}>
          Execute Callback Webhook
        </button>

        {webhookLog && (
          <pre style={{
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#a7f3d0',
            marginTop: '10px',
            overflowX: 'auto'
          }}>
            {webhookLog}
          </pre>
        )}
      </div>
    </div>
  );
}
