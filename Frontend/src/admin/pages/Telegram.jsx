import React, { useState, useEffect } from 'react';
import { Bot, Send, CheckCircle, XCircle, RefreshCw, MessageSquare, Radio, Play, Pause, X, Clock, Layers } from 'lucide-react';

export default function TelegramPage({ botStatus, notifications, onSendBroadcast, broadcastLoading }) {
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch('/api/admin/telegram/broadcast-jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (e) {
      console.error('Error fetching broadcast jobs:', e);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const timer = setInterval(fetchJobs, 3000); // Live poll job progress
    return () => clearInterval(timer);
  }, []);

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastMsg) return alert('Please enter message text');

    try {
      const res = await fetch('/api/admin/telegram/broadcast-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetUser ? `Direct Message to TG #${targetUser}` : 'All Users Background Broadcast',
          message: broadcastMsg,
          targetUserId: targetUser || null,
          scheduledFor: scheduledTime || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastMsg('');
        setTargetUser('');
        setScheduledTime('');
        fetchJobs();
        alert('🚀 Background broadcast job created successfully! Sending in background.');
      } else {
        alert(data.error || 'Failed to create broadcast job');
      }
    } catch (e) {
      alert('Network error creating broadcast job');
    }
  };

  const handleJobAction = async (jobId, action) => {
    try {
      const res = await fetch(`/api/admin/telegram/broadcast-jobs/${jobId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        fetchJobs();
      }
    } catch (e) {
      alert('Failed to update job status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            🤖 Telegram Bot Management & Background Jobs Center
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Real-time status monitoring of @survey_king_bot, background worker queue, and scheduled cron broadcasts.
          </p>
        </div>
      </div>

      {/* Bot Health & KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>BOT STATUS</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            ONLINE & LISTENING
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Polling Active 🟢</div>
        </div>

        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>BOT USERNAME</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
            @survey_king_bot
          </div>
          <div style={{ fontSize: '0.7rem', color: '#60a5fa', marginTop: '2px' }}>Verified Mini App Bot</div>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>ACTIVE TELEGRAM USERS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {botStatus?.totalUsers || 0}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Active Today: {botStatus?.activeToday || 0}</div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>BACKGROUND JOBS</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
            {jobs.length} Active
          </div>
          <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '2px' }}>Cron & Queue Manager</div>
        </div>
      </div>

      {/* Main Grid: Broadcast Creator & Job Manager */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px' }}>
        {/* Left: Broadcast Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '20px',
          height: 'fit-content'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MessageSquare size={18} color="#f59e0b" />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Start Background Broadcast</span>
          </div>

          <form onSubmit={handleBroadcastSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Target User (Leave empty for All Users)
              </label>
              <input
                type="text"
                placeholder="Telegram User ID (Optional)"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Schedule Execution (Optional Cron / Delay)
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                Broadcast Message (Markdown Supported) *
              </label>
              <textarea
                rows={5}
                required
                placeholder="🎉 New High Paying Survey Available! Earn +10,000 Coins right now inside Survey King 👑"
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                padding: '11px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Send size={15} />
              <span>Queue Background Job</span>
            </button>
          </form>
        </div>

        {/* Right: Background Broadcast Jobs Manager */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Background Jobs Queue */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#60a5fa" />
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Background & Scheduled Jobs Queue</span>
              </div>
              <button onClick={fetchJobs} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {jobs.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.82rem' }}>
                  No active or scheduled broadcast jobs in queue.
                </div>
              ) : (
                jobs.map((job) => {
                  const pct = job.progressPct ?? (job.totalCount > 0 ? Math.round((job.processedCount / job.totalCount) * 100) : 100);
                  const isProcessing = job.status === 'PROCESSING' || job.status === 'QUEUED';

                  return (
                    <div key={job.id} style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{job.title}</span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                            Created: {new Date(job.createdAt).toLocaleTimeString()} {job.scheduledFor ? `| Scheduled: ${new Date(job.scheduledFor).toLocaleString()}` : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            background: job.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : (job.status === 'PROCESSING' ? 'rgba(59, 130, 246, 0.15)' : (job.status === 'PAUSED' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)')),
                            color: job.status === 'COMPLETED' ? '#10b981' : (job.status === 'PROCESSING' ? '#60a5fa' : (job.status === 'PAUSED' ? '#f59e0b' : '#ef4444'))
                          }}>
                            {job.status}
                          </span>

                          {isProcessing && (
                            <button
                              onClick={() => handleJobAction(job.id, 'PAUSE')}
                              style={{ background: 'rgba(245, 158, 11, 0.2)', border: 'none', color: '#f59e0b', borderRadius: '4px', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
                            >
                              Pause
                            </button>
                          )}
                          {job.status === 'PAUSED' && (
                            <button
                              onClick={() => handleJobAction(job.id, 'RESUME')}
                              style={{ background: 'rgba(16, 185, 129, 0.2)', border: 'none', color: '#10b981', borderRadius: '4px', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
                            >
                              Resume
                            </button>
                          )}
                          {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleJobAction(job.id, 'CANCEL')}
                              style={{ background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444', borderRadius: '4px', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '4px' }}>
                          <span>Progress: {job.processedCount} / {job.totalCount} sent ({job.successCount} ok, {job.failedCount} failed)</span>
                          <span style={{ fontWeight: 800, color: '#60a5fa' }}>{pct}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)', borderRadius: '9999px', transition: 'width 0.3s ease' }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Live Stream Ledger */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
              Live Message Dispatch Ledger ({notifications.length})
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>RECIPIENT (TG ID)</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>TYPE</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>MESSAGE SNIPPET</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700 }}>DELIVERY</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted, #64748b)', fontWeight: 700, textAlign: 'right' }}>TIME</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted, #64748b)' }}>
                      No telegram notification dispatches logged yet.
                    </td>
                  </tr>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#fff', fontWeight: 600 }}>
                        {n.telegram_user_id}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b'
                        }}>
                          {n.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.78rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.message}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: n.status === 'SENT' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: n.status === 'SENT' ? '#10b981' : '#ef4444'
                        }}>
                          {n.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                        {new Date(n.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
