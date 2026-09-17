import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [winners, setWinners] = useState([]);
  const [draws, setDraws] = useState([]);

  // Charity Form State
  const [charityForm, setCharityForm] = useState({ name: '', description: '', category: '' });
  const [editingCharity, setEditingCharity] = useState(null);

  // User Score Edit State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userScores, setUserScores] = useState([]);
  const [editingScore, setEditingScore] = useState(null);
  const [scoreForm, setScoreForm] = useState({ score: '', date: '' });
  
  useEffect(() => {
    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'charities') fetchCharities();
    if (activeTab === 'winners') fetchWinners();
    if (activeTab === 'draws') fetchDraws();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (e) { console.error(e); }
  };

  const fetchCharities = async () => {
    try {
      const { data } = await api.get('/charities');
      setCharities(data);
    } catch (e) { console.error(e); }
  };

  const fetchWinners = async () => {
    try {
      const { data: wData } = await api.get('/winners');
      setWinners(wData);
    } catch (e) { console.error(e); }
  };

  const fetchDraws = async () => {
    try {
      const { data } = await api.get('/draws');
      setDraws(data);
    } catch (e) { console.error(e); }
  };

  const handleSaveCharity = async (e) => {
    e.preventDefault();
    try {
      if (editingCharity) {
        await api.put(`/charities/${editingCharity._id}`, charityForm);
      } else {
        await api.post('/charities', charityForm);
      }
      setCharityForm({ name: '', description: '', category: '' });
      setEditingCharity(null);
      fetchCharities();
    } catch (e) { alert('Failed to save charity'); }
  };

  const handleDeleteCharity = async (id) => {
    if (window.confirm('Delete this charity?')) {
      try {
        await api.delete(`/charities/${id}`);
        fetchCharities();
      } catch (e) { alert('Failed to delete charity'); }
    }
  };

  const handleManageUserScores = async (u) => {
    setSelectedUser(u);
    try {
      const { data } = await api.get(`/admin/users/${u._id}`);
      setUserScores(data.scores || []);
    } catch (e) { alert('Failed to fetch user scores'); }
  };

  const handleUpdateUserScore = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${selectedUser._id}/scores/${editingScore._id}`, scoreForm);
      setEditingScore(null);
      handleManageUserScores(selectedUser);
    } catch (e) { alert('Failed to update score'); }
  };

  const handleCreateDraw = async (drawType) => {
    try {
      await api.post('/draws', { drawDate: new Date().toISOString(), drawType });
      fetchDraws();
    } catch (e) { alert(e.response?.data?.message || 'Failed to create draw'); }
  };

  const handleSimulateDraw = async (id) => {
    try {
      await api.post(`/draws/${id}/simulate`);
      fetchDraws();
    } catch (e) { alert(e.response?.data?.message || 'Failed to simulate'); }
  };

  const handlePublishDraw = async (id) => {
    try {
      await api.post(`/draws/${id}/publish`);
      fetchDraws();
    } catch (e) { alert(e.response?.data?.message || 'Failed to publish'); }
  };

  const handleDeleteDraw = async (id) => {
    if (window.confirm('Are you sure you want to cancel and delete this draw?')) {
      try {
        await api.delete(`/draws/${id}`);
        fetchDraws();
      } catch (e) { alert(e.response?.data?.message || 'Failed to delete draw'); }
    }
  };

  const handleVerifyWinner = async (id, status) => {
    try {
      await api.put(`/winners/${id}/verify`, { status });
      fetchWinners();
    } catch (e) { alert('Verification failed'); }
  };

  const handlePayoutWinner = async (id, payoutStatus) => {
    try {
      await api.put(`/winners/${id}/payout`, { payoutStatus });
      fetchWinners();
    } catch (e) { alert('Payout update failed'); }
  };

  const tabs = [
    { id: 'overview', name: 'System Overview' },
    { id: 'users', name: 'User Management' },
    { id: 'charities', name: 'Charities' },
    { id: 'draws', name: 'Draw Orchestration' },
    { id: 'winners', name: 'Winners & Payouts' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-emerald-950 relative overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[60%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="mesh-bg absolute inset-0 opacity-20" />
      </div>

      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-serif tracking-tight tracking-tight font-bold text-emerald-950 flex items-center gap-2"
            >
              <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Center
            </motion.h1>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500 bg-emerald-50/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200">
                Authorized: {user?.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex-row items-center justify-start sm:justify-center border border-slate-200 p-2 mb-8 flex overflow-x-auto gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-6 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-500 hover:text-emerald-900 hover:bg-emerald-50/50 backdrop-blur-md'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-2xl shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-900/10 rounded-3xl border border-slate-200 rounded-3xl p-10 min-h-[600px] shadow-2xl">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="text-4xl font-serif tracking-tight tracking-tight font-bold mb-8 text-emerald-950">System Diagnostics</h2>
                {stats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-slate-200 flex flex-col justify-between h-32">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                      <p className="text-5xl font-black text-emerald-950">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col justify-between h-32">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Subs</p>
                      <p className="text-5xl font-black text-emerald-950">{stats.activeSubscriptions || 0}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-teal-500/30 bg-teal-500/5 flex flex-col justify-between h-32">
                      <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">Prize Pool</p>
                      <p className="text-5xl font-black text-emerald-950">${stats.totalPrizePool?.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col justify-between h-32">
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Charity Impact</p>
                      <p className="text-5xl font-black text-emerald-950">${stats.totalCharityContributions?.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col justify-between h-32">
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Total Paid</p>
                      <p className="text-5xl font-black text-emerald-950">${stats.totalWinningsPaid?.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="text-4xl font-serif tracking-tight tracking-tight font-bold mb-8 text-emerald-950">Directory</h2>
                <div className="grid gap-4">
                  {users.map(u => (
                    <div key={u._id} className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <p className="font-bold text-lg text-emerald-950">{u.firstName} {u.lastName}</p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className="px-3 py-1 bg-emerald-50 rounded-lg text-xs font-bold tracking-wider text-slate-600 uppercase">{u.role}</span>
                        {u.role === 'subscriber' && (
                          <button onClick={() => handleManageUserScores(u)} className="px-4 py-2 bg-teal-600/20 text-teal-400 hover:bg-teal-600/40 text-sm font-bold rounded-lg transition-colors border border-teal-500/30">
                            Edit Scores
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-slate-500 italic">No users found.</p>}
                </div>
              </motion.div>
            )}

            {activeTab === 'charities' && (
              <motion.div key="charities" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-4xl font-serif tracking-tight tracking-tight font-bold text-emerald-950">Charity Catalog</h2>
                </div>
                
                <form onSubmit={handleSaveCharity} className="mb-10 p-10 bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center rounded-2xl border border-slate-200">
                  <h3 className="font-bold text-emerald-950 mb-4">{editingCharity ? 'Edit Partner Charity' : 'Onboard New Charity'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input type="text" placeholder="Charity Name" required value={charityForm.name} onChange={e => setCharityForm({...charityForm, name: e.target.value})} className="bg-[#f4f7f5]/80 border border-slate-200 p-3 rounded-xl text-emerald-950 outline-none focus:border-amber-500" />
                    <input type="text" placeholder="Category (e.g. Health, Environment)" value={charityForm.category} onChange={e => setCharityForm({...charityForm, category: e.target.value})} className="bg-[#f4f7f5]/80 border border-slate-200 p-3 rounded-xl text-emerald-950 outline-none focus:border-amber-500" />
                  </div>
                  <textarea placeholder="Mission Description" required value={charityForm.description} onChange={e => setCharityForm({...charityForm, description: e.target.value})} className="w-full bg-[#f4f7f5]/80 border border-slate-200 p-3 rounded-xl text-emerald-950 outline-none focus:border-amber-500 mb-4 h-24 resize-none" />
                  <div className="flex gap-3">
                    <button type="submit" className="bg-amber-600 text-white px-6 py-2 font-bold rounded-xl hover:bg-amber-500 transition-colors">
                      {editingCharity ? 'Update' : 'Publish'}
                    </button>
                    {editingCharity && (
                      <button type="button" onClick={() => { setEditingCharity(null); setCharityForm({name:'', description:'', category:''}); }} className="bg-emerald-50 text-emerald-950 px-6 py-2 font-bold rounded-xl hover:bg-emerald-100 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {charities.map(c => (
                    <div key={c._id} className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-slate-200 flex flex-col">
                      <span className="text-xs font-bold bg-emerald-50 px-2 py-1 rounded w-fit mb-3 text-amber-300 uppercase tracking-wider">{c.category || 'General'}</span>
                      <h4 className="font-bold text-xl text-emerald-950 mb-2">{c.name}</h4>
                      <p className="text-sm text-slate-500 flex-grow mb-6">{c.description}</p>
                      <div className="flex gap-3 mt-auto w-full">
                        <button onClick={() => { setEditingCharity(c); setCharityForm({name: c.name, description: c.description, category: c.category || ''}); }} className="flex-1 bg-emerald-50/50 backdrop-blur-md hover:bg-emerald-50 text-slate-700 py-2.5 rounded-lg text-sm font-bold transition-colors border border-slate-200">Edit</button>
                        <button onClick={() => handleDeleteCharity(c._id)} className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-lg text-sm font-bold transition-colors border border-rose-200">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'draws' && (
              <motion.div key="draws" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-4xl font-serif tracking-tight tracking-tight font-bold text-emerald-950">Draw Orchestration</h2>
                  <div className="flex gap-3">
                    <button onClick={() => handleCreateDraw('random')} className="bg-emerald-50 text-emerald-950 px-4 py-2 font-bold rounded-xl hover:bg-emerald-100 transition-colors border border-slate-200">New Random</button>
                    <button onClick={() => handleCreateDraw('algorithmic')} className="bg-emerald-600 text-white px-4 py-2 font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]">New Algorithmic</button>
                  </div>
                </div>
                <div className="space-y-4">
                  {draws.map(d => (
                    <div key={d._id} className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-slate-200 relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 gap-4 border-b border-slate-100 pb-4">
                        <div className="text-left">
                          <p className="font-bold text-xl text-emerald-950">Draw: {new Date(d.drawDate).toLocaleDateString()}</p>
                          <p className="text-sm font-medium text-slate-500 mt-1">Engine: <span className="capitalize">{d.drawType}</span> &bull; Pool: <span className="text-emerald-700 font-bold">${d.prizePool?.toFixed(2)}</span></p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            d.status === 'published' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            d.status === 'simulated' ? 'bg-teal-100 text-teal-700 border border-teal-200' :
                            'bg-emerald-50/50 backdrop-blur-md text-slate-600 border border-slate-200'
                          }`}>
                            {d.status}
                          </span>
                          {d.status !== 'published' && (
                            <button onClick={() => handleDeleteDraw(d._id)} className="px-4 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border border-rose-200 shadow-sm flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              Cancel Draw
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-[#f4f7f5]/50 p-4 rounded-xl border border-slate-200 mb-4">
                        <p className="text-sm font-semibold text-slate-600 mb-2">Winning Combination</p>
                        <div className="flex gap-2">
                          {d.winningNumbers?.length > 0 ? (
                            d.winningNumbers.map((n, i) => <span key={i} className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded font-bold text-emerald-950">{n}</span>)
                          ) : (
                            <span className="text-slate-500 italic text-sm">Awaiting simulation</span>
                          )}
                        </div>
                      </div>

                      {d.status === 'draft' && (
                        <button onClick={() => handleSimulateDraw(d._id)} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-xl transition-colors">
                          Run Simulation
                        </button>
                      )}
                      
                      {d.status === 'simulated' && (
                        <div className="border-t border-slate-200 pt-4 mt-4">
                          <p className="text-sm font-bold text-slate-600 mb-3">Simulation Results</p>
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-emerald-50/50 backdrop-blur-md p-3 rounded-lg text-center">
                              <p className="text-xs text-slate-500">5 Match</p>
                              <p className="font-bold text-emerald-950">{d.prizeDistribution?.fiveMatch?.winners || 0} winners</p>
                            </div>
                            <div className="bg-emerald-50/50 backdrop-blur-md p-3 rounded-lg text-center">
                              <p className="text-xs text-slate-500">4 Match</p>
                              <p className="font-bold text-emerald-950">{d.prizeDistribution?.fourMatch?.winners || 0} winners</p>
                            </div>
                            <div className="bg-emerald-50/50 backdrop-blur-md p-3 rounded-lg text-center">
                              <p className="text-xs text-slate-500">3 Match</p>
                              <p className="font-bold text-emerald-950">{d.prizeDistribution?.threeMatch?.winners || 0} winners</p>
                            </div>
                          </div>
                          <button onClick={() => handlePublishDraw(d._id)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors">
                            Publish to Users
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {draws.length === 0 && <p className="text-slate-500 italic">No draws initialized.</p>}
                </div>
              </motion.div>
            )}

            {activeTab === 'winners' && (
              <motion.div key="winners" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h2 className="text-4xl font-serif tracking-tight tracking-tight font-bold mb-8 text-emerald-950">Fulfillment & Verification</h2>
                <div className="space-y-4">
                  {winners.map(w => (
                    <div key={w._id} className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-emerald-500/20 relative">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                        <div>
                          <p className="font-bold text-lg text-emerald-950">{w.user?.email}</p>
                          <p className="text-sm text-emerald-400 font-semibold">{w.matchType} Number Match</p>
                        </div>
                        <p className="text-5xl font-serif tracking-tight tracking-tight font-black text-emerald-400">${w.prizeAmount?.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4 bg-emerald-50/50 backdrop-blur-md p-4 rounded-xl border border-slate-200">
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Verify Status</p>
                          <p className={`font-semibold capitalize ${w.verificationStatus === 'pending' ? 'text-yellow-400' : 'text-emerald-400'}`}>{w.verificationStatus}</p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Payout Status</p>
                          <p className={`font-semibold capitalize ${w.payoutStatus === 'pending' ? 'text-slate-500' : 'text-emerald-400'}`}>{w.payoutStatus}</p>
                        </div>
                        {w.proofUrl && (
                          <div className="flex-1 flex items-center">
                            <a href={w.proofUrl} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-teal-300 underline font-medium">View Identity Proof</a>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        {w.verificationStatus === 'pending' && (
                          <>
                            <button onClick={() => handleVerifyWinner(w._id, 'verified')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">Approve Identity</button>
                            <button onClick={() => handleVerifyWinner(w._id, 'rejected')} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">Reject</button>
                          </>
                        )}
                        {w.verificationStatus === 'verified' && w.payoutStatus === 'pending' && (
                          <button onClick={() => handlePayoutWinner(w._id, 'paid')} className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">Mark Dispensed</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {winners.length === 0 && <p className="text-slate-500 italic">No pending winnings.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Score Management Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-[#f4f7f5]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center border border-slate-200 rounded-3xl p-10 max-w-lg w-full max-h-[90vh] overflow-y-auto relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-emerald-950">Scores: {selectedUser.email}</h3>
                <button onClick={() => { setSelectedUser(null); setEditingScore(null); }} className="text-slate-500 hover:text-emerald-950 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              {editingScore ? (
                <form onSubmit={handleUpdateUserScore} className="bg-emerald-50/50 backdrop-blur-md p-5 rounded-2xl mb-6 border border-emerald-500/30">
                  <h4 className="font-bold text-emerald-300 mb-4">Edit Entry</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Score</label>
                      <input type="number" required min="1" max="45" value={scoreForm.score} onChange={e => setScoreForm({...scoreForm, score: e.target.value})} className="w-full bg-[#f4f7f5] border border-slate-200 p-3 rounded-xl text-emerald-950 outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                      <input type="date" required value={scoreForm.date} onChange={e => setScoreForm({...scoreForm, date: e.target.value})} className="w-full bg-[#f4f7f5] border border-slate-200 p-3 rounded-xl text-emerald-950 outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button type="submit" className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl hover:bg-emerald-500 transition-colors">Apply Fix</button>
                    <button type="button" onClick={() => setEditingScore(null)} className="flex-1 bg-emerald-50 text-emerald-950 font-bold py-2 rounded-xl hover:bg-emerald-100 transition-colors">Cancel</button>
                  </div>
                </form>
              ) : null}

              <div className="space-y-3">
                <h4 className="font-bold text-slate-600 mb-3">Score History</h4>
                {userScores.map(s => (
                  <div key={s._id} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-emerald-50/50 backdrop-blur-md">
                    <div>
                      <p className="font-bold text-xl text-emerald-300">{s.score} <span className="text-sm text-slate-500 font-normal">pts</span></p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(s.date).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => { setEditingScore(s); setScoreForm({score: s.score, date: new Date(s.date).toISOString().split('T')[0]}); }} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-950 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Edit</button>
                  </div>
                ))}
                {userScores.length === 0 && <p className="text-slate-500 text-sm italic">User has not entered any scores.</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
