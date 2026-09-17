import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-emerald-950 font-sans relative overflow-x-hidden">
      {/* Premium Decorative Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[100px] opacity-60 translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[100px] opacity-60 -translate-x-1/4 translate-y-1/4 pointer-events-none"></div>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center transition-all">
        <div className="text-3xl font-serif tracking-tight font-black text-emerald-950">
          DIGITAL<span className="text-amber-500">HEROES</span>.
        </div>
        <div className="space-x-4">
          <button onClick={() => navigate('/login')} className="text-emerald-950 hover:text-emerald-700 transition-colors font-bold text-sm tracking-wide">LOG IN</button>
          <button onClick={() => navigate('/signup')} className="bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-wide transition-all shadow-md">
            JOIN CLUB
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white shadow-sm border border-emerald-100 text-sm font-bold text-emerald-800 mb-8 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Season 1 is Live • Play With Purpose
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif tracking-tight font-extrabold text-emerald-950 mb-6 leading-tight">
            Perform. <span className="text-emerald-700 italic">Prosper.</span> <br />
            Provide.
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The premium platform that transforms your on-course performance into real-world impact. Enter your scores, dominate the algorithm, and support causes that matter.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-10 py-4 bg-emerald-800 hover:bg-emerald-700 text-white rounded-full font-bold text-lg shadow-xl shadow-emerald-900/20 transition-all w-full sm:w-auto uppercase tracking-wide"
            >
              Start Your Journey
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/charities')}
              className="px-10 py-4 bg-white text-emerald-900 border-2 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50 rounded-full font-bold text-lg transition-all w-full sm:w-auto uppercase tracking-wide"
            >
              Explore Charities
            </motion.button>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto w-full pb-20"
        >
          {[
            { title: "Track Performance", desc: "Log your Stableford scores and let our algorithm calculate your winning potential.", icon: "⛳" },
            { title: "Premium Prize Pools", desc: "40% of the pool goes to the jackpot. The better you play, the better your odds.", icon: "🏆" },
            { title: "Real Impact", desc: "You choose where your 10% contribution goes. See your charitable impact grow.", icon: "🌍" }
          ].map((feature, i) => (
            <div key={i} className="bg-white shadow-xl rounded-3xl p-10 border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-serif tracking-tight font-bold text-emerald-950 mb-3">{feature.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;
