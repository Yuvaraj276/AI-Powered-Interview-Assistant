import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalCandidates: 0,
    avgScore: 0
  });

  const [recentInterviews, setRecentInterviews] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch real candidates data from backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/candidates`);
      if (response.ok) {
        const candidates = await response.json();
        setStats({
          totalInterviews: candidates.length,
          totalCandidates: candidates.length,
          avgScore: candidates.length > 0 ? Math.round(candidates.reduce((sum, c) => sum + (c.score || 0), 0) / candidates.length) : 0
        });
        
        // Show recent interviews
        setRecentInterviews(
          candidates.slice(-5).map(c => ({
            id: c.id,
            name: c.name,
            position: c.position || 'Not specified',
            date: new Date(c.createdAt || Date.now()).toLocaleDateString(),
            status: c.status || 'Completed'
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use default values if API fails
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Total Interviews</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalInterviews}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Candidates</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalCandidates}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Average Score</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.avgScore || '-'}</p>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Interviews</h3>
        </div>
        <div className="overflow-x-auto">
          {recentInterviews.length > 0 ? (
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentInterviews.map((interview, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{interview.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{interview.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{interview.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {interview.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>No interviews yet. Start conducting interviews to see them here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
