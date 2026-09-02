import React, { useState } from 'react';
import {
  User,
  Share2,
  Copy,
  Check,
  Users,
  Gift,
  ChevronRight,
  Fingerprint,
  Smartphone,
  FileText,
  ShieldCheck,
  Handshake,
  Mail,
  Send,
  Sparkles,
  ExternalLink,
  X,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  MessageCircle,
  Flame,
  ArrowUpRight,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProfileTab({ user, referrals = [], referralSettings, onUserUpdate }) {
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Lifafa / Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState(null);
  const [promoError, setPromoError] = useState(null);

  // Advertising IDs State
  const [gaid, setGaid] = useState(user?.googleAdId || '');
  const [idfa, setIdfa] = useState(user?.iosIdfaId || '');
  const [adIdSaving, setAdIdSaving] = useState(false);
  const [adIdSuccess, setAdIdSuccess] = useState('');

  const referrerCoins = referralSettings?.referrerRewardCoins || 1000;
  const refereeCoins = referralSettings?.refereeRewardCoins || 500;
  const triggerRule = referralSettings?.referralTrigger === 'ON_JOIN' ? 'when they sign up!' : 'when they complete their first survey!';

  const botUsername = 'survey_king_bot';
  const referralLink = user?.referralCode 
    ? `https://t.me/${botUsername}?start=${user.referralCode}`
    : `https://t.me/${botUsername}`;

  const telegramChannelUrl = 'https://t.me/SatyainfotechNetworks';
  const telegramSupportUrl = 'https://t.me/Devraj069';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const shareText = encodeURIComponent(`👑 Join me on Survey King & earn real cash by taking quick surveys! Use my invite link to get ${refereeCoins.toLocaleString()} bonus Coins! 👇\n${referralLink}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${shareText}`, '_blank');
  };

  // Generate random dummy UUID for GAID/IDFA if user wants to auto-generate
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Save Advertising IDs
  const handleSaveAdIds = async () => {
    setAdIdSaving(true);
    setAdIdSuccess('');
    try {
      const res = await fetch('/api/telegram/ad-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUserId: user?.telegramUserId || '123456789',
          googleAdId: gaid,
          iosIdfaId: idfa
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdIdSuccess('Advertising ID saved successfully!');
        if (onUserUpdate) onUserUpdate();
        setTimeout(() => setAdIdSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save Ad IDs:', err);
    } finally {
      setAdIdSaving(false);
    }
  };

  // Claim Lifafa (Promo Code) Handler
  const handleClaimLifafa = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoMessage(null);
    setPromoError(null);

    try {
      const res = await fetch('/api/telegram/promo/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUserId: user?.telegramUserId || '123456789',
          code: promoCode.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setPromoMessage(data.message);
        setPromoCode('');
        
        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (cErr) {}

        if (onUserUpdate) {
          onUserUpdate();
        }
      } else {
        setPromoError(data.error || 'Failed to claim promo code.');
      }
    } catch (err) {
      setPromoError('Network error. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  // Menu Options List from screenshot + requested items
  const menuItems = [
    {
      id: 'gaid',
      title: 'Google Advertising ID',
      subtitle: gaid ? `${gaid.substring(0, 16)}...` : 'Configure GAID for high-paying surveys',
      icon: Fingerprint,
      iconGradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
      iconColor: '#fff',
      badge: gaid ? 'Active' : null,
      badgeColor: 'badge-green',
      onClick: () => setActiveModal('gaid')
    },
    {
      id: 'idfa',
      title: 'iOS IDFA ID',
      subtitle: idfa ? `${idfa.substring(0, 16)}...` : 'Configure Apple Identifier for Advertisers',
      icon: Smartphone,
      iconGradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
      iconColor: '#fff',
      badge: idfa ? 'Active' : null,
      badgeColor: 'badge-green',
      onClick: () => setActiveModal('idfa')
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      subtitle: 'Platform rules, payouts & survey guidelines',
      icon: FileText,
      iconGradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      iconColor: '#fff',
      onClick: () => setActiveModal('terms')
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      subtitle: 'How we safeguard your account and survey data',
      icon: ShieldCheck,
      iconGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      iconColor: '#fff',
      onClick: () => setActiveModal('privacy')
    },
    {
      id: 'collab',
      title: 'Advertise / Collaboration',
      subtitle: 'Brand partnerships, survey promotions & CPX ads',
      icon: Handshake,
      iconGradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
      iconColor: '#fff',
      onClick: () => setActiveModal('collab')
    },
    {
      id: 'contact',
      title: 'Contact Us & Support',
      subtitle: 'Get 24/7 dedicated assistance (@Devraj069)',
      icon: Mail,
      iconGradient: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
      iconColor: '#fff',
      badge: '24/7 Live',
      badgeColor: 'badge-green',
      onClick: () => setActiveModal('contact')
    },
    {
      id: 'lifafa',
      title: 'Claim Lifafa (Promo Code)',
      subtitle: 'Enter secret codes & redeem instant cash coins',
      icon: Gift,
      iconGradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
      iconColor: '#fff',
      badge: '🔥 HOT',
      badgeColor: 'badge-gold',
      onClick: () => {
        setPromoMessage(null);
        setPromoError(null);
        setActiveModal('lifafa');
      }
    },
    {
      id: 'telegram',
      title: 'Join Telegram Channel',
      subtitle: 'Daily Lifafa codes, giveaways & survey alerts',
      icon: Send,
      iconGradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
      iconColor: '#fff',
      badge: 'Official',
      badgeColor: 'badge-gold',
      onClick: () => setActiveModal('telegram')
    }
  ];

  return (
    <div style={{ padding: '16px 16px 32px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Profile Header Bar */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <User size={22} color="var(--accent-gold)" />
          <span>Profile & Settings</span>
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage your account preferences, advertising IDs & community perks
        </p>
      </div>

      {/* User Identity Card */}
      <div className="glass-card" style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#000',
          boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)',
          flexShrink: 0
        }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Survey User'}
            </span>
            <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>VIP</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
            @{user?.username || 'user'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            TG ID: <code style={{ color: 'var(--text-secondary)' }}>{user?.telegramUserId || '123456789'}</code>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
            {(user?.balance || 0).toLocaleString()} 🪙
          </div>
        </div>
      </div>

      {/* Quick Action Community Banners */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <a
          href={telegramChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: 'none',
            padding: '12px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(2, 132, 199, 0.25) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Send size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Join Channel</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>@Satyainfotech...</div>
          </div>
        </a>

        <a
          href={telegramSupportUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: 'none',
            padding: '12px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <MessageCircle size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Support Help</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>@Devraj069</div>
          </div>
        </a>
      </div>

      {/* Main Settings Menu Section (Matching Screenshot) */}
      <div className="glass-card" style={{ padding: '6px 10px', display: 'flex', flexDirection: 'column' }}>
        {menuItems.map((item, index) => {
          const IconComp = item.icon;
          const isLast = index === menuItems.length - 1;
          return (
            <div
              key={item.id}
              onClick={item.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 10px',
                borderBottom: isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'background 0.2s ease, transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {/* Rounded Colorful Icon Badge */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: item.iconGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                flexShrink: 0
              }}>
                <IconComp size={22} color={item.iconColor} />
              </div>

              {/* Title & Subtitle */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className={`badge ${item.badgeColor}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.subtitle}
                </div>
              </div>

              {/* Right Chevron */}
              <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </div>
          );
        })}
      </div>

      {/* Refer & Earn Banner Card */}
      <div className="glass-card" style={{ border: '1px solid rgba(245, 158, 11, 0.4)', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.12) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gift size={20} color="var(--accent-gold)" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Refer & Earn {referrerCoins.toLocaleString()} 🪙</span>
          </div>
          <span className="badge badge-gold">
            ₹{(referrerCoins / 100).toFixed(0)} / Friend
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
          Earn <strong style={{ color: 'var(--accent-gold)' }}>{referrerCoins.toLocaleString()} Coins</strong> for every friend you invite! They receive <strong style={{ color: 'var(--accent-green)' }}>{refereeCoins.toLocaleString()} bonus Coins</strong> {triggerRule}
        </p>

        {/* Referral Code Box */}
        <div className="input-group" style={{ marginBottom: '12px' }}>
          <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>YOUR REFERRAL CODE</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="input-field" 
              value={user?.referralCode || 'SK...'} 
              readOnly 
              style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.1em', color: 'var(--accent-gold)' }}
            />
            <button className="btn-secondary" style={{ width: 'auto', padding: '0 16px' }} onClick={handleCopyLink}>
              {copied ? <Check size={18} color="var(--accent-green)" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button className="btn-primary" onClick={handleShareTelegram}>
            <Share2 size={16} />
            <span>Share Link</span>
          </button>

          <button className="btn-secondary" onClick={handleCopyLink}>
            <Copy size={16} />
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Referred Friends History */}
      <div className="glass-card">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--accent-gold)" />
            <span>My Referred Friends</span>
          </span>
          <span className="badge badge-green">{referrals.length} Total</span>
        </h3>

        {referrals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No users referred yet. Share your code with friends to start earning instant bonus coins!
          </div>
        ) : (
          referrals.map((ref) => (
            <div key={ref.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px dashed var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{ref.referredName || 'Referred Friend'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : 'Recent'}</div>
              </div>
              <span className={`badge ${ref.status === 'QUALIFIED' ? 'badge-green' : 'badge-gold'}`}>
                {ref.status === 'QUALIFIED' ? `+${referrerCoins.toLocaleString()} 🪙 Earned` : 'Pending Survey'}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer Network Details */}
      <div style={{ textAlign: 'center', padding: '12px 0 20px 0', color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.6' }}>
        <div>Survey King v2.5 • Developed for High-Yield Surveys</div>
        <div>Network: <strong style={{ color: 'var(--text-secondary)' }}>Satya InfoTech Networks</strong></div>
        <div style={{ marginTop: '4px' }}>
          <a href={telegramChannelUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', margin: '0 6px' }}>Telegram Channel</a>
          •
          <a href={telegramSupportUrl} target="_blank" rel="noreferrer" style={{ color: '#34d399', textDecoration: 'none', margin: '0 6px' }}>Support @Devraj069</a>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🚀 MODALS SECTION */}
      {/* ======================================================== */}

      {/* 1. Google Advertising ID Modal */}
      {activeModal === 'gaid' && (
        <div style={modalOverlayStyle}>
          <div className="glass-card" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Fingerprint size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>Google Advertising ID</h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Android GAID Configuration</div>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Setting your <strong style={{ color: '#fff' }}>Google Advertising ID (GAID)</strong> helps ad providers (like CPX Research & TimeWall) match your profile to high-paying premium surveys and prevent duplicate screenings.
            </div>

            <div className="input-group" style={{ marginBottom: '12px' }}>
              <label className="input-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>YOUR GOOGLE ADVERTISING ID (GAID)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 38400000-8cf0-11bd-b23e-10b96e40000d"
                  value={gaid}
                  onChange={(e) => setGaid(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
                <button
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '0 12px' }}
                  title="Auto Generate"
                  onClick={() => setGaid(generateUUID())}
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {adIdSuccess && (
              <div style={{ color: 'var(--accent-green)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <CheckCircle2 size={16} /> {adIdSuccess}
              </div>
            )}

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              💡 <strong>How to find on Android:</strong> Go to Settings → Google → Ads → Your Advertising ID, or click Auto-Generate above.
            </div>

            <button className="btn-primary" onClick={handleSaveAdIds} disabled={adIdSaving}>
              {adIdSaving ? 'Saving...' : 'Save Google Advertising ID'}
            </button>
          </div>
        </div>
      )}

      {/* 2. iOS IDFA Modal */}
      {activeModal === 'idfa' && (
        <div style={modalOverlayStyle}>
          <div className="glass-card" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>iOS IDFA Identifier</h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Apple Identifier for Advertisers</div>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              The <strong style={{ color: '#fff' }}>iOS IDFA</strong> enables iOS and Apple device participants to unlock exclusive high-ticket survey inventory and app installs.
            </div>

            <div className="input-group" style={{ marginBottom: '12px' }}>
              <label className="input-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>YOUR iOS IDFA</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. EA7583CD-A667-48BC-B806-42ECB2B48D12"
                  value={idfa}
                  onChange={(e) => setIdfa(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
                <button
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '0 12px' }}
                  title="Auto Generate"
                  onClick={() => setIdfa(generateUUID())}
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {adIdSuccess && (
              <div style={{ color: 'var(--accent-green)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <CheckCircle2 size={16} /> {adIdSuccess}
              </div>
            )}

            <button className="btn-primary" onClick={handleSaveAdIds} disabled={adIdSaving}>
              {adIdSaving ? 'Saving...' : 'Save iOS IDFA'}
            </button>
          </div>
        </div>
      )}

      {/* 3. Terms & Conditions Modal */}
      {activeModal === 'terms' && (
        <div style={modalOverlayStyle}>
          <div className="glass-card" style={{ ...modalContentStyle, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>Terms & Conditions</h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Survey King Official Policy</div>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p><strong style={{ color: '#fff' }}>1. Eligibility:</strong> You must be an authorized Telegram user with a single account. Using multiple accounts, emulators, or bot scripts is strictly prohibited and results in permanent bans.</p>
              <p><strong style={{ color: '#fff' }}>2. Survey Integrity:</strong> All survey responses must be truthful and accurate. Providers conduct post-survey audits; fraudulent responses may be reversed via postback chargebacks.</p>
              <p><strong style={{ color: '#fff' }}>3. Payouts & Redemptions:</strong> Payout requests (UPI, Bank, Gift Cards) are processed within 24 to 48 business hours after manual verification of qualification validity.</p>
              <p><strong style={{ color: '#fff' }}>4. Referral Rules:</strong> Referral rewards are credited based on platform trigger rules (either on valid joining or first completed survey qualification).</p>
            </div>

            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveModal(null)}>
              I Understand & Accept
            </button>
          </div>
        </div>
      )}

      {/* 4. Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div style={modalOverlayStyle}>
          <div className="glass-card" style={{ ...modalContentStyle, maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>Privacy Policy</h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Your Data & Security</div>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p><strong style={{ color: '#fff' }}>🔒 Information We Collect:</strong> We only store your public Telegram User ID, username, referral code, and coin transaction ledger. We do not sell personal data to third parties.</p>
              <p><strong style={{ color: '#fff' }}>🛡️ Survey Providers:</strong> When engaging with survey partners (CPX Research, TimeWall), your requests are securely anonymized through our encrypted server postback architecture.</p>
              <p><strong style={{ color: '#fff' }}>💳 Payment Privacy:</strong> Your payout identifiers (UPI VPAs / Account numbers) are securely stored strictly for payment processing.</p>
            </div>

            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveModal(null)}>
              Close Privacy Policy
            </button>
          </div>
        </div>
      )}

      {/* 5. Advertise / Collaboration Modal */}
      {activeModal === 'collab' && (
        <div style={modalOverlayStyle}>
          <div className="glass-card" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Handshake size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>Advertise & Collaborate</h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Satya InfoTech Networks Partnerships</div>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Looking to promote your Telegram channel, run sponsored surveys, integrate custom CPA/CPI offers, or partner with Survey King? We have thousands of active daily earners ready to engage with your brand!
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Official Telegram Business Direct</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)' }}>@Devraj069</div>
                </div>
                <a href={telegramSupportUrl} target="_blank" rel="noreferrer" className="badge badge-gold" style={{ textDecoration: 'none', padding: '6px 12px' }}>
                  Chat on TG <ArrowUpRight size={12} />
                </a>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Official Telegram Channel</div>
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>@SatyainfotechNetworks</div>
                </div>
                <a href={telegramChannelUrl} target="_blank" rel="noreferrer" className="badge badge-green" style={{ textDecoration: 'none', padding: '6px 12px' }}>
                  Join <ArrowUpRight size={12} />
                </a>
              </div>
            </div>

            <button className="btn-primary" onClick={() => window.open(telegramSupportUrl, '_blank')}>
              <Send size={16} /> Contact Devraj (@Devraj069)
            </button>
          </div>
        </div>
      )}

      {/* 6. Contact Us / Support Modal */}
      {activeModal === 'contact' && (
        <div style={modalOverlayStyle}>
          <div className="glass-card" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>Contact & Support</h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>24/7 User Support Team</div>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Have an issue with a survey qualification, payment status, or referral credit? Our team is available 24/7 on Telegram to assist you immediately!
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '14px', borderRadius: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <MessageCircle size={18} color="var(--accent-green)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>Direct Support: @Devraj069</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Average response time: <strong style={{ color: 'var(--accent-green)' }}>Under 15 minutes</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button className="btn-primary" onClick={() => window.open(telegramSupportUrl, '_blank')}>
                <Send size={16} /> Open @Devraj069
              </button>
              <button className="btn-secondary" onClick={() => setActiveModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Claim Lifafa (Promo Code) Modal */}
      {activeModal === 'lifafa' && (
        <div style={modalOverlayStyle}>
          <div className="glass-card" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Gift size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>Claim Lifafa (Promo Code)</h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Instant Cash Coins Drop</div>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <form onSubmit={handleClaimLifafa}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                Enter the secret <strong style={{ color: '#fff' }}>Lifafa promo code</strong> released on our official Telegram channel to claim free Coins directly to your wallet!
              </div>

              <div className="input-group" style={{ marginBottom: '14px' }}>
                <label className="input-label" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ENTER LIFAFA / PROMO CODE</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. SURVEYKING, SATYA100"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.08em', color: 'var(--accent-gold)' }}
                    autoFocus
                  />
                </div>
              </div>

              {promoMessage && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: 'var(--accent-green)', padding: '10px 12px', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Sparkles size={18} />
                  <span>{promoMessage}</span>
                </div>
              )}

              {promoError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#ef4444', padding: '10px 12px', borderRadius: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <AlertCircle size={18} />
                  <span>{promoError}</span>
                </div>
              )}

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '10px', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Need daily Lifafa codes?</span>
                <a href={telegramChannelUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>
                  Join @SatyainfotechNetworks →
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                <button type="submit" className="btn-primary" disabled={promoLoading || !promoCode.trim()} style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', color: '#fff' }}>
                  <Gift size={16} />
                  <span>{promoLoading ? 'Verifying Lifafa...' : 'Claim Instant Lifafa 🎁'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Join Telegram Channel Modal */}
      {activeModal === 'telegram' && (
        <div style={modalOverlayStyle}>
          <div className="glass-card" style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>Official Telegram Channel</h3>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>@SatyainfotechNetworks</div>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Join our official channel to get:
              <ul style={{ margin: '8px 0 0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>🎁 <strong>Daily Lifafa Codes</strong> (Free bonus coins)</li>
                <li>⚡ <strong>High-Paying Survey Alerts</strong> (₹50 - ₹500/survey)</li>
                <li>🏆 <strong>Weekly Leaderboards & Giveaways</strong></li>
                <li>📢 <strong>Instant Platform Updates & Withdrawal Proofs</strong></li>
              </ul>
            </div>

            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', color: '#fff' }} onClick={() => window.open(telegramChannelUrl, '_blank')}>
              <Send size={16} /> Join @SatyainfotechNetworks Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// Modal Styles
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '16px'
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '420px',
  background: 'rgba(15, 23, 42, 0.96)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  padding: '20px',
  borderRadius: '20px'
};

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '14px',
  paddingBottom: '12px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
};

const closeBtnStyle = {
  background: 'rgba(255, 255, 255, 0.08)',
  border: 'none',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  cursor: 'pointer'
};
