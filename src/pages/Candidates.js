import React, { useState, useEffect } from 'react';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    position: '',
    experience: '',
    skills: ''
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/candidates`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/candidates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCandidate),
      });
      
      if (response.ok) {
        await fetchCandidates();
        setNewCandidate({ name: '', email: '', position: '', experience: '', skills: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading candidates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          {showAddForm ? 'Cancel' : 'Add Candidate'}
        </button>
      </div>

      {/* Add Candidate Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Candidate</h2>
          <form onSubmit={handleAddCandidate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newCandidate.email}
                onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                placeholder="Position Applied For"
                value={newCandidate.position}
                onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                className="p-2 border border-gray-300 rounded"
                required
              />
              <input
                type="text"
                placeholder="Years of Experience"
                value={newCandidate.experience}
                onChange={(e) => setNewCandidate({...newCandidate, experience: e.target.value})}
                className="p-2 border border-gray-300 rounded"
              />
            </div>
            <textarea
              placeholder="Skills (comma separated)"
              value={newCandidate.skills}
              onChange={(e) => setNewCandidate({...newCandidate, skills: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded h-24"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded"
            >
              Add Candidate
            </button>
          </form>
        </div>
      )}

      {/* Candidates List */}
      <div className="bg-white rounded-lg shadow">
        {candidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {candidates.map((candidate, index) => (
                  <tr key={candidate.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{candidate.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{candidate.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{candidate.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{candidate.experience || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(candidate.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>No candidates yet. Add your first candidate to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;
