import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    totalInterviews: 0,
    averageScore: 0,
    topSkills: [],
    interviewsByMonth: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/candidates`);
      if (response.ok) {
        const candidates = await response.json();
        
        // Calculate analytics
        const totalInterviews = candidates.length;
        const averageScore = candidates.length > 0 
          ? Math.round(candidates.reduce((sum, c) => sum + (c.score || 0), 0) / candidates.length)
          : 0;

        // Extract skills frequency
        const skillsMap = {};
        candidates.forEach(candidate => {
          if (candidate.skills) {
            const skills = candidate.skills.split(',').map(s => s.trim());
            skills.forEach(skill => {
              skillsMap[skill] = (skillsMap[skill] || 0) + 1;
            });
          }
        });

        const topSkills = Object.entries(skillsMap)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([skill, count]) => ({ skill, count }));

        setAnalytics({
          totalInterviews,
          averageScore,
          topSkills,
          interviewsByMonth: [] // Could be implemented with more date tracking
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Interviews Conducted</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.totalInterviews}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Average Interview Score</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.averageScore || 'N/A'}</p>
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Most Common Skills</h3>
        {analytics.topSkills.length > 0 ? (
          <div className="space-y-3">
            {analytics.topSkills.map((skillData, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium">{skillData.skill}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(skillData.count / analytics.topSkills[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{skillData.count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No skills data available yet.</p>
        )}
      </div>

      {/* Interview Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Interview Performance Insights</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">Completion Rate</h4>
            <p className="text-sm text-blue-600 mt-1">
              {analytics.totalInterviews > 0 ? '100%' : '0%'} of started interviews were completed
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800">Response Quality</h4>
            <p className="text-sm text-green-600 mt-1">
              Average response length and quality metrics would appear here
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800">Interview Duration</h4>
            <p className="text-sm text-purple-600 mt-1">
              Average interview duration and time analysis would be shown here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
