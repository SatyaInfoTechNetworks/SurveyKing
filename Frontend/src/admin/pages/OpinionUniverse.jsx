import React, { useState, useEffect } from 'react';
import { Globe, Search, Plus, ToggleLeft, ToggleRight, Star, Trash2, ExternalLink, RefreshCw, Zap, Clock, Coins, TrendingUp, CheckCircle, XCircle, MousePointerClick, Copy, FileText, RotateCcw, Link2, ArrowUpDown } from 'lucide-react';

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
  outline: 'none',
  fontFamily: 'inherit',
  cursor: 'pointer'
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

function SurveyExtraInfoEditor({ survey, onSave, onCancel }) {
  const [description, setDescription] = useState(survey.description || '');
  const [qualificationTips, setQualificationTips] = useState(survey.qualification_tips || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/opinion-universe/surveys/${survey.id}/extra-info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, qualificationTips })
      });
      const data = await res.json();
      if (data.success) {
        onSave(data.message);
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch (e) {
      alert('Error saving: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      marginTop: '12px',
      padding: '14px 16px',
      background: 'rgba(0,0,0,0.35)',
      border: '1px solid rgba(99,102,241,0.35)',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>💡</span> Extra Info & How to Qualify Guide
        </div>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          This guidance will be shown directly to users on the survey card.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
            ABOUT THIS SURVEY (Description / Topic)
          </div>
          <textarea
            rows={3}
            placeholder="e.g. Consumer lifestyle survey about online shopping habits..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical', width: '100%', cursor: 'text' }}
          />
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>
            🎯 HOW TO QUALIFY WELL (Tips & Requirements)
          </div>
          <textarea
            rows={3}
            placeholder="e.g. • Must be 25-45 years old&#10;• Answer attentively without rushing&#10;• Select primary household decision maker"
            value={qualificationTips}
            onChange={e => setQualificationTips(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical', width: '100%', borderColor: 'rgba(16,185,129,0.35)', cursor: 'text' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button onClick={onCancel} style={{ ...btnSecondary, padding: '7px 14px' }}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, padding: '7px 16px' }}>
          {saving ? 'Saving...' : '💾 Save Qualify Tips'}
        </button>
      </div>
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
  const [trashSurveys, setTrashSurveys] = useState([]);
  const [managedView, setManagedView] = useState('active');
  const [expandedLinkId, setExpandedLinkId] = useState(null);
  const [clicks, setClicks] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [editingTipsSurveyId, setEditingTipsSurveyId] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  // API Filters
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterType, setFilterType] = useState('live_surveys');
  const [filterPayoutType, setFilterPayoutType] = useState('All');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxLoi, setFilterMaxLoi] = useState('');
  const [filterMinIr, setFilterMinIr] = useState('');
  const [fetchSortBy, setFetchSortBy] = useState('amount_desc');
  // Managed Surveys filters & sorting
  const [managedSearch, setManagedSearch] = useState('');
  const [managedFilterStatus, setManagedFilterStatus] = useState('ALL');
  const [managedSortBy, setManagedSortBy] = useState('featured');
  // History Tracker states
  const [historyFilterStatus, setHistoryFilterStatus] = useState('ALL');
  const [historySearch, setHistorySearch] = useState('');
  const [historySortBy, setHistorySortBy] = useState('date_desc');
  const [copiedClickId, setCopiedClickId] = useState(null);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedClickId(text);
    setTimeout(() => setCopiedClickId(null), 2000);
  };

  useEffect(() => {
    if (activeSubTab === 'managed') loadManagedSurveys();
    else if (activeSubTab === 'clicks') loadClicks();
    else if (activeSubTab === 'conversions') loadConversions();
  }, [activeSubTab]);

  const loadManagedSurveys = async () => {
    try {
      const [resActive, resTrash] = await Promise.all([
        fetch('/api/admin/opinion-universe/surveys'),
        fetch('/api/admin/opinion-universe/surveys?status=deleted')
      ]);
      const dataActive = await resActive.json();
      const dataTrash = await resTrash.json();
      if (dataActive.success) setManagedSurveys(dataActive.surveys);
      if (dataTrash.success) setTrashSurveys(dataTrash.surveys);
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
      const params = new URLSearchParams();
      if (filterCountry !== 'All') params.set('country', filterCountry);
      if (filterPlatform !== 'All') params.set('platform', filterPlatform);
      params.set('type', filterType);
      if (filterPayoutType !== 'All') params.set('payoutType', filterPayoutType);

      const qs = params.toString();
      const res = await fetch(`/api/admin/opinion-universe/fetch${qs ? '?' + qs : ''}`);
      const data = await res.json();
      console.log('[OU] Fetch response:', data);
      if (data.success) {
        setLiveOffers(data.offers);
        onNotify(`Fetched ${data.offers.length} live surveys from Opinion Universe!`);
      } else {
        const errMsg = data.error || 'Unknown error';
        const rawInfo = data.raw ? ` | Raw: ${JSON.stringify(data.raw)}` : '';
        console.error('[OU] API Error:', errMsg, data.raw || '');
        setFetchError(errMsg + rawInfo);
      }
    } catch (e) {
      console.error('[OU] Network error:', e);
      setFetchError('Network error: ' + e.message);
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
          amount: offer.amount, payout: offer.payout, loi: offer.loi, ir: offer.ir,
          countries: offer.countries, devices: offer.devices,
          coinsReward: offer.amount
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

  const handleMoveToTrash = async (survey) => {
    if (!window.confirm(`Move "${survey.title}" to Trash (Temporary Deleted Area)?`)) return;
    try {
      const res = await fetch(`/api/admin/opinion-universe/surveys/${survey.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onNotify(data.message);
        loadManagedSurveys();
      } else alert(data.error || 'Failed to move to trash');
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleRestoreSurvey = async (survey) => {
    try {
      const res = await fetch(`/api/admin/opinion-universe/surveys/${survey.id}/restore`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        onNotify(data.message);
        loadManagedSurveys();
      } else alert(data.error || 'Failed to restore');
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handlePermanentDelete = async (survey) => {
    if (!window.confirm(`⚠️ PERMANENT DELETE WARNING:\n\nAre you sure you want to permanently delete "${survey.title}" from the database?\n\nThis CANNOT be undone!`)) return;
    try {
      const res = await fetch(`/api/admin/opinion-universe/surveys/${survey.id}/permanent`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onNotify(data.message);
        loadManagedSurveys();
      } else alert(data.error || 'Failed to delete permanently');
    } catch (e) { alert('Error: ' + e.message); }
  };

  const handleTestManagedSurvey = (survey) => {
    const testUrl = (survey.survey_url_template || '')
      .replace(/{YOUR_CLICK_ID}/g, 'ADMIN_TEST_' + Date.now())
      .replace(/{YOUR_SOURCE_ID}/g, 'admin_test');
    window.open(testUrl, '_blank');
  };

  const filteredOffers = liveOffers.filter(o => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || String(o.offerId).includes(term) || o.offerName?.toLowerCase().includes(term);
    const matchAmount = !filterMinAmount || Number(o.amount || 0) >= parseInt(filterMinAmount, 10);
    const matchLoi    = !filterMaxLoi    || parseInt(o.loi)     <= parseInt(filterMaxLoi);
    const matchIr     = !filterMinIr     || parseInt(o.ir)      >= parseInt(filterMinIr);
    return matchSearch && matchAmount && matchLoi && matchIr;
  }).sort((a, b) => {
    if (fetchSortBy === 'amount_desc') return (Number(b.amount) || 0) - (Number(a.amount) || 0);
    if (fetchSortBy === 'amount_asc')  return (Number(a.amount) || 0) - (Number(b.amount) || 0);
    if (fetchSortBy === 'payout_desc') return (parseFloat(b.payout) || 0) - (parseFloat(a.payout) || 0);
    if (fetchSortBy === 'loi_asc')     return (parseInt(a.loi) || 0) - (parseInt(b.loi) || 0);
    if (fetchSortBy === 'loi_desc')    return (parseInt(b.loi) || 0) - (parseInt(a.loi) || 0);
    if (fetchSortBy === 'ir_desc')     return (parseInt(b.ir) || 0) - (parseInt(a.ir) || 0);
    if (fetchSortBy === 'name_asc')    return (a.offerName || '').localeCompare(b.offerName || '');
    return 0;
  });

  const filteredManagedSurveys = managedSurveys.filter(s => {
    const term = managedSearch.toLowerCase();
    const matchSearch = !managedSearch ||
      String(s.external_offer_id).includes(term) ||
      (s.title || '').toLowerCase().includes(term) ||
      (s.countries || '').toLowerCase().includes(term);
    const matchStatus = managedFilterStatus === 'ALL' ||
      (managedFilterStatus === 'active' && s.status === 'active') ||
      (managedFilterStatus === 'inactive' && s.status === 'inactive') ||
      (managedFilterStatus === 'featured' && s.is_featured === 1);
    return matchSearch && matchStatus;
  }).sort((a, b) => {
    if (managedSortBy === 'featured') {
      if (b.is_featured !== a.is_featured) return b.is_featured ? 1 : -1;
      return (b.coins_reward || 0) - (a.coins_reward || 0);
    }
    if (managedSortBy === 'coins_desc') return (b.coins_reward || 0) - (a.coins_reward || 0);
    if (managedSortBy === 'coins_asc')  return (a.coins_reward || 0) - (b.coins_reward || 0);
    if (managedSortBy === 'loi_asc')     return (parseInt(a.loi) || 0) - (parseInt(b.loi) || 0);
    if (managedSortBy === 'loi_desc')    return (parseInt(b.loi) || 0) - (parseInt(a.loi) || 0);
    if (managedSortBy === 'newest')      return (b.id || 0) - (a.id || 0);
    if (managedSortBy === 'oldest')      return (a.id || 0) - (b.id || 0);
    if (managedSortBy === 'title')       return (a.title || '').localeCompare(b.title || '');
    return 0;
  });

  const filteredClicks = clicks.filter(c => {
    const statusMatch = historyFilterStatus === 'ALL' || c.display_status === historyFilterStatus;
    const term = historySearch.toLowerCase();
    const searchMatch = !historySearch ||
      String(c.user_id).includes(term) ||
      c.user_name?.toLowerCase().includes(term) ||
      c.telegram_user_id?.toLowerCase().includes(term) ||
      c.click_id?.toLowerCase().includes(term) ||
      c.survey_title?.toLowerCase().includes(term) ||
      String(c.external_offer_id).includes(term) ||
      c.conversion_id?.toLowerCase().includes(term);
    return statusMatch && searchMatch;
  }).sort((a, b) => {
    if (historySortBy === 'date_desc') return new Date(b.clicked_at || 0) - new Date(a.clicked_at || 0);
    if (historySortBy === 'date_asc')  return new Date(a.clicked_at || 0) - new Date(b.clicked_at || 0);
    if (historySortBy === 'coins_desc') return (Number(b.user_reward_coins) || 0) - (Number(a.user_reward_coins) || 0);
    if (historySortBy === 'coins_asc')  return (Number(a.user_reward_coins) || 0) - (Number(b.user_reward_coins) || 0);
    return 0;
  });

  const subTabs = [
    { id: 'fetch', label: '🔍 Fetch & Add Surveys' },
    { id: 'managed', label: `📋 Managed Surveys (${managedSurveys.length})${trashSurveys.length > 0 ? ` [${trashSurveys.length} in trash]` : ''}` },
    { id: 'clicks', label: `📊 Offer History & Transactions (${clicks.length})` },
    { id: 'conversions', label: `💰 Conversions Log (${conversions.length})` }
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

          {/* Filter Panel */}
          <div style={{ ...cardStyle }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>🎛️ API Filters — Sent directly to Opinion Universe</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' }}>

              {/* Country */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginBottom: '5px' }}>COUNTRY</div>
                <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px' }}>
                  {['All','US','IN','GB','CA','AU','DE','FR','BR','TH','MX','NG','PH','ID','PK'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Platform */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginBottom: '5px' }}>PLATFORM</div>
                <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px' }}>
                  {['All','iPhone','Android'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginBottom: '5px' }}>TYPE</div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px' }}>
                  <option value="live_surveys">Live Surveys</option>
                  <option value="All">All Offers</option>
                </select>
              </div>

              {/* Payout Type */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginBottom: '5px' }}>PAYOUT TYPE</div>
                <select value={filterPayoutType} onChange={e => setFilterPayoutType(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px' }}>
                  {['All','percentage','flat'].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Min Amount (client-side) */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginBottom: '5px' }}>MIN AMOUNT (COINS)</div>
                <input type="number" min="0" placeholder="e.g. 1000"
                  value={filterMinAmount} onChange={e => setFilterMinAmount(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px' }} />
              </div>

              {/* Max LOI (client-side) */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginBottom: '5px' }}>MAX LOI (mins)</div>
                <input type="number" min="0" placeholder="e.g. 15"
                  value={filterMaxLoi} onChange={e => setFilterMaxLoi(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px' }} />
              </div>

              {/* Min IR (client-side) */}
              <div>
                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginBottom: '5px' }}>MIN IR (%)</div>
                <input type="number" min="0" max="100" placeholder="e.g. 30"
                  value={filterMinIr} onChange={e => setFilterMinIr(e.target.value)}
                  style={{ ...inputStyle, padding: '8px 12px' }} />
              </div>

            </div>

            {/* Search + Fetch Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text" placeholder="Search by Offer ID or Survey Name..."
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '34px' }}
                />
              </div>
              <button onClick={() => { setFilterCountry('All'); setFilterPlatform('All'); setFilterType('live_surveys'); setFilterPayoutType('All'); setFilterMinAmount(''); setFilterMaxLoi(''); setFilterMinIr(''); setSearchTerm(''); }}
                style={{ ...btnSecondary, whiteSpace: 'nowrap' }}>
                ✕ Reset
              </button>
              <button onClick={handleFetch} disabled={fetchLoading} style={{ ...btnPrimary, whiteSpace: 'nowrap' }}>
                <RefreshCw size={15} style={{ animation: fetchLoading ? 'spin 1s linear infinite' : 'none' }} />
                {fetchLoading ? 'Fetching...' : 'Fetch Live Surveys'}
              </button>
            </div>
          </div>

          {fetchError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#f87171', fontSize: '0.85rem' }}>
              ⚠️ {fetchError}
            </div>
          )}

          {liveOffers.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
                Showing <strong style={{ color: '#a5b4fc' }}>{filteredOffers.length}</strong> of <strong style={{ color: '#fff' }}>{liveOffers.length}</strong> surveys
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowUpDown size={14} color="#a5b4fc" />
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>SORT BY:</span>
                <select
                  value={fetchSortBy}
                  onChange={e => setFetchSortBy(e.target.value)}
                  style={{ ...inputStyle, width: 'auto', padding: '6px 12px', fontSize: '0.78rem', background: '#0f172a', borderColor: 'rgba(99,102,241,0.35)', color: '#a5b4fc', fontWeight: 600 }}
                >
                  <option value="amount_desc">🪙 Coins Amount: High → Low</option>
                  <option value="amount_asc">🪙 Coins Amount: Low → High</option>
                  <option value="payout_desc">💵 Payout ($ USD): High → Low</option>
                  <option value="loi_asc">⏱️ Quickest LOI (Short → Long)</option>
                  <option value="loi_desc">⏱️ Longest LOI (Long → Short)</option>
                  <option value="ir_desc">🎯 Incidence Rate (IR %): High → Low</option>
                  <option value="name_asc">🔤 Offer Name: A → Z</option>
                </select>
              </div>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                  {[
                    { label: 'Amount', value: `${(offer.amount || 0).toLocaleString()}`, color: '#10b981' },
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
          {/* Top Bar: View toggles (Active vs Trash) + Refresh */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setManagedView('active')}
                style={{
                  ...btnSecondary,
                  background: managedView === 'active' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                  borderColor: managedView === 'active' ? '#6366f1' : 'rgba(255,255,255,0.08)',
                  color: managedView === 'active' ? '#a5b4fc' : '#94a3b8',
                  padding: '7px 14px',
                  fontSize: '0.8rem'
                }}
              >
                📋 Active Surveys ({managedSurveys.length})
              </button>
              <button
                onClick={() => setManagedView('trash')}
                style={{
                  ...btnSecondary,
                  background: managedView === 'trash' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
                  borderColor: managedView === 'trash' ? '#ef4444' : 'rgba(255,255,255,0.08)',
                  color: managedView === 'trash' ? '#f87171' : '#94a3b8',
                  padding: '7px 14px',
                  fontSize: '0.8rem'
                }}
              >
                🗑️ Trash / Deleted Area ({trashSurveys.length})
              </button>
            </div>
            <button onClick={loadManagedSurveys} style={btnSecondary}><RefreshCw size={14} /> Refresh</button>
          </div>

          {/* ACTIVE SURVEYS VIEW */}
          {managedView === 'active' && (
            managedSurveys.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '50px', color: 'var(--text-muted,#64748b)' }}>
                No active surveys found. Go to "Fetch & Add Surveys" to add your first survey.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Search, Filter & Sort Controls */}
                <div style={{ ...cardStyle, padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {/* Left: Status Filter Pills */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[
                      { id: 'ALL', label: `All (${managedSurveys.length})` },
                      { id: 'active', label: `🟢 Active (${managedSurveys.filter(s => s.status === 'active').length})` },
                      { id: 'inactive', label: `🔴 Disabled (${managedSurveys.filter(s => s.status === 'inactive').length})` },
                      { id: 'featured', label: `⭐ Featured (${managedSurveys.filter(s => s.is_featured === 1).length})` },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setManagedFilterStatus(f.id)}
                        style={{
                          background: managedFilterStatus === f.id ? '#6366f1' : 'rgba(255,255,255,0.06)',
                          color: managedFilterStatus === f.id ? '#fff' : '#94a3b8',
                          border: '1px solid ' + (managedFilterStatus === f.id ? '#6366f1' : 'rgba(255,255,255,0.1)'),
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Right: Search & Sort Dropdown */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
                    <div style={{ position: 'relative', minWidth: '180px', flex: 1, maxWidth: '280px' }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="text"
                        placeholder="Search title, ID, country..."
                        value={managedSearch}
                        onChange={e => setManagedSearch(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '32px', padding: '7px 12px 7px 32px', fontSize: '0.78rem', width: '100%' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowUpDown size={13} color="#a5b4fc" />
                      <select
                        value={managedSortBy}
                        onChange={e => setManagedSortBy(e.target.value)}
                        style={{
                          ...inputStyle,
                          padding: '7px 10px',
                          fontSize: '0.78rem',
                          width: 'auto',
                          background: '#1e293b',
                          borderColor: '#6366f1',
                          color: '#e2e8f0',
                          fontWeight: 600
                        }}
                      >
                        <option value="featured">⭐ Featured First</option>
                        <option value="coins_desc">🪙 Coins (High → Low)</option>
                        <option value="coins_asc">🪙 Coins (Low → High)</option>
                        <option value="loi_asc">⏱️ LOI (Shortest First)</option>
                        <option value="loi_desc">⏱️ LOI (Longest First)</option>
                        <option value="newest">🆕 Newest Added</option>
                        <option value="oldest">⏳ Oldest Added</option>
                        <option value="title">🔤 Title (A → Z)</option>
                      </select>
                    </div>

                    {(managedSearch || managedFilterStatus !== 'ALL') && (
                      <button
                        onClick={() => { setManagedSearch(''); setManagedFilterStatus('ALL'); }}
                        style={{ ...btnSecondary, padding: '6px 10px', fontSize: '0.75rem', color: '#f87171' }}
                        title="Clear filters"
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>
                </div>

                {filteredManagedSurveys.length === 0 ? (
                  <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: 'var(--text-muted,#64748b)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔍</div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>No surveys match your filters</div>
                    <div style={{ fontSize: '0.8rem' }}>Try adjusting your search query or status filter.</div>
                    <button
                      onClick={() => { setManagedSearch(''); setManagedFilterStatus('ALL'); }}
                      style={{ ...btnSecondary, marginTop: '12px', fontSize: '0.78rem' }}
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredManagedSurveys.map(s => (
                  <div key={s.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
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
                          Amount: <strong style={{ color: '#10b981' }}>{(s.coins_reward || 0).toLocaleString()}</strong> &nbsp;•&nbsp;
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
                          onClick={() => setEditingTipsSurveyId(editingTipsSurveyId === s.id ? null : s.id)}
                          title="Add or Edit Extra Info & How to Qualify Guide"
                          style={{
                            ...btnSecondary,
                            padding: '7px 12px',
                            background: s.qualification_tips ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                            borderColor: s.qualification_tips ? '#6366f1' : 'rgba(255,255,255,0.12)',
                            color: s.qualification_tips ? '#a5b4fc' : '#fff'
                          }}
                        >
                          <FileText size={14} />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                            {s.qualification_tips ? 'Edit Qualify Tips' : '+ Add Qualify Tips'}
                          </span>
                        </button>

                        <button
                          onClick={() => setExpandedLinkId(expandedLinkId === s.id ? null : s.id)}
                          title="Inspect Offer URL / Test Link"
                          style={{
                            ...btnSecondary,
                            padding: '7px 10px',
                            background: expandedLinkId === s.id ? 'rgba(16,185,129,0.2)' : undefined,
                            borderColor: expandedLinkId === s.id ? '#10b981' : undefined,
                            color: expandedLinkId === s.id ? '#10b981' : '#a5b4fc'
                          }}
                        >
                          <Link2 size={15} />
                        </button>

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

                        <button
                          onClick={() => handleMoveToTrash(s)}
                          title="Move to Trash (Temporary Delete)"
                          style={{ ...btnSecondary, padding: '7px 10px', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Offer URL Inspector Drawer */}
                    {expandedLinkId === s.id && (
                      <div style={{
                        background: 'rgba(15,23,42,0.7)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            🔗 Opinion Universe Router Link (offer_url_easy template)
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(s.survey_url_template || '');
                                onNotify('Link copied to clipboard!');
                              }}
                              style={{ ...btnSecondary, padding: '4px 10px', fontSize: '0.72rem' }}
                            >
                              <Copy size={12} /> Copy Template
                            </button>
                            <button
                              onClick={() => handleTestManagedSurvey(s)}
                              style={{ ...btnPrimary, padding: '4px 12px', fontSize: '0.72rem' }}
                            >
                              <ExternalLink size={12} /> Test / Open Link
                            </button>
                          </div>
                        </div>
                        <div style={{
                          fontFamily: 'monospace',
                          fontSize: '0.74rem',
                          color: '#e2e8f0',
                          wordBreak: 'break-all',
                          background: 'rgba(0,0,0,0.35)',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          {s.survey_url_template || 'No URL stored'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          ℹ️ When a user clicks this survey, Survey King dynamically replaces <code style={{ color: '#38bdf8' }}>{'{YOUR_CLICK_ID}'}</code> with the transaction ID and <code style={{ color: '#38bdf8' }}>{'{YOUR_SOURCE_ID}'}</code> with the user's ID.
                        </div>
                      </div>
                    )}

                    {/* Qualification Tips Preview (if set and not editing) */}
                    {s.qualification_tips && editingTipsSurveyId !== s.id && (
                      <div style={{
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '0.76rem',
                        color: '#c7d2fe',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <span style={{ fontSize: '0.9rem' }}>💡</span>
                        <div>
                          <strong style={{ color: '#a5b4fc', display: 'block', marginBottom: '2px' }}>How to Qualify Tips:</strong>
                          <span style={{ color: '#e0e7ff', whiteSpace: 'pre-line' }}>{s.qualification_tips}</span>
                        </div>
                      </div>
                    )}

                    {/* Inline Editor for Extra Info & Qualify Tips */}
                    {editingTipsSurveyId === s.id && (
                      <SurveyExtraInfoEditor
                        survey={s}
                        onSave={(msg) => {
                          onNotify(msg);
                          setEditingTipsSurveyId(null);
                          loadManagedSurveys();
                        }}
                        onCancel={() => setEditingTipsSurveyId(null)}
                      />
                    )}
                  </div>
                  ))
                )}
              </div>
            )
          )}

          {/* TRASH / TEMPORARY DELETED AREA */}
          {managedView === 'trash' && (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '0.78rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🗑️</span>
                <span>These surveys are temporarily deleted. Users cannot see them. You can <strong>Restore</strong> them back to active or <strong>Permanently Delete</strong> them directly from the database.</span>
              </div>
              {trashSurveys.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '50px', color: 'var(--text-muted,#64748b)' }}>
                  Trash is empty. No deleted surveys found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {trashSurveys.map(s => (
                    <div key={s.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.03)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        {s.image_url && <img src={s.image_url} alt="" style={{ width: 52, height: 52, borderRadius: '8px', objectFit: 'cover', opacity: 0.6, flexShrink: 0 }} />}
                        <div style={{ flex: 1, minWidth: '180px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#e2e8f0', textDecoration: 'line-through' }}>{s.title}</span>
                            <span style={{ fontSize: '0.65rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '2px 7px', borderRadius: '5px', fontWeight: 800 }}>
                              🗑️ IN TRASH (DELETED)
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            ID: <strong style={{ color: '#a5b4fc' }}>{s.external_offer_id}</strong> &nbsp;•&nbsp;
                            Coins: <strong style={{ color: '#94a3b8' }}>{(s.coins_reward || 0).toLocaleString()}</strong> &nbsp;•&nbsp;
                            LOI: <strong style={{ color: '#94a3b8' }}>{s.loi} min</strong> &nbsp;•&nbsp;
                            {s.countries}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <button
                            onClick={() => setExpandedLinkId(expandedLinkId === s.id ? null : s.id)}
                            title="Inspect Offer URL"
                            style={{ ...btnSecondary, padding: '7px 10px', color: '#a5b4fc' }}
                          >
                            <Link2 size={15} />
                          </button>

                          <button
                            onClick={() => handleRestoreSurvey(s)}
                            title="Restore Survey to Active"
                            style={{
                              ...btnSecondary,
                              padding: '7px 12px',
                              background: 'rgba(16,185,129,0.15)',
                              borderColor: 'rgba(16,185,129,0.4)',
                              color: '#10b981',
                              fontSize: '0.78rem'
                            }}
                          >
                            <RotateCcw size={14} />
                            <span>Restore Survey</span>
                          </button>

                          <button
                            onClick={() => handlePermanentDelete(s)}
                            title="Permanently Delete from Database"
                            style={{
                              ...btnSecondary,
                              padding: '7px 12px',
                              background: 'rgba(239,68,68,0.2)',
                              borderColor: '#ef4444',
                              color: '#f87171',
                              fontSize: '0.78rem'
                            }}
                          >
                            <Trash2 size={14} />
                            <span>Delete Permanently</span>
                          </button>
                        </div>
                      </div>

                      {/* Offer URL Inspector Drawer inside Trash */}
                      {expandedLinkId === s.id && (
                        <div style={{
                          background: 'rgba(15,23,42,0.7)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              🔗 Offer Router Link (offer_url_easy)
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(s.survey_url_template || '');
                                  onNotify('Link copied to clipboard!');
                                }}
                                style={{ ...btnSecondary, padding: '4px 10px', fontSize: '0.72rem' }}
                              >
                                <Copy size={12} /> Copy Template
                              </button>
                              <button
                                onClick={() => handleTestManagedSurvey(s)}
                                style={{ ...btnPrimary, padding: '4px 12px', fontSize: '0.72rem' }}
                              >
                                <ExternalLink size={12} /> Test / Open Link
                              </button>
                            </div>
                          </div>
                          <div style={{
                            fontFamily: 'monospace',
                            fontSize: '0.74rem',
                            color: '#e2e8f0',
                            wordBreak: 'break-all',
                            background: 'rgba(0,0,0,0.35)',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.06)'
                          }}>
                            {s.survey_url_template || 'No URL stored'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---- SUB-TAB: OFFER HISTORY & TRANSACTIONS ---- */}
      {activeSubTab === 'clicks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ ...cardStyle, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MousePointerClick size={20} color="#a5b4fc" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>TOTAL CLICKS</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{clicks.length}</div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={20} color="#10b981" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CREDITED (PAYOUT)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                  {clicks.filter(c => c.display_status === 'CREDITED').length}
                </div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>CLICKED (PENDING)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
                  {clicks.filter(c => c.display_status === 'CLICKED').length}
                </div>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coins size={20} color="#eab308" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>TOTAL COINS PAID</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#eab308' }}>
                  {clicks.reduce((acc, c) => acc + (c.display_status === 'CREDITED' ? (Number(c.user_reward_coins) || 0) : 0), 0).toLocaleString()} 🪙
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div style={{ ...cardStyle, padding: '14px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: `All (${clicks.length})` },
                { id: 'CREDITED', label: `✅ Credited (${clicks.filter(c => c.display_status === 'CREDITED').length})` },
                { id: 'CLICKED', label: `⏳ Clicked (${clicks.filter(c => c.display_status === 'CLICKED').length})` },
                { id: 'REVERSED', label: `⚠️ Reversed (${clicks.filter(c => c.display_status === 'REVERSED').length})` }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setHistoryFilterStatus(f.id)}
                  style={{
                    background: historyFilterStatus === f.id ? '#6366f1' : 'rgba(255,255,255,0.06)',
                    color: historyFilterStatus === f.id ? '#fff' : '#94a3b8',
                    border: '1px solid ' + (historyFilterStatus === f.id ? '#6366f1' : 'rgba(255,255,255,0.1)'),
                    borderRadius: '8px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1, minWidth: '280px', justifyContent: 'flex-end' }}>
              <div style={{ position: 'relative', minWidth: '180px', flex: 1, maxWidth: '280px' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search User, Click ID, Offer..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '32px', padding: '8px 12px 8px 32px', fontSize: '0.8rem', width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpDown size={13} color="#a5b4fc" />
                <select
                  value={historySortBy}
                  onChange={e => setHistorySortBy(e.target.value)}
                  style={{
                    ...inputStyle,
                    padding: '7px 10px',
                    fontSize: '0.78rem',
                    width: 'auto',
                    background: '#1e293b',
                    borderColor: '#6366f1',
                    color: '#e2e8f0',
                    fontWeight: 600
                  }}
                >
                  <option value="date_desc">📅 Newest First</option>
                  <option value="date_asc">📅 Oldest First</option>
                  <option value="coins_desc">🪙 Coins (High → Low)</option>
                  <option value="coins_asc">🪙 Coins (Low → High)</option>
                </select>
              </div>

              <button onClick={loadClicks} style={{ ...btnSecondary, padding: '8px 12px' }} title="Refresh">
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['User', 'Click ID', 'Offer / Survey', 'Amount (PAYOUT)', 'Status', 'Clicked At', 'Credited At', 'Transaction ID'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', color: '#64748b', fontWeight: 700, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredClicks.length === 0 ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No transaction history found.</td></tr>
                ) : (
                  filteredClicks.map(c => {
                    const isCredited = c.display_status === 'CREDITED';
                    const isReversed = c.display_status === 'REVERSED';
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {/* User */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ color: '#fff', fontWeight: 700 }}>
                            #{c.user_id} {c.user_name || 'User'}
                          </div>
                          {c.telegram_user_id && (
                            <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
                              @{c.telegram_user_id}
                            </div>
                          )}
                        </td>

                        {/* Click ID */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#a5b4fc', fontFamily: 'monospace', fontSize: '0.74rem', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.click_id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(c.click_id)}
                              style={{ background: 'none', border: 'none', color: copiedClickId === c.click_id ? '#10b981' : '#64748b', cursor: 'pointer', padding: '2px' }}
                              title="Copy Click ID"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </td>

                        {/* Offer */}
                        <td style={{ padding: '12px 14px', maxWidth: '170px' }}>
                          <div style={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.survey_title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            ID: {c.external_offer_id}
                          </div>
                        </td>

                        {/* Amount / PAYOUT */}
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          {isCredited ? (
                            <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.9rem' }}>
                              +{Number(c.user_reward_coins || 0).toLocaleString()} 🪙
                            </span>
                          ) : isReversed ? (
                            <span style={{ color: '#ef4444', fontWeight: 800 }}>
                              -{Math.abs(Number(c.user_reward_coins || 0)).toLocaleString()} 🪙
                            </span>
                          ) : (
                            <span style={{ color: '#64748b', fontStyle: 'italic' }}>
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 14px' }}>
                          {isCredited ? (
                            <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                              ✅ CREDITED
                            </span>
                          ) : isReversed ? (
                            <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                              ⚠️ REVERSED
                            </span>
                          ) : (
                            <span style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                              ⏳ CLICKED
                            </span>
                          )}
                        </td>

                        {/* Clicked At */}
                        <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {c.clicked_at ? new Date(c.clicked_at).toLocaleString() : '-'}
                        </td>

                        {/* Credited At */}
                        <td style={{ padding: '12px 14px', color: isCredited ? '#10b981' : '#64748b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {c.credited_at ? new Date(c.credited_at).toLocaleString() : (c.completed_at ? new Date(c.completed_at).toLocaleString() : '-')}
                        </td>

                        {/* Transaction ID */}
                        <td style={{ padding: '12px 14px', color: '#a5b4fc', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                          {c.conversion_id || '-'}
                        </td>
                      </tr>
                    );
                  })
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

