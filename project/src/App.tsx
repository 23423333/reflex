import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import HelpCenter from './components/HelpCenter';
import Reports from './components/Reports';
import TestCenter from './components/TestCenter';
import MessagingCenter from './components/MessagingCenter';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Router>
        <Routes>
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
          <Route
            path="/"
            element={session ? <Layout session={session} /> : <Navigate to="/login" />}
          >
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="messages" element={<MessagingCenter />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="reports" element={<Reports />} />
            <Route path="test" element={<TestCenter />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;