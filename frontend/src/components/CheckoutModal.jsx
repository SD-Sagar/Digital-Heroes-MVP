import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutModal = ({ isOpen, onClose, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [plan, setPlan] = useState('monthly'); // 'monthly' | 'yearly'

  const handleCheckout = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate Stripe network request
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onComplete(plan);
      }, 2000);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-slate-900 relative"
        >
          {/* Close button */}
          {!loading && !success && (
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}

          {success ? (
            <div className="p-12 text-center flex flex-col items-center justify-center h-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
              <p className="text-slate-500">Welcome to Digital Heroes.</p>
            </div>
          ) : (
            <>
              <div className="bg-[#f4f7f5] p-8 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">DH</span>
                  </div>
                  <span className="font-semibold text-slate-700">Digital Heroes Co.</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-4">Subscribe to Platform</h2>
                <p className="text-slate-500 text-sm mt-1">10% of your subscription goes to a charity of your choice.</p>
              </div>

              <form onSubmit={handleCheckout} className="p-8">
                {/* Plan Selection */}
                <div className="flex gap-4 mb-8">
                  <div
                    onClick={() => setPlan('monthly')}
                    className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${plan === 'monthly' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200'}`}
                  >
                    <p className="text-sm font-semibold text-slate-700 mb-1">Monthly</p>
                    <p className="text-2xl font-bold text-slate-900">$15<span className="text-sm font-normal text-slate-500">/mo</span></p>
                  </div>
                  <div
                    onClick={() => setPlan('yearly')}
                    className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all relative ${plan === 'yearly' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-200'}`}
                  >
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Save 20%</div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Yearly</p>
                    <p className="text-2xl font-bold text-slate-900">$144<span className="text-sm font-normal text-slate-500">/yr</span></p>
                  </div>
                </div>

                {/* Mock Card Input */}
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Card Information</label>
                    <div className="border border-slate-200 rounded-lg p-3 flex items-center bg-white shadow-sm">
                      <svg className="w-5 h-5 text-slate-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                      <input type="text" placeholder="4242 4242 4242 4242" maxLength="19" className="w-full outline-none text-slate-700" required />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
                        <input type="text" placeholder="MM / YY" maxLength="5" className="w-full outline-none text-slate-700" required />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm flex items-center">
                        <input type="text" placeholder="CVC" maxLength="4" className="w-full outline-none text-slate-700" required />
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="border border-slate-200 rounded-lg p-3 bg-white shadow-sm">
                      <input type="text" placeholder="Name on card" maxLength="50" className="w-full outline-none text-slate-700" required />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl transition-colors relative overflow-hidden flex justify-center items-center h-14"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <span>Subscribe - {plan === 'monthly' ? '$15.00' : '$144.00'}</span>
                  )}
                </button>
                <div className="mt-4 flex items-center justify-center gap-1 text-slate-400 text-xs">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                  Payments are secure and encrypted. (Mock Mode)
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CheckoutModal;
