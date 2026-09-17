import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../store/authSlice';
import { fetchSubscription, createSubscription } from '../store/subscriptionSlice';
import { fetchScores, addScore, updateScore, deleteScore } from '../store/scoreSlice';
import { fetchCharities, selectCharity, fetchMySelection } from '../store/charitySlice';
import { fetchMyParticipations } from '../store/drawSlice';
import api from '../api/axios';
import CheckoutModal from '../components/CheckoutModal';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { subscription } = useSelector((state) => state.subscription);
  const { scores } = useSelector((state) => state.score);
  const { charities, mySelection } = useSelector((state) => state.charity);
  const { participations } = useSelector((state) => state.draw);

  const [activeTab, setActiveTab] = useState('overview');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [scoreForm, setScoreForm] = useState({ score: '', date: '' });
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showCharityModal, setShowCharityModal] = useState(false);
  const [charityForm, setCharityForm] = useState({ charityId: '', contributionPercentage: 10 });
  const [winnings, setWinnings] = useState([]);

  useEffect(() => {
    dispatch(fetchSubscription());
    dispatch(fetchCharities());
    dispatch(fetchMySelection());
  }, [dispatch]);

  useEffect(() => {
    if (subscription?.status === 'active') {
      dispatch(fetchScores());
      dispatch(fetchMyParticipations());
      fetchWinnings();
    }
  }, [subscription, dispatch]);

  const fetchWinnings = async () => {
    try {
      const { data } = await api.get('/winners/my-winnings');
      setWinnings(data);
    } catch (error) {
      console.error('Error fetching winnings:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSubscribe = async (plan) => {
    try {
      await dispatch(createSubscription(plan)).unwrap();
      setShowSubscribeModal(false);
      dispatch(fetchSubscription());
    } catch (error) {
      alert(error.message || 'Failed to create subscription');
    }
  };

  const handleAddScore = async (e) => {
    e.preventDefault();
    try {
      if (editingScore) {
        await dispatch(updateScore({ id: editingScore._id, scoreData: scoreForm })).unwrap();
      } else {
        await dispatch(addScore(scoreForm)).unwrap();
      }
      setShowScoreModal(false);
      setScoreForm({ score: '', date: '' });
      setEditingScore(null);
    } catch (error) {
      const msg = error.message || 'Failed to save score';
      // Make generic 400 messages cleaner
      if (msg.includes('status code 400')) {
        alert('A score already exists for this date, or invalid input.');
      } else {
        alert(msg);
      }
      setShowScoreModal(false);
      setEditingScore(null);
    }
  };

  const handleEditScore = (score) => {
    setEditingScore(score);
    setScoreForm({
      score: score.score,
      date: new Date(score.date).toISOString().split('T')[0]
    });
    setShowScoreModal(true);
  };

  const handleDeleteScore = async (id) => {
    if (window.confirm('Are you sure you want to delete this score?')) {
      try {
        await dispatch(deleteScore(id)).unwrap();
      } catch (error) {
        alert(error.message || 'Failed to delete score');
      }
    }
  };

  const handleSelectCharity = async (e) => {
    e.preventDefault();
    try {
      await dispatch(selectCharity(charityForm)).unwrap();
      setShowCharityModal(false);
      dispatch(fetchMySelection());
    } catch (error) {
      alert(error.message || 'Failed to select charity');
    }
  };

  const isActive = subscription?.status === 'active' && new Date(subscription.endDate) >= new Date();

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-emerald-950 relative overflow-x-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-600/30 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-amber-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[30%] h-[40%] bg-teal-600/20 rounded-full blur-[100px]" />
        <div className="mesh-bg absolute inset-0 opacity-20" />
      </div>

      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-serif tracking-tight tracking-tight font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-amber-200"
            >
              Digital Heroes
            </motion.h1>
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-slate-600">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="px-5 py-2 text-sm font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isActive && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-2xl shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-900/10 rounded-3xl border border-yellow-500/30 p-10 mb-8 rounded-2xl flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold text-yellow-400">No Active Subscription</h3>
              <p className="mt-1 text-slate-600">
                Subscribe to participate in draws and manage your golf scores.
              </p>
            </div>
            <button
              onClick={() => setShowSubscribeModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-emerald-900 font-bold rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all"
            >
              Subscribe Now
            </button>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-2xl shadow-2xl shadow-emerald-900/10 ring-1 ring-emerald-900/10 rounded-3xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 mb-6"
        >
          <div className="border-b border-slate-200 bg-emerald-50/50 backdrop-blur-md">
            <nav className="flex px-4 overflow-x-auto">
              {['overview', 'scores', 'charity', 'draws', 'winnings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-5 px-6 text-sm font-semibold capitalize tracking-wide transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-b-2 border-emerald-400 text-emerald-400'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-emerald-50/50 backdrop-blur-md'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-10">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl font-bold mb-6 text-emerald-950">Subscription Status</h2>
                    {subscription ? (
                      <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div>
                            <p className="text-sm font-medium text-slate-500">Plan</p>
                            <p className="text-lg font-semibold capitalize text-emerald-950 mt-1">{subscription.plan}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Status</p>
                            <p className={`text-lg font-semibold mt-1 ${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isActive ? 'Active' : subscription.status}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Amount</p>
                            <p className="text-lg font-semibold text-emerald-950 mt-1">${subscription.plan === 'yearly' ? '144' : '15'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">Renewal Date</p>
                            <p className="text-lg font-semibold text-emerald-950 mt-1">
                              {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No active subscription found.</p>
                    )}
                  </div>

                  {isActive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h2 className="text-xl font-bold mb-6 text-emerald-950">Latest Scores</h2>
                        {scores.length > 0 ? (
                          <div className="space-y-3">
                            {scores.slice(0, 3).map((score) => (
                              <div key={score._id} className="flex justify-between items-center bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-4 rounded-xl border border-slate-200">
                                <span className="font-bold text-lg text-emerald-300">{score.score} <span className="text-sm font-normal text-slate-500">pts</span></span>
                                <span className="text-sm font-medium text-slate-500">
                                  {new Date(score.date).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No scores yet. Play a round and add your score!</p>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold text-emerald-950">Selected Charity</h2>
                          <button onClick={() => setActiveTab('charity')} className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">Manage</button>
                        </div>
                        {mySelection ? (
                          <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-amber-500/30 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <h3 className="text-xl font-bold text-emerald-950 relative z-10">{mySelection.charity.name}</h3>
                            <p className="text-slate-600 mt-2 relative z-10 line-clamp-2">{mySelection.charity.description}</p>
                            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center relative z-10">
                              <span className="text-sm font-medium text-amber-300">
                                {mySelection.contributionPercentage}% contribution
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-slate-200 text-center">
                            <p className="text-slate-500 mb-4">You haven't selected a charity to support yet.</p>
                            <button
                              onClick={() => {
                                setCharityForm({ charityId: '', contributionPercentage: 10 });
                                setShowCharityModal(true);
                              }}
                              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-lg transition-colors text-sm font-semibold"
                            >
                              Choose a Charity
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'scores' && (
                <motion.div
                  key="scores"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                      <h2 className="text-5xl font-serif tracking-tight tracking-tight font-black text-emerald-950">Performance Metrics</h2>
                      <p className="text-slate-500 mt-1">Track and analyze your golf scores over time.</p>
                    </div>
                    {isActive && (
                      <button
                        onClick={() => {
                          setEditingScore(null);
                          setScoreForm({ score: '', date: new Date().toISOString().split('T')[0] });
                          setShowScoreModal(true);
                        }}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Log New Score
                      </button>
                    )}
                  </div>

                  {!isActive ? (
                    <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center border border-yellow-500/30 p-10 rounded-3xl text-center">
                      <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      </div>
                      <h3 className="text-xl font-bold text-emerald-950 mb-2">Subscription Required</h3>
                      <p className="text-slate-500">You need an active subscription to access the performance metrics engine.</p>
                    </div>
                  ) : scores.length === 0 ? (
                    <div className="text-center py-20 bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center rounded-3xl border border-slate-200 border-dashed">
                      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      </div>
                      <h3 className="text-4xl font-serif tracking-tight tracking-tight font-bold text-emerald-950 mb-3">No Data Available</h3>
                      <p className="text-slate-500 text-lg max-w-md mx-auto">Start logging your scores to build your performance profile and enter the draws.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-3xl border border-slate-200 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-[30px]" />
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Average Score</p>
                          <p className="text-5xl font-black text-emerald-950">
                            {(scores.reduce((acc, s) => acc + s.score, 0) / scores.length).toFixed(1)}
                          </p>
                        </div>
                        <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-3xl border border-slate-200 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-[30px]" />
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Highest Score</p>
                          <p className="text-5xl font-black text-emerald-400">
                            {Math.max(...scores.map(s => s.score))}
                          </p>
                        </div>
                        <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-3xl border border-slate-200 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full blur-[30px]" />
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Entries</p>
                          <p className="text-5xl font-black text-amber-400">
                            {scores.length}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center rounded-3xl border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 p-5 bg-emerald-50/50 backdrop-blur-md border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <div className="col-span-4">Date Played</div>
                          <div className="col-span-3">Stableford Points</div>
                          <div className="col-span-2">Trend</div>
                          <div className="col-span-3 text-right">Actions</div>
                        </div>
                        <div className="divide-y divide-white/5">
                          {scores.map((score, index) => {
                            const prevScore = scores[index + 1]?.score;
                            const isHigher = prevScore && score.score > prevScore;
                            const isLower = prevScore && score.score < prevScore;
                            
                            return (
                              <div key={score._id} className="grid grid-cols-12 gap-4 p-5 items-center hover:bg-white/[0.02] transition-colors">
                                <div className="col-span-4 font-medium text-slate-600">
                                  {new Date(score.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                <div className="col-span-3">
                                  <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                                    {score.score} pts
                                  </span>
                                </div>
                                <div className="col-span-2 flex items-center">
                                  {!prevScore ? (
                                    <span className="text-slate-500 text-sm italic">-</span>
                                  ) : isHigher ? (
                                    <span className="flex items-center text-emerald-400 font-medium text-sm bg-emerald-500/10 px-2 py-1 rounded">
                                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                      +{score.score - prevScore}
                                    </span>
                                  ) : isLower ? (
                                    <span className="flex items-center text-rose-400 font-medium text-sm bg-rose-500/10 px-2 py-1 rounded">
                                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                                      {score.score - prevScore}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-medium text-sm bg-[#f4f7f5]0/10 px-2 py-1 rounded">
                                      Even
                                    </span>
                                  )}
                                </div>
                                <div className="col-span-3 flex justify-end gap-2">
                                  <button
                                    onClick={() => handleEditScore(score)}
                                    className="p-2 text-slate-500 hover:text-emerald-950 hover:bg-emerald-50 rounded-lg transition-colors"
                                    title="Edit Score"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteScore(score._id)}
                                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    title="Delete Score"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'charity' && (
                <motion.div
                  key="charity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-serif tracking-tight tracking-tight font-bold text-emerald-950">My Impact</h2>
                  </div>
                  
                  {mySelection ? (
                    <div className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-3xl border border-amber-500/30 mb-10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/20 rounded-full blur-[80px]" />
                      <div className="relative z-10">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 block">Currently Supporting</span>
                        <h3 className="text-5xl font-serif tracking-tight tracking-tight font-bold text-emerald-950 mb-4">{mySelection.charity.name}</h3>
                        <p className="text-slate-600 text-lg max-w-3xl mb-8 leading-relaxed">{mySelection.charity.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="bg-emerald-50/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200">
                            <p className="text-sm text-slate-500 font-medium">Your Contribution</p>
                            <p className="text-4xl font-serif tracking-tight tracking-tight font-bold text-emerald-950 mt-1">{mySelection.contributionPercentage}% <span className="text-sm font-normal text-slate-500">of subscription</span></p>
                          </div>
                          
                          <button
                            onClick={() => {
                              setCharityForm({
                                charityId: mySelection.charity._id,
                                contributionPercentage: mySelection.contributionPercentage
                              });
                              setShowCharityModal(true);
                            }}
                            className="px-6 py-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-semibold rounded-2xl transition-colors"
                          >
                            Change Preferences
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center rounded-3xl border border-slate-200 mb-10">
                      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <h3 className="text-4xl font-serif tracking-tight tracking-tight font-bold text-emerald-950 mb-3">Make an Impact</h3>
                      <p className="text-slate-500 max-w-lg mx-auto mb-8">Select a charity to dedicate a portion of your subscription fee. You play, they benefit.</p>
                      <button
                        onClick={() => {
                          setCharityForm({ charityId: '', contributionPercentage: 10 });
                          setShowCharityModal(true);
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                      >
                        Choose a Charity Now
                      </button>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-emerald-950 mb-6">Available Causes</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {charities.map(charity => (
                      <div key={charity._id} className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">{charity.category || 'General'}</span>
                        <h4 className="text-lg font-bold text-emerald-950 mb-3">{charity.name}</h4>
                        <p className="text-sm text-slate-500 flex-grow mb-6">{charity.description}</p>
                        <button 
                          onClick={() => {
                            setCharityForm({ charityId: charity._id, contributionPercentage: 10 });
                            setShowCharityModal(true);
                          }}
                          className="w-full py-2 bg-emerald-50/50 backdrop-blur-md hover:bg-emerald-50 text-emerald-950 font-medium rounded-lg transition-colors border border-slate-200"
                        >
                          Support this cause
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'draws' && (
                <motion.div
                  key="draws"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-4xl font-serif tracking-tight tracking-tight font-bold mb-8 text-emerald-950">My Draw Participations</h2>
                  {!isActive ? (
                    <p className="text-slate-500 italic">Active subscription required to participate in draws</p>
                  ) : participations.length === 0 ? (
                    <div className="text-center py-12 bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center rounded-2xl border border-slate-200">
                      <p className="text-slate-500 text-lg">No participations yet. Keep adding scores!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {participations.map((participation) => (
                        <div key={participation._id} className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-slate-200 relative overflow-hidden">
                          {participation.prizeAmount > 0 && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px]" />
                          )}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6 gap-4 border-b border-slate-100 pb-4 relative z-10">
                            <div className="text-left">
                              <p className="font-bold text-xl text-emerald-950">Draw: {new Date(participation.draw.drawDate).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                              participation.draw.status === 'published' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                              'bg-emerald-50/50 backdrop-blur-md text-slate-600 border border-slate-200'
                            }`}>
                              {participation.draw.status}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-6 relative z-10">
                            <div className="bg-emerald-50/50 backdrop-blur-md p-4 rounded-xl">
                              <span className="text-sm text-slate-500 block mb-2 font-medium">Your Numbers</span>
                              <div className="flex flex-wrap gap-2">
                                {participation.userNumbers.map((num, idx) => (
                                  <span key={idx} className="w-10 h-10 flex items-center justify-center bg-emerald-500/20 text-emerald-300 rounded-lg font-bold text-lg border border-emerald-500/30">
                                    {num}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {participation.draw.status === 'published' && (
                              <div className="bg-emerald-50/50 backdrop-blur-md p-4 rounded-xl">
                                <span className="text-sm text-slate-500 block mb-2 font-medium">Winning Numbers</span>
                                <div className="flex flex-wrap gap-2">
                                  {participation.draw.winningNumbers.map((num, idx) => (
                                    <span key={idx} className="w-10 h-10 flex items-center justify-center bg-emerald-500/20 text-emerald-300 rounded-lg font-bold text-lg border border-emerald-500/30">
                                      {num}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {participation.draw.status === 'published' && (
                            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center relative z-10">
                              <span className="font-medium text-slate-600">
                                Matches: <span className="text-emerald-950 font-bold">{participation.matchCount}</span>
                              </span>
                              {participation.prizeAmount > 0 && (
                                <span className="font-bold text-xl text-emerald-400 flex items-center gap-2">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                  Won ${participation.prizeAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'winnings' && (
                <motion.div
                  key="winnings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-4xl font-serif tracking-tight tracking-tight font-bold mb-8 text-emerald-950">My Winnings</h2>
                  {winnings.length === 0 ? (
                    <div className="text-center py-12 bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center rounded-2xl border border-slate-200">
                      <p className="text-slate-500 text-lg">No winnings yet. Keep playing!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {winnings.map((winning) => (
                        <div key={winning._id} className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center p-10 rounded-2xl border border-emerald-500/30 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px]" />
                          <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase">
                                  {winning.matchType} Match
                                </span>
                                <span className="text-slate-500 text-sm font-medium">
                                  {new Date(winning.draw.drawDate).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-5xl font-serif tracking-tight tracking-tight font-bold text-emerald-400">
                                ${winning.prizeAmount.toFixed(2)}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <div className="bg-emerald-50/50 backdrop-blur-md p-3 rounded-lg border border-slate-200">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Verification</p>
                                <p className={`text-sm font-semibold capitalize ${
                                  winning.verificationStatus === 'verified' ? 'text-emerald-400' : 'text-yellow-400'
                                }`}>{winning.verificationStatus}</p>
                              </div>
                              {winning.verificationStatus === 'verified' && (
                                <div className="bg-emerald-50/50 backdrop-blur-md p-3 rounded-lg border border-slate-200">
                                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Payout Status</p>
                                  <p className={`text-sm font-semibold capitalize ${
                                    winning.payoutStatus === 'paid' ? 'text-emerald-400' : 'text-slate-600'
                                  }`}>{winning.payoutStatus}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {winning.verificationStatus === 'pending' && !winning.proofUrl && (
                            <div className="mt-6 pt-4 border-t border-slate-200 relative z-10">
                              <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors text-sm">
                                Upload Verification Proof
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Score Modal */}
      <AnimatePresence>
        {showScoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f4f7f5]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center border border-slate-200 rounded-3xl p-10 max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px]" />
              <h3 className="text-4xl font-serif tracking-tight tracking-tight font-bold text-emerald-950 mb-6 relative z-10">
                {editingScore ? 'Edit Score' : 'Add New Score'}
              </h3>
              <form onSubmit={handleAddScore} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Stableford Score (1-45)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="45"
                    value={scoreForm.score}
                    onChange={(e) => setScoreForm({ ...scoreForm, score: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-50/50 backdrop-blur-md border border-slate-200 rounded-xl text-emerald-950 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Date Played
                  </label>
                  <input
                    type="date"
                    required
                    value={scoreForm.date}
                    onChange={(e) => setScoreForm({ ...scoreForm, date: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-50/50 backdrop-blur-md border border-slate-200 rounded-xl text-emerald-950 outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50"
                  >
                    Save Score
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScoreModal(false);
                      setEditingScore(null);
                    }}
                    className="flex-1 py-3 bg-emerald-50 text-emerald-950 font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subscribe Modal via CheckoutModal (if you want high fidelity mock stripe) */}
      <CheckoutModal 
        isOpen={showSubscribeModal} 
        onClose={() => setShowSubscribeModal(false)}
        onComplete={(plan) => handleSubscribe(plan)}
      />

      {/* Charity Modal */}
      <AnimatePresence>
        {showCharityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f4f7f5]/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/70 backdrop-blur-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-emerald-900/10 rounded-3xl flex flex-col items-center text-center border border-slate-200 rounded-3xl p-10 max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-[40px]" />
              <h3 className="text-4xl font-serif tracking-tight tracking-tight font-bold text-emerald-950 mb-6 relative z-10">Dedicate Impact</h3>
              <form onSubmit={handleSelectCharity} className="space-y-5 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Select Cause
                  </label>
                  <select
                    required
                    value={charityForm.charityId}
                    onChange={(e) => setCharityForm({ ...charityForm, charityId: e.target.value })}
                    className="w-full px-4 py-3 bg-[#f4f7f5]/80 border border-slate-200 rounded-xl text-emerald-950 outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="" disabled>Select a charity</option>
                    {charities.map((charity) => (
                      <option key={charity._id} value={charity._id}>
                        {charity.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Contribution Percentage (10-100%)
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="100"
                    value={charityForm.contributionPercentage}
                    onChange={(e) => setCharityForm({ ...charityForm, contributionPercentage: e.target.value })}
                    className="w-full px-4 py-3 bg-emerald-50/50 backdrop-blur-md border border-slate-200 rounded-xl text-emerald-950 outline-none focus:border-amber-500 transition-colors"
                  />
                  {subscription && (
                    <p className="text-sm text-amber-400 mt-2 font-medium">
                      Est. ${((subscription.amount || 15) * charityForm.contributionPercentage / 100).toFixed(2)} contribution per period
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-[0_0_15px_rgba(192,38,211,0.4)] transition-all"
                  >
                    Confirm Impact
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCharityModal(false)}
                    className="flex-1 py-3 bg-emerald-50 text-emerald-950 font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
