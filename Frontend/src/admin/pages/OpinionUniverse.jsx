import React, { useState, useEffect } from 'react';
import { Globe, Search, Plus, ToggleLeft, ToggleRight, Star, Trash2, ExternalLink, RefreshCw, Zap, Clock, Coins, TrendingUp, CheckCircle, XCircle, MousePointerClick } from 'lucide-react';

const cardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
  padding: '20px'
};

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#fff',
  fontSize: '0.85rem',
  width: '100%',
  outline: 'none'
};

const btnPrimary = {
  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  color: '#000',
  border: 'none',
  borderRadius: '8px',
  padding: '9px 18px',
  fontSize: '0.84rem',
  fontWeight: 800,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px'
};

const btnSecondary = {
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  padding: '8px 16px',
  fontSize: '0.82rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px'
};

function CoinsInput({ surveyId, currentCoins, onSave }) {
  const [coins, setCoins] = useState(currentCoins || 0);
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/opinion-universe/surveys/${surveyId}/coins`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinsReward: coins })
      });
      const data = await res.json();
      if (data.success) onSave();
    } finally { setSaving(false); }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <input type="number" value={coins} onChange={e => setCoins(e.target.value)}
        style={{ ...inputStyle, width: '90px', padding: '6px 8px' }} min="0" />
      <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, padding: '6px 10px', fontSize: '0.75rem' }}>
        {saving ? '...' : 'Save'}
      </button>
    </div>
  );
}

export default function OpinionUniversePage({ onNotify }) {
  const [activeSubTab, setActiveSubTab] = useState('fetch');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [liveOffers, setLiveOffers] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [managedSurveys, setManagedSurveys] = useState([]);
  const [clicks, setClicks] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    if (activeSubTab === 'managed') loadManagedSurveys();
    else if (activeSubTab === 'clicks') loadClicks();
    else if (activeSubTab === 'conversions') loadConversions();
  }, [activeSubTab]);

  const loadManagedSurveys = async () => {
    try {
      const res = await fetch('/api/admin/opinion-universe/surveys');
      const data = await res.json();
      if (data.success) setManagedSurveys(data.surveys);
    } catch (e) { console.error(e); }
  };

  const loadClicks = async () => {
    try {
      const res = await fetch('/api/admin/opinion-universe/clicks');
      const data = await res.json();
      if (data.success) setClicks(data.clicks);
    } catch (e) { console.error(e); }
  };

  const loadConversions = async () => {
    try {
      const res = await fetch('/api/admin/opinion-universe/conversions');
      const data = await res.json();
      if (data.success) setConversions(data.conversions);
    } catch (e) { console.error(e); }
  };

  const handleFetch = async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/admin/opinion-universe/fetch');
      const data = await res.json();
      if (data.success) {
        setLiveOffers(data.offers);
        onNotify(`Fetched ${data.offers.length} live surveys from Opinion Universe!`);
      } else {
        setFetchError(data.error || 'Failed to fetch');
      }
    } catch (e) {
      setFetchError('Network error fetching surveys');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAddSurvey = async (offer) => {
    setAddingId(offer.offerId);
    try {
      const res = await fetch('/api/admin/opinion-universe/surveys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offer.offerId, offerName: offer.offerName, offerDesc: offer.offerDesc,
          offerUrlTemplate: offer.offerUrlTemplate, imageUrl: offer.imageUrl,
          payout: offer.payout, loi: offer.loi, ir: offer.ir,
          countries: offer.countries, devices: offer.devices
        })
      });
      const data = await res.json();
      if (data.success) onNotify(data.message);
      else alert(data.error || 'Failed to add');
    } finally { setAddingId(null); }
  };

  const handleTestSurvey = (offer) => {
    const testUrl = offer.offerUrlTemplate
      .replace(/{YOUR_CLICK_ID}/g, 'ADMIN_TEST_' + Date.now())
      .replace(/{YOUR_SOURCE_ID}/g, 'admin_test');
    window.open(testUrl, '_blank');
  };

  const handleToggleStatus = async (survey) => {
    setTogglingId(survey.id);
    try {
      const newStatus = survey.status === 'active' ? 'inactive' : 'active';
      const res = await fetch(`/api/admin/opinion-universe/surveys/${survey.id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) { onNotify(data.message); loadManagedSurveys(); }
    } finally { setTogglingId(null); }
  };

  const handleToggleFeature = async (survey) => {
    try {
      const res = await fetch(`/api/admin/opinion-universe/surveys/${survey.id}/feature`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !survey.is_featured })
      });
      const data = await res.json();
      if (data.success) { onNotify(data.message); loadManagedSurveys(); }
    } catch (e) { alert('Error'); }
  };

  const handleDeleteSurvey = async (survey) => {
    if (!window.confirm(`Remove "${survey.title}" from Survey King?`)) return;
    try {
      const res = await fetch(`/api/admin/opinion-universe/surveys/${survey.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { onNotify(data.message); loadManagedSurveys(); }
    } catch (e) { alert('Error'); }
  };

  const filteredOffers = liveOffers.filter(o => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return String(o.offerId).includes(term) || o.offerName?.toLowerCase().includes(term);
  });

  const subTabs = [
    { id: 'fetch', label: '🔍 Fetch & Add Surveys' },
    { id: 'managed', label: `📋 Managed Surveys (${managedSurveys.length})` },
    { id: 'clicks', label: `🖱️ Click Tracker (${clicks.length})` },
    { id: 'conversions', label: `💰 Conversions (${conversions.length})` }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: 46, height: 46, borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
          <Globe size={24} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>Opinion Universe</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', margin: '4px 0 0 0' }}>
            Fetch live surveys, select specific ones, track user clicks & conversions. Pub ID: <strong style={{ color: '#6366f1' }}>1863</strong>
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {subTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} style={{
            background: activeSubTab === tab.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
            border: activeSubTab === tab.id ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.06)',
            color: activeSubTab === tab.id ? '#a5b4fc' : 'var(--text-secondary, #94a3b8)',
            fontWeight: activeSubTab === tab.id ? 800 : 500,
            fontSize: '0.82rem', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ---- SUB-TAB: FETCH & ADD ---- */}
      {activeSubTab === 'fetch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Fetch Bar */}
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text" placeholder="Search by Offer ID or Survey Name..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '34px' }}
              />
            </div>
            <button onClick={handleFetch} disabled={fetchLoading} style={btnPrimary}>
              <RefreshCw size={15} style={{ animation: fetchLoading ? 'spin 1s linear infinite' : 'none' }} />
              {fetchLoading ? 'Fetching...' : 'Fetch Live Surveys'}
            </button>
          </div>

          {fetchError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#f87171', fontSize: '0.85rem' }}>
              ⚠️ {fetchError}
            </div>
          )}

          {liveOffers.length > 0 && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
              Showing <strong style={{ color: '#a5b4fc' }}>{filteredOffers.length}</strong> of <strong style={{ color: '#fff' }}>{liveOffers.length}</strong> surveys
            </div>
          )}

          {liveOffers.length === 0 && !fetchLoading && (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted, #64748b)' }}>
              <Globe size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Click <strong>"Fetch Live Surveys"</strong> to load the latest surveys from Opinion Universe API.</p>
            </div>
          )}

          {filteredOffers.map(offer => (
            <div key={offer.offerId} style={{ ...cardStyle, display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Survey Image */}
              {offer.imageUrl && (
                <img src={offer.imageUrl} alt="survey" style={{ width: 72, height: 72, borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} />
              )}

              {/* Survey Details */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    ID: {offer.offerId}
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {offer.offerType}
                  </span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    {offer.countries}
                  </span>
                </div>

                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{offer.offerName}</div>
                {offer.offerDesc && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '8px' }}>{offer.offerDesc}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { label: 'Payout', value: `$${offer.payout?.toFixed(3)}`, color: '#10b981' },
                    { label: 'LOI', value: `${offer.loi} mins`, color: '#f59e0b' },
                    { label: 'IR', value: `${offer.ir}%`, color: '#6366f1' },
                    { label: 'Devices', value: offer.devices, color: '#94a3b8' }
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 10px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={() => handleTestSurvey(offer)} style={btnSecondary}>
                    <ExternalLink size={14} /> Test Survey
                  </button>
                  <button
                    onClick={() => handleAddSurvey(offer)}
                    disabled={addingId === offer.offerId}
                    style={{ ...btnPrimary, opacity: addingId === offer.offerId ? 0.6 : 1 }}
                  >
                    <Plus size={14} />
                    {addingId === offer.offerId ? 'Adding...' : 'Add to Survey King'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- SUB-TAB: MANAGED SURVEYS ---- */}
      {activeSubTab === 'managed' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button onClick={loadManagedSurveys} style={btnSecondary}><RefreshCw size={14} /> Refresh</button>
          </div>
          {managedSurveys.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '50px', color: 'var(--text-muted,#64748b)' }}>
              No surveys added yet. Go to "Fetch & Add Surveys" to add your first survey.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {managedSurveys.map(s => (
                <div key={s.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {s.image_url && <img src={s.image_url} alt="" style={{ width: 52, height: 52, borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{s.title}</span>
                      {s.is_featured ? <span style={{ fontSize: '0.65rem', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '2px 7px', borderRadius: '5px', fontWeight: 800 }}>⭐ FEATURED</span> : null}
                      <span style={{ fontSize: '0.65rem', background: s.status === 'active' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)', color: s.status === 'active' ? '#10b981' : '#f87171', padding: '2px 7px', borderRadius: '5px', fontWeight: 800 }}>
                        {s.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ID: <strong style={{ color: '#a5b4fc' }}>{s.external_offer_id}</strong> &nbsp;•&nbsp;
                      Payout: <strong style={{ color: '#10b981' }}>${parseFloat(s.payout).toFixed(3)}</strong> &nbsp;•&nbsp;
                      LOI: <strong style={{ color: '#f59e0b' }}>{s.loi} min</strong> &nbsp;•&nbsp;
                      {s.countries}
                    </div>
                  </div>

                  {/* Coins Reward Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>COINS REWARD</div>
                    <CoinsInput surveyId={s.id} currentCoins={s.coins_reward} onSave={loadManagedSurveys} />
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => handleToggleFeature(s)}
                      title={s.is_featured ? 'Unfeature' : 'Feature'}
                      style={{ ...btnSecondary, padding: '7px 10px', color: s.is_featured ? '#f59e0b' : undefined }}
                    >
                      <Star size={14} fill={s.is_featured ? '#f59e0b' : 'none'} />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(s)}
                      disabled={togglingId === s.id}
                      title={s.status === 'active' ? 'Disable' : 'Enable'}
                      style={{ ...btnSecondary, padding: '7px 10px', color: s.status === 'active' ? '#10b981' : '#f87171' }}
                    >
                      {s.status === 'active' ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    </button>

                    <button onClick={() => handleDeleteSurvey(s)} style={{ ...btnSecondary, padding: '7px 10px', color: '#ef4444' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- SUB-TAB: CLICK TRACKER ---- */}
      {activeSubTab === 'clicks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button onClick={loadClicks} style={btnSecondary}><RefreshCw size={14} /> Refresh</button>
          </div>
          <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Click ID', 'User', 'Survey', 'Provider', 'Status', 'Started At', 'Completed At'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: '#64748b', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clicks.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No click records yet.</td></tr>
                ) : (
                  clicks.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px', color: '#a5b4fc', fontFamily: 'monospace', fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.click_id}</td>
                      <td style={{ padding: '12px 16px', color: '#fff' }}>{c.user_name || c.user_id}<br /><span style={{ color: '#64748b', fontSize: '0.72rem' }}>@{c.telegram_user_id}</span></td>
                      <td style={{ padding: '12px 16px', color: '#f59e0b', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.survey_title || c.external_offer_id}</td>
                      <td style={{ padding: '12px 16px' }}><span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 700 }}>{c.provider}</span></td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: c.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.12)', color: c.status === 'completed' ? '#10b981' : '#f59e0b', padding: '3px 8px', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 800 }}>
                          {c.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem' }}>{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem' }}>{c.completed_at ? new Date(c.completed_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- SUB-TAB: CONVERSIONS ---- */}
      {activeSubTab === 'conversions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button onClick={loadConversions} style={btnSecondary}><RefreshCw size={14} /> Refresh</button>
          </div>
          <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Conversion ID', 'Click ID', 'User', 'Survey', 'Provider Payout', 'Coins Rewarded', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', color: '#64748b', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {conversions.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No conversions yet.</td></tr>
                ) : (
                  conversions.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px', color: '#a5b4fc', fontFamily: 'monospace', fontSize: '0.72rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.conversion_id}</td>
                      <td style={{ padding: '12px 16px', color: '#6366f1', fontFamily: 'monospace', fontSize: '0.72rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.click_id}</td>
                      <td style={{ padding: '12px 16px', color: '#fff' }}>{c.user_name || c.user_id}</td>
                      <td style={{ padding: '12px 16px', color: '#f59e0b', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.survey_title}</td>
                      <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 700 }}>${parseFloat(c.provider_payout || 0).toFixed(4)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 800 }}>+{c.user_reward_coins}</span>
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}> 🪙</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '5px', fontSize: '0.72rem', fontWeight: 800 }}>
                          {c.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.75rem' }}>{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

