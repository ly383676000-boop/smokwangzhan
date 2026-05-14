import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'editor';
  is_active: number;
  created_at: string;
  updated_at: string;
}

export default function UserManagement() {
  const { token, isAdmin, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'editor' as 'admin' | 'editor'
  });

  const handleBack = () => {
    navigate('/admin');
  };

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  // Fetch users
  useEffect(() => {
    if (!token) return;

    fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const url = editingUser
      ? `/api/admin/users/${editingUser.id}`
      : '/api/admin/users';
    const method = editingUser ? 'PUT' : 'POST';

    try {
      const body: Record<string, string> = { role: formData.role };
      if (!editingUser) {
        body.username = formData.username;
        body.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save user');
      }

      // Refresh users
      const refreshRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const refreshData = await refreshRes.json();
      setUsers(refreshData);

      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', role: 'editor' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
    setShowModal(true);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user "${user.username}"?`)) return;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== user.id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: user.is_active ? 0 : 1 })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user');
      }

      // Refresh users
      const refreshRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const refreshData = await refreshRes.json();
      setUsers(refreshData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleResetPassword = async (user: User) => {
    const newPassword = prompt(`Reset password for "${user.username}":\nEnter new password (min 4 characters):`);
    if (!newPassword || newPassword.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reset password');
      }

      alert(`Password for "${user.username}" has been reset.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage admin accounts</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={() => {
                setEditingUser(null);
                setFormData({ username: '', password: '', role: 'editor' });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition"
            >
              + Add User
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
            <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 font-medium text-gray-300">Username</th>
                  <th className="text-left p-4 font-medium text-gray-300">Role</th>
                  <th className="text-left p-4 font-medium text-gray-300">Status</th>
                  <th className="text-left p-4 font-medium text-gray-300">Created</th>
                  <th className="text-right p-4 font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="p-4">
                      <span className="font-medium">{user.username}</span>
                      {user.id === currentUser?.username && (
                        <span className="ml-2 text-xs text-amber-400">(you)</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-2 py-1 rounded text-xs font-medium transition cursor-pointer ${
                          user.is_active
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1 text-sm text-blue-400 hover:text-blue-300 mr-2 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        className="px-3 py-1 text-sm text-yellow-400 hover:text-yellow-300 mr-2 cursor-pointer"
                      >
                        Reset Pwd
                      </button>
                      {user.id !== currentUser?.username && (
                        <button
                          onClick={() => handleDelete(user)}
                          className="px-3 py-1 text-sm text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  disabled={!!editingUser}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50"
                  placeholder="Enter username"
                  required={!editingUser}
                  minLength={3}
                />
              </div>

              {!editingUser && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="Enter password"
                    required
                    minLength={4}
                  />
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'editor' })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="editor">Editor (can manage products & orders)</option>
                  <option value="admin">Admin (full access)</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
