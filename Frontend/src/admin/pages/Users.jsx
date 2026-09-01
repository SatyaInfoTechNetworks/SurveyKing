import React, { useState } from 'react';
import { Search, Users, UserCheck, Ban, ShieldAlert, ArrowRight, Eye, Plus, Minus, Trash2 } from 'lucide-react';

export default function UsersPage({ users, onSelectUser, onRefresh, onDeleteUser, search, setSearch, filter, setFilter }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            User Management & Identity
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Inspect Telegram accounts, review survey participation history, adjust balances, and enforce security policies.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 800, background: 'rgba(245, 158, 11, 0.12)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            Total Users: {users.length}
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, maxWidth: '450px' }}>
          <Search size={16} color="var(--text-muted, #64748b)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by Name, Username, Telegram ID, or Referral Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '8px 12px 8px 36px',
              fontSize: '0.85rem',
              color: '#fff',
              outline: 'none'
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'All Users' },
            { id: 'ACTIVE', label: 'Active Only' },
            { id: 'BANNED', label: 'Banned Accounts' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: filter === f.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: filter === f.id ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                color: filter === f.id ? '#f59e0b' : 'var(--text-secondary, #94a3b8)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: filter === f.id ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>USER</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TELEGRAM ID</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>COIN BALANCE</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>SURVEYS</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>REFERRALS</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>STATUS</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #64748b)' }}>
                  No users found matching your search filter.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => onSelectUser(u.id)}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* User Profile */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        color: '#000',
                        flexShrink: 0
                      }}>
                        {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{u.name || 'Anonymous'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>{u.username}</div>
                      </div>
                    </div>
                  </td>

                  {/* Telegram ID */}
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary, #94a3b8)', fontFamily: 'monospace' }}>
                    {u.telegramUserId}
                  </td>

                  {/* Balance */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 800, color: '#f59e0b' }}>
                      {u.balance.toLocaleString()} 🪙
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981' }}>≈ ₹{u.rupeeValue}</div>
                  </td>

                  {/* Surveys */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{u.surveysCompleted}</span>
                    <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}> / {u.surveysTotal}</span>
                  </td>

                  {/* Referrals */}
                  <td style={{ padding: '14px 18px', color: '#60a5fa', fontWeight: 700 }}>
                    {u.referralsCount} Qualified
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: u.status === 'ACTIVE' ? '#10b981' : '#ef4444',
                      border: u.status === 'ACTIVE' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                    }}>
                      {u.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectUser(u.id); }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={13} /> View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to permanently delete user "${u.name}" (#${u.telegramUserId})?`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#ef4444',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
