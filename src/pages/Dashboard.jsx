import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-xl font-bold">Digital Heroes</h1>
            <button 
              onClick={() => dispatch(logout())}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl py-10 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome, {user.name || user.email}</h2>
          <p className="text-gray-600">Role: {user.role}</p>
          
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-medium text-gray-900">Next Steps (MVP Implementation Pending)</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 list-disc pl-5">
              <li>Integration with Backend Scores API (add, edit, max 5 rolling)</li>
              <li>Charity Selection and 10% Contribution Logic</li>
              <li>Draw Simulation and Payout Status (Admin)</li>
              <li>Subscription Management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
