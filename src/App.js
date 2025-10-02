import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CandidateIntake from './components/CandidateIntake';
import ResumeInterview from './components/ResumeInterview';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Candidates from './pages/Candidates';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Candidate intake route without header */}
          <Route path="/register" element={<CandidateIntake />} />
          
          {/* Resume interview route without header */}
          <Route path="/new-interview" element={<ResumeInterview />} />
          
          {/* Routes with header */}
          <Route path="/*" element={
            <>
              <Header />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/interview" element={<Interview />} />
                  <Route path="/interview/:id" element={<Interview />} />
                  <Route path="/candidates" element={<Candidates />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;