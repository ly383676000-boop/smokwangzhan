import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import AdminPanel from './AdminPanel';

const AdminPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('admin_token');
    if (saved) {
      // Verify token
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then(res => {
          if (res.ok) {
            setToken(saved);
          } else {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
          }
        })
        .catch(() => {})
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-amber-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (token) {
    return <AdminPanel onLogout={() => setToken(null)} />;
  }

  return <LoginPage onLogin={(t) => setToken(t)} />;
};

export default AdminPage;
