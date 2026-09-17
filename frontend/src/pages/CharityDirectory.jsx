import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { selectCharity } from '../store/charitySlice';

const CharityDirectory = () => {
  const dispatch = useDispatch();
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const { mySelection } = useSelector((state) => state.charity);
  
  const categories = ['All', 'Health', 'Education', 'Environment', 'Animals', 'Human Services'];

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const query = new URLSearchParams();
        if (search) query.append('search', search);
        if (category && category !== 'All') query.append('category', category);
        
        const { data } = await api.get(`/charities?${query.toString()}`);
        setCharities(data);
      } catch (e) {
        console.error('Failed to fetch charities', e);
      }
    };
    
    // Debounce search slightly
    const timeoutId = setTimeout(() => {
      fetchCharities();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [search, category]);

  const handleSelect = async (charityId) => {
    try {
      await dispatch(selectCharity({ charityId, contributionPercentage: 10 })).unwrap();
      alert('Charity selected successfully! (Default 10% contribution)');
    } catch (e) {
      alert(e.message || 'Failed to select charity');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-serif tracking-tight tracking-tight font-extrabold text-gray-900 mb-4">Our Charity Partners</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the incredible organizations you can support with your Digital Heroes subscription. 
            Search by name or filter by category.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  (category === cat) || (!category && cat === 'All')
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {charities.map((charity, index) => (
            <motion.div
              key={charity._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {charity.images && charity.images.length > 0 ? (
                <img src={charity.images[0]} alt={charity.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-emerald-500 to-purple-600 flex items-center justify-center">
                  <span className="text-emerald-950 text-4xl font-serif tracking-tight tracking-tight font-bold opacity-50">{charity.name.substring(0, 1)}</span>
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{charity.name}</h3>
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded font-medium">
                    {charity.category || 'General'}
                  </span>
                </div>
                <p className="text-gray-600 mb-6 flex-1 line-clamp-4">{charity.description}</p>
                
                {charity.upcomingEvents && charity.upcomingEvents.length > 0 && (
                  <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Upcoming Events</p>
                    {charity.upcomingEvents.slice(0, 2).map((e, i) => (
                      <div key={i} className="text-sm text-gray-700 mb-1">
                        • <span className="font-medium">{e.title}</span> ({new Date(e.date).toLocaleDateString()})
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  onClick={() => handleSelect(charity._id)}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${
                    mySelection?.charity?._id === charity._id
                      ? 'bg-green-100 text-green-700 border-2 border-green-500'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {mySelection?.charity?._id === charity._id ? 'Currently Supporting' : 'Support This Cause'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {charities.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl text-gray-500">No charities found matching your criteria.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharityDirectory;
