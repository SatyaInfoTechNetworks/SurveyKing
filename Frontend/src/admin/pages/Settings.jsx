import React, { useState } from 'react';
import { Settings, CreditCard, Radio, ShieldCheck, Copy, Check, Save } from 'lucide-react';

export default function SettingsPage({ settings, onSavePayoutMethod }) {
  const [copied, setCopied] = useState(false);

  const copyPostback = () => {
    if (settings?.cpxConfig?.postbackUrl) {
      navigator.clipboard.writeText(settings.cpxConfig.postbackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          ⚙️ Global Platform & Integrations Configuration
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
          Manage global economy rates, payout gateways, CPX Research cryptographic keys, and webhook endpoints.
        </p>
      </div>

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

      {/* Payment Gateways & Tiers */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <CreditCard size={18} color="#10b981" />
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>Supported Payout Methods & Tier Rates</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {settings?.payoutMethods?.map((m) => (
            <div key={m.id} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
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

                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', marginTop: '8px' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                  Method ID: {m.method_id}
                </div>

                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {m.tiers?.slice(0, 3).map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <span>{t.coins?.toLocaleString()} Coins</span>
                      <strong style={{ color: '#10b981' }}>₹{t.rupees}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSavePayoutMethod(m.id, !m.active, m.tiers)}
                style={{
                  marginTop: '14px',
                  background: m.active ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  border: m.active ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                  color: m.active ? '#ef4444' : '#10b981',
                  padding: '7px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {m.active ? 'Disable Method' : 'Enable Method'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
