import React from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  Share2,
  Wallet,
  CreditCard,
  Radio,
  Bot,
  ShieldAlert,
  FileText,
  TrendingUp,
  Settings,
  Crown,
  ChevronRight,
  LogOut
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, onExitAdmin, pendingCount = 0 }) {
  const menuGroups = [
    {
      label: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      label: 'MANAGEMENT',
      items: [
        { id: 'users', label: 'Users', icon: Users },
        { id: 'surveys', label: 'Surveys', icon: Target },
        { id: 'referrals', label: 'Referrals', icon: Share2 }
      ]
    },
    {
      label: 'MONEY & PAYOUTS',
      items: [
        { id: 'wallet', label: 'Wallet Ledger', icon: Wallet },
        { id: 'withdrawals', label: 'Withdrawals', icon: CreditCard, badge: pendingCount > 0 ? pendingCount : null }
      ]
    },
    {
      label: 'INTEGRATIONS',
      items: [
        { id: 'postbacks', label: 'Postbacks & Logs', icon: Radio },
        { id: 'telegram', label: 'Telegram Bot', icon: Bot }
      ]
    },
    {
      label: 'SECURITY & AUDIT',
      items: [
        { id: 'fraud', label: 'Fraud & Risk', icon: ShieldAlert },
        { id: 'audit', label: 'Audit Logs', icon: FileText }
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'settings', label: 'Platform Settings', icon: Settings }
      ]
    }
  ];

  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      background: 'rgba(10, 14, 23, 0.98)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
          flexShrink: 0
        }}>
          <Crown size={22} color="#000" />
        </div>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>SURVEY KING</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            👑 Enterprise Suite
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {menuGroups.map((grp, gIdx) => (
          <div key={gIdx}>
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.4)',
              letterSpacing: '0.08em',
              padding: '0 10px 6px 10px',
              textTransform: 'uppercase'
            }}>
              {grp.label}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)'
                        : 'transparent',
                      color: isActive ? '#f59e0b' : 'var(--text-secondary, #94a3b8)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={17} color={isActive ? '#f59e0b' : 'currentColor'} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '9999px',
                        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                      }}>
                        {item.badge}
                      </span>
                    ) : (
                      isActive && <ChevronRight size={14} color="#f59e0b" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info & Exit */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.8rem',
            color: '#f59e0b'
          }}>
            SA
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>Super Admin</div>
            <div style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
              Connected
            </div>
          </div>
        </div>

        <button
          onClick={onExitAdmin}
          title="Exit to User App"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #64748b)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
