'use client';

import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Users,
  Settings,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Database,
  Search,
  Sparkles,
  Layers,
  Activity,
  CreditCard,
} from 'lucide-react';

export default function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'keys' | 'config' | 'flags' | 'audits'>('overview');

  // Data states
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [appConfigs, setAppConfigs] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [cacheVersion, setCacheVersion] = useState<string>('1');

  // Key form modal/state
  const [newKeyService, setNewKeyService] = useState('gemini');
  const [newKeyName, setNewKeyName] = useState('primary');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyPurpose, setNewKeyPurpose] = useState('scan');
  const [newKeyPriority, setNewKeyPriority] = useState('1');
  const [addingKey, setAddingKey] = useState(false);

  // Status banners
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Check existing admin session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Load admin data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllAdminData();
    }
  }, [isAuthenticated]);

  async function loadAllAdminData() {
    setLoading(true);
    try {
      const [configRes, usersRes, keysRes] = await Promise.all([
        fetch('/api/admin/config'),
        fetch('/api/admin/users'),
        fetch('/api/admin/keys'),
      ]);

      if (configRes.ok) {
        const data = await configRes.json();
        setAppConfigs(data.appConfig || []);
        setFeatureFlags(data.featureFlags || []);
        setAuditLogs(data.recentAudits || []);
        const cv = (data.appConfig || []).find((c: any) => c.key === 'cache_version');
        if (cv) setCacheVersion(cv.value);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (keysRes.ok) {
        const data = await keysRes.json();
        setApiKeys(data.keys || []);
      }
    } catch (err: any) {
      showMessage('error', `Failed to load admin data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  }

  // Handle Admin Password Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setSubmittingAuth(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        setAuthError(data.error || 'Access denied');
      }
    } catch {
      setAuthError('Connection error to admin auth');
    } finally {
      setSubmittingAuth(false);
    }
  }

  // Handle Logout
  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
  }

  // Update User Plan or Ban
  async function handleUpdateUser(userId: string, updates: any) {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
      if (res.ok) {
        showMessage('success', 'User updated successfully');
        loadAllAdminData();
      } else {
        const err = await res.json();
        showMessage('error', err.error || 'Update failed');
      }
    } catch (err: any) {
      showMessage('error', err.message);
    }
  }

  // Update App Config
  async function handleUpdateConfig(key: string, value: string) {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'app_config', key, value }),
      });
      if (res.ok) {
        const data = await res.json();
        setCacheVersion(data.cacheVersion);
        showMessage('success', `Setting "${key}" updated & cache refreshed!`);
        loadAllAdminData();
      } else {
        const err = await res.json();
        showMessage('error', err.error || 'Failed to update config');
      }
    } catch (err: any) {
      showMessage('error', err.message);
    }
  }

  // Toggle Feature Flag
  async function handleToggleFlag(flagKey: string, currentValue: boolean) {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'feature_flags', key: flagKey, value: !currentValue }),
      });
      if (res.ok) {
        showMessage('success', `Flag "${flagKey}" toggled to ${!currentValue}`);
        loadAllAdminData();
      }
    } catch (err: any) {
      showMessage('error', err.message);
    }
  }

  // Add API Key
  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyValue.trim()) return;

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: newKeyService,
          key_name: newKeyName,
          key_value: newKeyValue,
          purpose: newKeyPurpose,
          priority: Number(newKeyPriority),
        }),
      });

      if (res.ok) {
        setNewKeyValue('');
        setAddingKey(false);
        showMessage('success', 'New API key registered to vault!');
        loadAllAdminData();
      } else {
        const err = await res.json();
        showMessage('error', err.error || 'Failed to add key');
      }
    } catch (err: any) {
      showMessage('error', err.message);
    }
  }

  // Delete API Key
  async function handleDeleteKey(id: string) {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      const res = await fetch(`/api/admin/keys?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showMessage('success', 'API key deleted');
        loadAllAdminData();
      }
    } catch (err: any) {
      showMessage('error', err.message);
    }
  }

  // Force cache invalidation
  async function handleInvalidateCache() {
    handleUpdateConfig('cache_version', String(Date.now()));
  }

  // ==============================================================
  // 1. PASSWORD GATE (WHEN NOT AUTHENTICATED)
  // ==============================================================
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="h-full w-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <Lock className="h-7 w-7 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Master Portal</h1>
            <p className="text-xs text-slate-400 mt-2">
              100% Password-Protected Access for AEO Tracker Backend
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Master Security Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingAuth}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all text-sm uppercase tracking-wide cursor-pointer disabled:opacity-50"
            >
              {submittingAuth ? 'Verifying Key...' : 'Unlock Portal →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
            <span className="text-[11px] text-slate-500 font-mono">
              Default Seed Key: <code className="text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">Admin@2026!</code>
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Authenticating Admin Session...
      </div>
    );
  }

  // ==============================================================
  // 2. AUTHENTICATED ADMIN DASHBOARD
  // ==============================================================
  const filteredUsers = users.filter((u) =>
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-200 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">AEO Backend Master</span>
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Protected Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Zero-code runtime database management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-400">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>Cache v{cacheVersion}</span>
            <button
              onClick={handleInvalidateCache}
              title="Force clear cache on all Cloudflare Worker instances"
              className="text-slate-400 hover:text-white ml-1 p-0.5"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border-b border-emerald-500/20'
              : 'bg-rose-500/15 text-rose-400 border-b border-rose-500/20'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-8 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: Activity },
            { key: 'users', label: 'Users & Subscriptions', icon: Users, badge: users.length },
            { key: 'keys', label: 'API Key Vault', icon: Key, badge: apiKeys.length },
            { key: 'config', label: 'System Settings', icon: Settings },
            { key: 'flags', label: 'Feature Flags', icon: ToggleRight, badge: featureFlags.length },
            { key: 'audits', label: 'Audit Logs', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-md text-[10px]">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW METRICS                                         */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Total Users</span>
                <div className="text-3xl font-extrabold text-white mt-2">{users.length}</div>
                <span className="text-xs text-emerald-400 mt-1 block">Active Profiles in Database</span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Paid Subscribers</span>
                <div className="text-3xl font-extrabold text-white mt-2">
                  {users.filter((u) => u.plan === 'starter' || u.plan === 'pro').length}
                </div>
                <span className="text-xs text-blue-400 mt-1 block">Starter & Pro Accounts</span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Active API Keys</span>
                <div className="text-3xl font-extrabold text-white mt-2">
                  {apiKeys.filter((k) => k.is_active).length}
                </div>
                <span className="text-xs text-emerald-400 mt-1 block">In Rotation Vault</span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Feature Flags Active</span>
                <div className="text-3xl font-extrabold text-white mt-2">
                  {featureFlags.filter((f) => f.is_enabled).length} / {featureFlags.length}
                </div>
                <span className="text-xs text-purple-400 mt-1 block">Runtime Toggles</span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-2">Backend Control Quick Actions</h2>
              <p className="text-xs text-slate-400 mb-6">
                Make instant live adjustments without writing code or redeploying the app.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-slate-700 transition-all group"
                >
                  <Users className="h-5 w-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-white">Manage Users</div>
                  <div className="text-xs text-slate-400 mt-1">Upgrade plans, ban accounts, override keyword limits</div>
                </button>

                <button
                  onClick={() => setActiveTab('keys')}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-slate-700 transition-all group"
                >
                  <Key className="h-5 w-5 text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-white">Add API Keys</div>
                  <div className="text-xs text-slate-400 mt-1">Register new Gemini, OpenAI, or Perplexity keys</div>
                </button>

                <button
                  onClick={() => setActiveTab('config')}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left hover:border-slate-700 transition-all group"
                >
                  <Settings className="h-5 w-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-bold text-white">System Config</div>
                  <div className="text-xs text-slate-400 mt-1">Adjust AI delays, currency rates, master passwords</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: USER MANAGEMENT                                         */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white">User Accounts & Plans</h2>
                <p className="text-xs text-slate-400">Upgrade user subscriptions, toggle bans, and manage limits</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search email or name..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">User</th>
                      <th className="px-6 py-3.5">Plan Tier</th>
                      <th className="px-6 py-3.5">Admin Role</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Total Scans</th>
                      <th className="px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{user.email}</div>
                          {user.full_name && <div className="text-[11px] text-slate-400">{user.full_name}</div>}
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{user.id}</div>
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={user.plan || 'free'}
                            onChange={(e) => handleUpdateUser(user.id, { plan: e.target.value })}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                          >
                            <option value="free">Free ($0)</option>
                            <option value="starter">Starter ($49)</option>
                            <option value="pro">Pro ($79)</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleUpdateUser(user.id, { is_admin: !user.is_admin })}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                              user.is_admin
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {user.is_admin ? 'Admin' : 'Regular'}
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              user.is_banned
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {user.is_banned ? 'Banned' : 'Active'}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-mono text-slate-300">
                          {user.total_scans_run || 0}
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleUpdateUser(user.id, { is_banned: !user.is_banned })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                              user.is_banned
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            }`}
                          >
                            {user.is_banned ? 'Unban User' : 'Ban User'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: API KEY VAULT                                           */}
        {/* ============================================================== */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">API Key Vault</h2>
                <p className="text-xs text-slate-400">
                  Multiple keys per engine with priority fallback & error tracking
                </p>
              </div>

              <button
                onClick={() => setAddingKey(!addingKey)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Register New Key</span>
              </button>
            </div>

            {/* New Key Form */}
            {addingKey && (
              <form onSubmit={handleAddKey} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Register API Key</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Service</label>
                    <select
                      value={newKeyService}
                      onChange={(e) => setNewKeyService(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI (ChatGPT)</option>
                      <option value="perplexity">Perplexity Sonar</option>
                      <option value="grok">xAI Grok</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="resend">Resend (Email)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Key Name / Label</label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. primary or fallback"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Purpose</label>
                    <select
                      value={newKeyPurpose}
                      onChange={(e) => setNewKeyPurpose(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="scan">Scan Execution</option>
                      <option value="briefs">Fix Briefs</option>
                      <option value="public_scan">Public Audits</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Priority (1 = Highest)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newKeyPriority}
                      onChange={(e) => setNewKeyPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Secret Key Value</label>
                  <input
                    type="password"
                    required
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    placeholder="sk-... or AIzaSy..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddingKey(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400"
                  >
                    Save Key
                  </button>
                </div>
              </form>
            )}

            {/* Keys Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Service</th>
                      <th className="px-6 py-3.5">Label</th>
                      <th className="px-6 py-3.5">Purpose</th>
                      <th className="px-6 py-3.5">Priority</th>
                      <th className="px-6 py-3.5">Error Count</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {apiKeys.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                          No database API keys registered yet. System is using environment variables. Click &quot;Register New Key&quot; above to add one.
                        </td>
                      </tr>
                    ) : (
                      apiKeys.map((key) => (
                        <tr key={key.id} className="hover:bg-slate-800/30">
                          <td className="px-6 py-4 font-bold text-white capitalize">{key.service}</td>
                          <td className="px-6 py-4 text-slate-300">{key.key_name}</td>
                          <td className="px-6 py-4 font-mono text-[11px] text-teal-400">{key.purpose}</td>
                          <td className="px-6 py-4 font-mono text-white">#{key.priority}</td>
                          <td className="px-6 py-4">
                            <span className={key.error_count > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                              {key.error_count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                key.is_active
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              }`}
                            >
                              {key.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteKey(key.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SYSTEM CONFIG                                           */}
        {/* ============================================================== */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Global System Settings</h2>
              <p className="text-xs text-slate-400">
                Values stored in <code className="text-emerald-400 font-mono">public.app_config</code> table. Edit and click Update to save.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appConfigs.map((cfg) => (
                <div key={cfg.key} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-emerald-400">{cfg.key}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                        {cfg.value_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{cfg.description || 'System parameter'}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type={cfg.is_secret ? 'password' : 'text'}
                      defaultValue={cfg.value}
                      id={`cfg-${cfg.key}`}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById(`cfg-${cfg.key}`) as HTMLInputElement;
                        if (el) handleUpdateConfig(cfg.key, el.value);
                      }}
                      className="px-3.5 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: FEATURE FLAGS                                           */}
        {/* ============================================================== */}
        {activeTab === 'flags' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Runtime Feature Flags</h2>
              <p className="text-xs text-slate-400">
                Instantly turn features on or off for users without any deployments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featureFlags.map((flag) => (
                <div
                  key={flag.flag_key}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{flag.flag_key}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                        {flag.applies_to}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{flag.description || 'Feature toggle'}</p>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(flag.flag_key, flag.is_enabled)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    {flag.is_enabled ? (
                      <ToggleRight className="h-8 w-8 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-slate-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: AUDIT LOGS                                              */}
        {/* ============================================================== */}
        {activeTab === 'audits' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">Security & Action Audit Logs</h2>
              <p className="text-xs text-slate-400">
                Timestamped audit records of changes made across admin controls.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-3.5">Action</th>
                      <th className="px-6 py-3.5">Target Type</th>
                      <th className="px-6 py-3.5">Target ID</th>
                      <th className="px-6 py-3.5">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          No audit records yet. Changes will appear here automatically.
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/30">
                          <td className="px-6 py-4 font-mono font-bold text-emerald-400">{log.action}</td>
                          <td className="px-6 py-4 text-slate-300">{log.target_type}</td>
                          <td className="px-6 py-4 font-mono text-[11px] text-slate-400">{log.target_id || '-'}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
