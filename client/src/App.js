import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Pages and Components
import Builder from './pages/Builder';
import Dashboard from './pages/Dashboard';
import Auth from './components/Auth';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      {/* Show Nav bar only when logged in */}
      {user && (
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <span className="font-bold text-xl">SiteBuilder AI</span>
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-emerald-600">Dashboard</Link>
                <Link to="/builder" className="text-gray-600 hover:text-emerald-600">Builder</Link>
                <button onClick={handleLogout} className="px-3 py-2 text-sm font-semibold bg-gray-200 rounded-lg">Logout</button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />

        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/builder" 
          element={user ? <Builder user={user} /> : <Navigate to="/login" />} 
        />

        {/* Default route */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;