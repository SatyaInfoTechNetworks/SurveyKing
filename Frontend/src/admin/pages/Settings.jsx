import React, { useState } from 'react';
import { Settings, CreditCard, Radio, ShieldCheck, Copy, Check, Save, Plus, Trash2, Edit3, X, Gift } from 'lucide-react';

export default function SettingsPage({
  settings,
  onSavePayoutMethod,
  onCreatePayoutMethod,
  onDeletePayoutMethod,
  onSaveReferralSettings,
  savingReferral
}) {
  const [copied, setCopied] = useState(false);

  // New Method Modal
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodId, setNewMethodId] = useState('');
  const [newMethodIcon, setNewMethodIcon] = useState('💳');
  const [newMethodPlaceholder, setNewMethodPlaceholder] = useState('Enter account / address');
  const [newMethodTiers, setNewMethodTiers] = useState([
    { coins: 2500, rupees: 5 },
    { coins: 5000, rupees: 10 },
    { coins: 10000, rupees: 20 }
  ]);

  // Referral Settings State
  const [refereeCoins, setRefereeCoins] = useState(settings?.referralSettings?.referee_reward_coins || 500);
  const [referrerCoins, setReferrerCoins] = useState(settings?.referralSettings?.referrer_reward_coins || 1000);
  const [minSurveyCoins, setMinSurveyCoins] = useState(settings?.referralSettings?.min_survey_reward_coins || 100);
  const [trigger, setTrigger] = useState(settings?.referralSettings?.referral_trigger || 'FIRST_SURVEY');

  const copyPostback = () => {
    if (settings?.cpxConfig?.postbackUrl) {
      navigator.clipboard.writeText(settings.cpxConfig.postbackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddTierToNewMethod = () => {
    setNewMethodTiers([...newMethodTiers, { coins: 5000, rupees: 10 }]);
  };

  const handleRemoveTierFromNewMethod = (index) => {
    setNewMethodTiers(newMethodTiers.filter((_, i) => i !== index));
  };

  const handleCreateMethodSubmit = (e) => {
    e.preventDefault();
    if (!newMethodName || !newMethodId) return alert('Name and Method ID are required');
    onCreatePayoutMethod({
      name: newMethodName,
      method_id: newMethodId,
      icon: newMethodIcon,
      placeholder: newMethodPlaceholder,
      tiers: newMethodTiers,
      active: true
    });
    setShowAddMethodModal(false);
    setNewMethodName('');
    setNewMethodId('');
  };

  const handleAddTierToExisting = (method) => {
    const updatedTiers = [...(method.tiers || []), { coins: 5000, rupees: 10 }];
    onSavePayoutMethod(method.id, method.active, updatedTiers);
  };

  const handleRemoveTierFromExisting = (method, tierIdx) => {
    const updatedTiers = method.tiers.filter((_, idx) => idx !== tierIdx);
    onSavePayoutMethod(method.id, method.active, updatedTiers);
  };

  const handleUpdateTierValue = (method, tierIdx, field, val) => {
    const updatedTiers = method.tiers.map((t, idx) => {
      if (idx === tierIdx) {
        return { ...t, [field]: parseFloat(val) || 0 };
      }
      return t;
    });
    onSavePayoutMethod(method.id, method.active, updatedTiers);
  };

  const handleSaveReferral = (e) => {
    e.preventDefault();
    onSaveReferralSettings({
      refereeRewardCoins: parseInt(refereeCoins, 10),
      referrerRewardCoins: parseInt(referrerCoins, 10),
      minSurveyRewardCoins: parseInt(minSurveyCoins, 10),
      referralTrigger: trigger
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          ⚙️ Global Platform & Integrations Configuration
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
          Manage global economy rates, payout gateways, custom reward tiers, joining bonuses, and CPX webhook configuration.
        </p>
      </div>

      {/* Top Grid: Economy & CPX Integration */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left: General Economy & Exchange Rate */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} color="#f59e0b" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>General Economy Rules</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Platform Exchange Rate</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                1,000 Coins = ₹10.00 INR (100 Coins = ₹1.00)
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>Minimum Withdrawal Threshold</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                2,500 Coins (₹5.00 INR)
              </div>
            </div>
          </div>
        </div>

        {/* Right: CPX Research Configuration */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={18} color="#ec4899" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>CPX Research Integration</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>App ID</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>35805</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>Security Hash</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', marginTop: '2px', fontFamily: 'monospace' }}>●●●●●●●●●●●●●●</div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>Main Postback URL</span>
                <button
                  onClick={copyPostback}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f59e0b',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy URL'}</span>
                </button>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px 10px',
                fontSize: '0.74rem',
                fontFamily: 'monospace',
                color: '#94a3b8',
                wordBreak: 'break-all'
              }}>
                {settings?.cpxConfig?.postbackUrl}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral & Instant Joining Bonus Configuration */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Gift size={18} color="#f59e0b" />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Referral Joining Bonus & Qualification Settings</span>
        </div>

        <form onSubmit={handleSaveReferral} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
              Friend Instant Joining Bonus (Coins) *
            </label>
            <input
              type="number"
              value={refereeCoins}
              onChange={(e) => setRefereeCoins(e.target.value)}
              placeholder="500"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#10b981',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>
              Credited instantly on signup with friend's code (≈ ₹{(refereeCoins / 100).toFixed(2)})
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
              Inviter Reward (Coins) *
            </label>
            <input
              type="number"
              value={referrerCoins}
              onChange={(e) => setReferrerCoins(e.target.value)}
              placeholder="1000"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#f59e0b',
                fontWeight: 800,
                fontSize: '0.85rem'
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#f59e0b', marginTop: '2px' }}>
              Credited to inviter upon friend's first survey (≈ ₹{(referrerCoins / 100).toFixed(2)})
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
              placeholder="100"
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '9px 12px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
              Prevents dummy low payout qualification
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={savingReferral}
              style={{
                width: '100%',
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
              <span>{savingReferral ? 'Saving...' : 'Save Referral Rules'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Payment Gateways, Custom Methods, and Tier Management */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#10b981" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Supported Payout Methods & Tier Rates</span>
          </div>

          <button
            onClick={() => setShowAddMethodModal(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}
          >
            <Plus size={14} /> Add New Payout Method
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {settings?.payoutMethods?.map((m) => (
            <div key={m.id} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '14px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{m.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>ID: {m.method_id}</div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    background: m.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: m.active ? '#10b981' : '#ef4444'
                  }}>
                    {m.active ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>

                {/* Tiers List */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                      Redeem Tiers ({m.tiers?.length || 0})
                    </span>
                    <button
                      onClick={() => handleAddTierToExisting(m)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#f59e0b',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <Plus size={11} /> Add Tier
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                    {m.tiers?.map((t, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '6px 8px',
                        borderRadius: '6px'
                      }}>
                        <input
                          type="number"
                          value={t.coins}
                          onChange={(e) => handleUpdateTierValue(m, idx, 'coins', e.target.value)}
                          style={{
                            width: '90px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            padding: '3px 6px',
                            color: '#f59e0b',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>🪙 = ₹</span>
                        <input
                          type="number"
                          value={t.rupees}
                          onChange={(e) => handleUpdateTierValue(m, idx, 'rupees', e.target.value)}
                          style={{
                            width: '60px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            padding: '3px 6px',
                            color: '#10b981',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        />
                        <button
                          onClick={() => handleRemoveTierFromExisting(m, idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '2px',
                            marginLeft: 'auto'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
                <button
                  onClick={() => onSavePayoutMethod(m.id, !m.active, m.tiers)}
                  style={{
                    flex: 1,
                    background: m.active ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    border: m.active ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                    color: m.active ? '#ef4444' : '#10b981',
                    padding: '7px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {m.active ? 'Disable' : 'Enable'}
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to permanently delete payout method "${m.name}"?`)) {
                      onDeletePayoutMethod(m.id);
                    }
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '7px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add New Payout Method */}
      {showAddMethodModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '460px',
            maxWidth: '100%',
            background: '#0d131f',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} color="#10b981" /> Add New Payout Gateway / Method
              </div>
              <button onClick={() => setShowAddMethodModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMethodSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                  Method Name * (e.g. Google Play Card, Paytm Wallet, Crypto USDT)
                </label>
                <input
                  type="text"
                  required
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  placeholder="e.g. Google Play Card"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                    Method ID * (e.g. GPAY, PAYTM, USDT)
                  </label>
                  <input
                    type="text"
                    required
                    value={newMethodId}
                    onChange={(e) => setNewMethodId(e.target.value.toUpperCase())}
                    placeholder="GPAY"
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                    Icon Emoji
                  </label>
                  <input
                    type="text"
                    value={newMethodIcon}
                    onChange={(e) => setNewMethodIcon(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                  Input Placeholder Text for User
                </label>
                <input
                  type="text"
                  value={newMethodPlaceholder}
                  onChange={(e) => setNewMethodPlaceholder(e.target.value)}
                  placeholder="e.g. Enter Email / Phone Number"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Tiers in Modal */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                    Payout Redeem Tiers
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTierToNewMethod}
                    style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    + Add Tier
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {newMethodTiers.map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        placeholder="Coins"
                        value={t.coins}
                        onChange={(e) => {
                          const updated = newMethodTiers.map((item, i) => i === idx ? { ...item, coins: parseInt(e.target.value) || 0 } : item);
                          setNewMethodTiers(updated);
                        }}
                        style={{
                          width: '110px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          color: '#f59e0b',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      />
                      <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.8rem' }}>🪙 = ₹</span>
                      <input
                        type="number"
                        placeholder="INR"
                        value={t.rupees}
                        onChange={(e) => {
                          const updated = newMethodTiers.map((item, i) => i === idx ? { ...item, rupees: parseFloat(e.target.value) || 0 } : item);
                          setNewMethodTiers(updated);
                        }}
                        style={{
                          width: '80px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          color: '#10b981',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTierFromNewMethod(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '11px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Create Payout Method
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
