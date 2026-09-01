import React from 'react';
import { FileText, Shield, User, Clock, Terminal } from 'lucide-react';

export default function AuditLogsPage({ logs }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          📝 Administrative Immutable Audit Ledger
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
          Zero silent modifications. Every balance adjustment, ban/unban, withdrawal approval, and rule change is permanently recorded.
        </p>
      </div>

      {/* Audit Logs Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TIMESTAMP</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>ADMIN</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>ACTION</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TARGET</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>OLD VALUE ➔ NEW VALUE</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>REASON</th>
              <th style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>IP ADDRESS</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #64748b)' }}>
                  No administrative audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#f59e0b' }}>
                      <User size={13} />
                      <span>{log.admin_username}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: log.action.includes('BAN') || log.action.includes('REJECT') ? 'rgba(239, 68, 68, 0.15)' : (log.action.includes('APPROVE') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
                      color: log.action.includes('BAN') || log.action.includes('REJECT') ? '#ef4444' : (log.action.includes('APPROVE') ? '#10b981' : '#60a5fa')
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#fff', fontSize: '0.8rem' }}>
                    {log.target_type} #{log.target_id || ''}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                    <span style={{ color: '#ef4444' }}>{log.old_value || 'NULL'}</span>
                    <span style={{ color: 'var(--text-muted, #64748b)', margin: '0 4px' }}>➔</span>
                    <span style={{ color: '#10b981' }}>{log.new_value || 'NULL'}</span>
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.78rem' }}>
                    {log.reason || 'N/A'}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                    {log.ip || '127.0.0.1'}
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
