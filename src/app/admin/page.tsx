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
  Cpu,
  Terminal,
  Mail,
  Zap,
  Radio,
  Download,
  Play,
  StopCircle,
  UserCheck,
  Clock,
} from 'lucide-react';

export default function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'queue' | 'watchdog' | 'keys' | 'security' | 'config' | 'db'
  >('overview');

  // Core Data states
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Overview & Cost Guard State
  const [costData, setCostData] = useState<{
    todaySpendUsd: number;
    dailyCapUsd: number;
    emergencyAiStop: boolean;
    engineBreakdown: any[];
    dailyHistory: any[];
  }>({
    todaySpendUsd: 0,
    dailyCapUsd: 25,
    emergencyAiStop: false,
    engineBreakdown: [],
    dailyHistory: [],
  });

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [grantModalUser, setGrantModalUser] = useState<any | null>(null);
  const [grantPlan, setGrantPlan] = useState('growth');
  const [grantDuration, setGrantDuration] = useState('30');
  const [grantReason, setGrantReason] = useState('Customer Support Courtesy');

  // Queue State
  const [queueRuns, setQueueRuns] = useState<any[]>([]);
  const [queueStats, setQueueStats] = useState({
    running: 0,
    pending: 0,
    stuck: 0,
    failedToday: 0,
    completedToday: 0,
  });

  // Watchdog & Playground State
  const [watchdogSummary, setWatchdogSummary] = useState<Record<string, any>>({});
  const [testingEngines, setTestingEngines] = useState(false);
  const [promptInput, setPromptInput] = useState('Evaluate the visibility of {{brand}} for query "{{keyword}}"');
  const [playgroundBrand, setPlaygroundBrand] = useState('Acme Cloud');
  const [playgroundDomain, setPlaygroundDomain] = useState('acme.com');
  const [playgroundKeyword, setPlaygroundKeyword] = useState('best cloud database');
  const [playgroundEngine, setPlaygroundEngine] = useState('gemini');
  const [playgroundResult, setPlaygroundResult] = useState<any | null>(null);
  const [runningPlayground, setRunningPlayground] = useState(false);

  // Keys State
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyService, setNewKeyService] = useState('gemini');
  const [newKeyName, setNewKeyName] = useState('primary');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyPurpose, setNewKeyPurpose] = useState('scan');
  const [newKeyPriority, setNewKeyPriority] = useState('1');
  const [addingKey, setAddingKey] = useState(false);

  // Security & Webhook DLQ State
  const [blacklistedIps, setBlacklistedIps] = useState<any[]>([]);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newIpReason, setNewIpReason] = useState('');
  const [newIpHours, setNewIpHours] = useState('24');
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
  const [failedWebhooksCount, setFailedWebhooksCount] = useState(0);

  // Config & Templates State
  const [appConfigs, setAppConfigs] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<Record<string, any>>({});
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('email_template_scan_complete');
  const [templateContentInput, setTemplateContentInput] = useState('');

  // DB & Hygiene State
  const [hygieneStats, setHygieneStats] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

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
      const [
        configRes,
        usersRes,
        keysRes,
        costRes,
        queueRes,
        watchdogRes,
        blacklistRes,
        webhooksRes,
        templatesRes,
        hygieneRes,
      ] = await Promise.all([
        fetch('/api/admin/config'),
        fetch('/api/admin/users'),
        fetch('/api/admin/keys'),
        fetch('/api/admin/metrics/cost'),
        fetch('/api/admin/scans/queue'),
        fetch('/api/admin/watchdog'),
        fetch('/api/admin/security/blacklist'),
        fetch('/api/admin/webhooks?failedOnly=true'),
        fetch('/api/admin/templates/email'),
        fetch('/api/admin/hygiene'),
      ]);

      if (configRes.ok) {
        const data = await configRes.json();
        setAppConfigs(data.appConfig || []);
        setFeatureFlags(data.featureFlags || []);
        setAuditLogs(data.recentAudits || []);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (keysRes.ok) {
        const data = await keysRes.json();
        setApiKeys(data.keys || []);
      }

      if (costRes.ok) {
        const data = await costRes.json();
        setCostData(data);
      }

      if (queueRes.ok) {
        const data = await queueRes.json();
        setQueueRuns(data.runs || []);
        setQueueStats(data.stats || queueStats);
      }

      if (watchdogRes.ok) {
        const data = await watchdogRes.json();
        setWatchdogSummary(data.summary || {});
      }

      if (blacklistRes.ok) {
        const data = await blacklistRes.json();
        setBlacklistedIps(data.items || []);
      }

      if (webhooksRes.ok) {
        const data = await webhooksRes.json();
        setWebhookEvents(data.events || []);
        setFailedWebhooksCount(data.failedCount || 0);
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setEmailTemplates(data.templates || {});
        if (data.templates?.email_template_scan_complete) {
          setTemplateContentInput(data.templates.email_template_scan_complete.currentValue);
        }
      }

      if (hygieneRes.ok) {
        const data = await hygieneRes.json();
        setHygieneStats(data.stats || null);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Auth Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingAuth(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setStatusMessage({ type: 'success', text: 'Admin authorization granted' });
      } else {
        setAuthError(data.error || 'Invalid admin credentials');
      }
    } catch (err: any) {
      setAuthError('Connection error: ' + err.message);
    } finally {
      setSubmittingAuth(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    setPasswordInput('');
  }

  // Cost & Budget Guard Actions
  async function handleUpdateBudget(dailyCap: number) {
    const res = await fetch('/api/admin/metrics/cost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyCapUsd: dailyCap }),
    });
    if (res.ok) {
      setCostData((prev) => ({ ...prev, dailyCapUsd: dailyCap }));
      setStatusMessage({ type: 'success', text: `Daily budget cap updated to $${dailyCap.toFixed(2)}` });
    }
  }

  async function handleToggleEmergencyAi(current: boolean) {
    const nextVal = !current;
    const res = await fetch('/api/admin/metrics/cost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emergencyAiStop: nextVal }),
    });
    if (res.ok) {
      setCostData((prev) => ({ ...prev, emergencyAiStop: nextVal }));
      setStatusMessage({
        type: nextVal ? 'error' : 'success',
        text: nextVal ? 'Emergency AI Stop ENGAGED. All AI calls halted.' : 'AI operations resumed.',
      });
    }
  }

  // Queue Actions
  async function handleKillScan(scanId: string) {
    const res = await fetch('/api/admin/scans/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'kill', scanId }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: 'Scan terminated successfully' });
      loadAllAdminData();
    }
  }

  async function handleRetryScan(scanId: string) {
    const res = await fetch('/api/admin/scans/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'retry', scanId }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: 'Scan reset to pending queue' });
      loadAllAdminData();
    }
  }

  async function handleKillAllStuck() {
    const res = await fetch('/api/admin/scans/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'kill_all_stuck' }),
    });
    if (res.ok) {
      const data = await res.json();
      setStatusMessage({ type: 'success', text: data.message });
      loadAllAdminData();
    }
  }

  // User Impersonation
  async function handleImpersonateUser(userId: string) {
    const res = await fetch('/api/admin/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      window.location.href = data.redirectUrl || '/dashboard';
    } else {
      setStatusMessage({ type: 'error', text: data.error || 'Failed to start impersonation' });
    }
  }

  // Manual Plan Grant
  async function handleExecuteGrantPlan() {
    if (!grantModalUser) return;
    const res = await fetch('/api/admin/users/grant-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: grantModalUser.id,
        plan: grantPlan,
        durationDays: Number(grantDuration),
        reason: grantReason,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setStatusMessage({ type: 'success', text: data.message });
      setGrantModalUser(null);
      loadAllAdminData();
    } else {
      setStatusMessage({ type: 'error', text: data.error || 'Failed to grant plan' });
    }
  }

  // Watchdog synthetic tester
  async function handlePingEngines() {
    setTestingEngines(true);
    try {
      const res = await fetch('/api/admin/watchdog', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, any> = {};
        for (const r of data.results || []) {
          map[r.engine] = {
            status: r.status,
            latencyMs: r.latencyMs,
            errorMessage: r.error,
            checkedAt: r.checkedAt,
          };
        }
        setWatchdogSummary(map);
        setStatusMessage({ type: 'success', text: 'All AI engines synthetic ping completed' });
      }
    } finally {
      setTestingEngines(false);
    }
  }

  // Prompt Playground
  async function handleRunPlayground() {
    setRunningPlayground(true);
    setPlaygroundResult(null);
    try {
      const res = await fetch('/api/admin/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptTemplate: promptInput,
          brandName: playgroundBrand,
          domain: playgroundDomain,
          keyword: playgroundKeyword,
          engine: playgroundEngine,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPlaygroundResult(data);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Playground evaluation failed' });
      }
    } finally {
      setRunningPlayground(false);
    }
  }

  // IP Blacklist
  async function handleAddBlacklist(e: React.FormEvent) {
    e.preventDefault();
    if (!newIpAddress || !newIpReason) return;

    const res = await fetch('/api/admin/security/blacklist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip_address: newIpAddress,
        reason: newIpReason,
        expires_in_hours: Number(newIpHours),
      }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: `IP ${newIpAddress} blacklisted successfully` });
      setNewIpAddress('');
      setNewIpReason('');
      loadAllAdminData();
    }
  }

  async function handleRemoveBlacklist(ip: string) {
    const res = await fetch(`/api/admin/security/blacklist?ip=${encodeURIComponent(ip)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: `IP ${ip} removed from blacklist` });
      loadAllAdminData();
    }
  }

  // Webhook DLQ retry
  async function handleRetryWebhook(webhookId: number) {
    const res = await fetch('/api/admin/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'retry', webhookId }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: `Webhook #${webhookId} marked resolved` });
      loadAllAdminData();
    }
  }

  // Email Template Save
  async function handleSaveTemplate() {
    const res = await fetch('/api/admin/templates/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateKey: selectedTemplateKey,
        templateContent: templateContentInput,
      }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: 'Email template saved successfully' });
    }
  }

  // Database Hygiene Prune
  async function handleExecuteHygienePrune() {
    if (!confirm('Are you sure you want to prune raw query logs older than 90 days?')) return;
    const res = await fetch('/api/admin/hygiene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ retentionDays: 90 }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setStatusMessage({ type: 'success', text: data.message });
      loadAllAdminData();
    }
  }

  // App Config Update
  async function handleUpdateConfig(key: string, value: string) {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_config', key, value }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: `Updated config: ${key}` });
      loadAllAdminData();
    }
  }

  // Toggle Feature Flag
  async function handleToggleFlag(flagKey: string, current: boolean) {
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_flag', flagKey, isEnabled: !current }),
    });
    if (res.ok) {
      loadAllAdminData();
    }
  }

  // Ban/Unban User
  async function handleToggleBan(userId: string, currentBan: boolean) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: currentBan ? 'unban_user' : 'ban_user',
        userId,
      }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: `User status updated` });
      loadAllAdminData();
    }
  }

  // Add API Key
  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyValue) return;
    const res = await fetch('/api/admin/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_key',
        service: newKeyService,
        keyName: newKeyName,
        keyValue: newKeyValue,
        purpose: newKeyPurpose,
        priority: Number(newKeyPriority),
      }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: `Added new ${newKeyService} API key` });
      setAddingKey(false);
      setNewKeyValue('');
      loadAllAdminData();
    }
  }

  // Delete API Key
  async function handleDeleteKey(keyId: string) {
    const res = await fetch('/api/admin/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_key', keyId }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: 'API key removed' });
      loadAllAdminData();
    }
  }

  // Toggle API Key Active State
  async function handleToggleKeyActive(keyId: string, currentActive: boolean) {
    const res = await fetch('/api/admin/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle_active',
        keyId,
        isActive: !currentActive,
      }),
    });
    if (res.ok) {
      loadAllAdminData();
    }
  }

  // =========================================================================
  // VIEW 1: AUTHENTICATION GATE (Password Lock Screen)
  // =========================================================================
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 selection:bg-emerald-500 selection:text-slate-950">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Ops Control Center</h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              100% Password-Protected Backend Operations System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Master Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                autoFocus
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono"
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300 font-medium animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingAuth || !passwordInput}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submittingAuth ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Access Admin Portal
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LOADING SKELETON
  // =========================================================================
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mr-3" />
        Authenticating Admin Context...
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      u.email?.toLowerCase().includes(term) ||
      u.full_name?.toLowerCase().includes(term) ||
      u.id?.toLowerCase().includes(term)
    );
  });

  // Calculate budget %
  const spendPct = Math.min(100, Math.round((costData.todaySpendUsd / (costData.dailyCapUsd || 25)) * 100));

  // =========================================================================
  // VIEW 3: FULL ADMIN PORTAL COMMAND CENTER
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-20">
      {/* Top Operations Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white uppercase">AEO Operations Portal</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Phase 2 Super Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Live Cloudflare Edge Deployment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {costData.emergencyAiStop && (
            <span className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3 py-1 rounded-lg text-xs font-bold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" /> Emergency AI Stop Active
            </span>
          )}

          <button
            onClick={() => loadAllAdminData()}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/80 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Lock Portal
          </button>
        </div>
      </header>

      {/* Global Status Banner */}
      {statusMessage && (
        <div
          className={`mx-6 mt-4 p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white font-mono">
            ×
          </button>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <nav className="flex gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl overflow-x-auto">
          {[
            { id: 'overview', label: 'Command Center', icon: Activity },
            { id: 'users', label: 'Users & Subscriptions', icon: Users },
            { id: 'queue', label: 'Scan Queue', icon: Clock, badge: queueStats.stuck > 0 ? `${queueStats.stuck} stuck` : undefined },
            { id: 'watchdog', label: 'Engine Latency & Prompts', icon: Cpu },
            { id: 'keys', label: 'API Keys & Rotation', icon: Key },
            { id: 'security', label: 'IP Shield & Webhooks', icon: ShieldAlert, badge: failedWebhooksCount > 0 ? `${failedWebhooksCount} failed` : undefined },
            { id: 'config', label: 'Config & Email Templates', icon: Settings },
            { id: 'db', label: 'DB Hygiene & Audits', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] bg-rose-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW & COST GUARD                                   */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card 1: Today AI Spend & Cap */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Today AI Cost Guard</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">
                    ${costData.todaySpendUsd.toFixed(2)}{' '}
                    <span className="text-xs text-slate-500 font-normal">/ ${costData.dailyCapUsd.toFixed(2)} cap</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        spendPct > 80 ? 'bg-rose-500' : spendPct > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${spendPct}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{spendPct}% of daily budget used</span>
                  <button
                    onClick={() => {
                      const newCap = prompt('Enter new daily spend cap (USD):', String(costData.dailyCapUsd));
                      if (newCap && !isNaN(Number(newCap))) handleUpdateBudget(Number(newCap));
                    }}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Adjust Cap
                  </button>
                </div>
              </div>

              {/* Card 2: Emergency AI Stop Kill-switch */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">AI Master Killswitch</span>
                  <StopCircle className={`w-4 h-4 ${costData.emergencyAiStop ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">
                    {costData.emergencyAiStop ? 'Emergency Halted' : 'Engines Active'}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {costData.emergencyAiStop
                      ? 'All outgoing Gemini, OpenAI, & Perplexity scans are blocked.'
                      : 'All automated background scans operating normally.'}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleToggleEmergencyAi(costData.emergencyAiStop)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      costData.emergencyAiStop
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {costData.emergencyAiStop ? 'Resume AI Scans' : 'Engage Emergency AI Stop'}
                  </button>
                </div>
              </div>

              {/* Card 3: Live Scan Jobs */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Scan Runs (24h)</span>
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{queueStats.completedToday}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-emerald-400 font-semibold">{queueStats.running} running</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400 font-semibold">{queueStats.pending} queued</span>
                    {queueStats.stuck > 0 && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-rose-400 font-bold">{queueStats.stuck} stuck</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('queue')}
                  className="mt-3 text-left text-xs text-emerald-400 hover:underline font-semibold"
                >
                  View Scan Inspector →
                </button>
              </div>

              {/* Card 4: Total Users */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Registered</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{users.length}</div>
                  <p className="text-xs text-slate-400 mt-1">Active accounts across Starter, Growth, & Agency</p>
                </div>
                <button
                  onClick={() => setActiveTab('users')}
                  className="mt-3 text-left text-xs text-blue-400 hover:underline font-semibold"
                >
                  Manage Customers →
                </button>
              </div>
            </div>

            {/* 7-Day Cost Graph & Engine Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4">7-Day AI Spend Trajectory</h3>
                <div className="h-44 flex items-end gap-3 pt-6">
                  {costData.dailyHistory.map((d) => {
                    const heightPct = Math.max(8, Math.min(100, (d.costUsd / (costData.dailyCapUsd || 25)) * 100));
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition">
                          ${d.costUsd.toFixed(2)}
                        </span>
                        <div className="w-full bg-slate-800/80 rounded-t-lg overflow-hidden flex items-end h-28">
                          <div
                            className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all"
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{d.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Engine Breakdown */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-3">Engine Spend Share (Today)</h3>
                  <div className="space-y-3">
                    {costData.engineBreakdown.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">No AI calls recorded today.</p>
                    ) : (
                      costData.engineBreakdown.map((e) => (
                        <div key={e.engine} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="font-mono capitalize text-slate-300">{e.engine}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-white">${e.costUsd.toFixed(3)}</span>
                            <span className="text-slate-500 text-[10px] ml-1.5">({e.count} calls)</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button
                    onClick={() => setActiveTab('watchdog')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
                  >
                    Check Engine Latency →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: USERS & SUBSCRIPTION MANAGEMENT                         */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search users by email, name, or UUID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="text-xs text-slate-400 font-mono">Showing {filteredUsers.length} users</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Customer</th>
                      <th className="px-5 py-3.5">Tier Plan</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Joined</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-white">{u.email}</div>
                          <div className="text-slate-500 font-mono text-[10px]">{u.id}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                              u.plan === 'agency'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : u.plan === 'growth'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : u.plan === 'starter'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {u.plan || 'free'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {u.is_banned ? (
                            <span className="text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded text-[10px]">
                              Suspended
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Impersonate Button */}
                            <button
                              onClick={() => handleImpersonateUser(u.id)}
                              className="px-2.5 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                              title="Log in as this user to diagnose issues"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Log In As
                            </button>

                            {/* Grant Plan Button */}
                            <button
                              onClick={() => setGrantModalUser(u)}
                              className="px-2.5 py-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Grant Plan
                            </button>

                            {/* Ban / Unban */}
                            <button
                              onClick={() => handleToggleBan(u.id, u.is_banned)}
                              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition ${
                                u.is_banned
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                              }`}
                            >
                              {u.is_banned ? 'Unban' : 'Ban'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Grant Plan Modal */}
            {grantModalUser && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
                  <h3 className="text-base font-bold text-white mb-1">Manual Plan Grant</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Grant or override subscription for <strong>{grantModalUser.email}</strong>
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Select Tier</label>
                      <select
                        value={grantPlan}
                        onChange={(e) => setGrantPlan(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      >
                        <option value="starter">Starter Plan ($49/mo value)</option>
                        <option value="growth">Growth Plan ($149/mo value)</option>
                        <option value="agency">Agency Plan ($299/mo value)</option>
                        <option value="free">Free Tier</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        value={grantDuration}
                        onChange={(e) => setGrantDuration(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Notes</label>
                      <input
                        type="text"
                        value={grantReason}
                        onChange={(e) => setGrantReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      onClick={() => setGrantModalUser(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteGrantPlan}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition"
                    >
                      Confirm Grant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SCAN QUEUE & STUCK JOB KILLER                           */}
        {/* ============================================================== */}
        {activeTab === 'queue' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Live Scan Inspector & Queue</h2>
                <p className="text-xs text-slate-400">
                  Inspect active worker jobs. Jobs running &gt; 10 minutes are flagged as stuck.
                </p>
              </div>

              {queueStats.stuck > 0 && (
                <button
                  onClick={handleKillAllStuck}
                  className="px-3.5 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <StopCircle className="w-4 h-4" />
                  Kill All {queueStats.stuck} Stuck Jobs
                </button>
              )}
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Scan ID</th>
                      <th className="px-5 py-3.5">Project / Brand</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Started At</th>
                      <th className="px-5 py-3.5">Queries / Cost</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {queueRuns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                          No scan runs recorded.
                        </td>
                      </tr>
                    ) : (
                      queueRuns.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">{r.id.slice(0, 8)}...</td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-white">{r.brandName}</div>
                            <div className="text-slate-500 text-[10px]">{r.domain}</div>
                          </td>
                          <td className="px-5 py-4">
                            {r.isStuck ? (
                              <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded font-black text-[10px] animate-pulse">
                                STUCK (&gt;10m)
                              </span>
                            ) : r.status === 'running' ? (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold text-[10px]">
                                RUNNING
                              </span>
                            ) : r.status === 'pending' ? (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold text-[10px]">
                                QUEUED
                              </span>
                            ) : r.status === 'done' ? (
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold text-[10px]">
                                DONE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded font-bold text-[10px]">
                                FAILED
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-400">
                            {r.startedAt ? new Date(r.startedAt).toLocaleTimeString() : '-'}
                          </td>
                          <td className="px-5 py-4 text-slate-300 font-mono">
                            {r.totalQueries} q / ${(r.apiCostUsd || 0).toFixed(3)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {r.status === 'running' || r.isStuck ? (
                                <button
                                  onClick={() => handleKillScan(r.id)}
                                  className="px-2.5 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg text-[11px] font-bold transition"
                                >
                                  Force Kill
                                </button>
                              ) : null}

                              {r.status === 'failed' || r.isStuck ? (
                                <button
                                  onClick={() => handleRetryScan(r.id)}
                                  className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Retry
                                </button>
                              ) : null}
                            </div>
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
        {/* TAB 4: ENGINE WATCHDOG & PROMPT PLAYGROUND                     */}
        {/* ============================================================== */}
        {activeTab === 'watchdog' && (
          <div className="mt-6 space-y-6">
            {/* Top Watchdog Latency Bar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">AI Engine Health & Latency Watchdog</h2>
                  <p className="text-xs text-slate-400">
                    Live synthetic uptime probes against Gemini, OpenAI, Perplexity, and Grok.
                  </p>
                </div>
                <button
                  onClick={handlePingEngines}
                  disabled={testingEngines}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingEngines ? 'animate-spin' : ''}`} />
                  {testingEngines ? 'Probing All Engines...' : 'Probe Engines Now'}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['gemini', 'openai', 'perplexity', 'grok'].map((eng) => {
                  const data = watchdogSummary[eng] || {};
                  const isHealthy = data.status === 'healthy';
                  const isDegraded = data.status === 'degraded';
                  const isDown = data.status === 'down';
                  return (
                    <div key={eng} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-white capitalize">{eng}</span>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isHealthy
                              ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                              : isDegraded
                              ? 'bg-amber-400 animate-pulse'
                              : isDown
                              ? 'bg-rose-500 animate-ping'
                              : 'bg-slate-600'
                          }`}
                        />
                      </div>
                      <div className="text-xl font-mono font-black text-white">
                        {data.latencyMs ? `${data.latencyMs}ms` : '-'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 capitalize">
                        {data.status || 'Not checked'}
                      </div>
                      {data.errorMessage && (
                        <div className="text-[10px] text-rose-400 mt-1 truncate" title={data.errorMessage}>
                          {data.errorMessage}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt A/B Evaluation Playground */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-1">Prompt A/B Testing Playground</h2>
              <p className="text-xs text-slate-400 mb-4">
                Execute test prompts against live AI models without touching customer scan records.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Engine</label>
                  <select
                    value={playgroundEngine}
                    onChange={(e) => setPlaygroundEngine(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="gemini">Google Gemini 2.5 Flash</option>
                    <option value="openai">OpenAI GPT-4o-mini</option>
                    <option value="perplexity">Perplexity Sonar</option>
                    <option value="grok">Grok Beta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sample Brand & Domain</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={playgroundBrand}
                      onChange={(e) => setPlaygroundBrand(e.target.value)}
                      placeholder="Brand Name"
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      value={playgroundDomain}
                      onChange={(e) => setPlaygroundDomain(e.target.value)}
                      placeholder="domain.com"
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Search Keyword</label>
                  <input
                    type="text"
                    value={playgroundKeyword}
                    onChange={(e) => setPlaygroundKeyword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Prompt Template (Supports <code className="text-emerald-400 font-mono">{"{{brand}}"}</code>,{' '}
                  <code className="text-emerald-400 font-mono">{"{{domain}}"}</code>,{' '}
                  <code className="text-emerald-400 font-mono">{"{{keyword}}"}</code>)
                </label>
                <textarea
                  rows={3}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleRunPlayground}
                  disabled={runningPlayground || !promptInput}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${runningPlayground ? 'animate-spin' : ''}`} />
                  {runningPlayground ? 'Simulating Query...' : 'Run Simulation'}
                </button>
              </div>

              {playgroundResult && (
                <div className="mt-6 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                    <span className="font-bold text-white capitalize">
                      Response from {playgroundResult.engine} ({playgroundResult.latencyMs}ms)
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 font-semibold">
                        Mentions: {playgroundResult.mentionsCount}
                      </span>
                      <span className="text-blue-400 font-semibold">
                        Sentiment: {playgroundResult.sentiment?.label} ({playgroundResult.sentiment?.score})
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {playgroundResult.rawAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: API KEYS & ROTATION                                     */}
        {/* ============================================================== */}
        {activeTab === 'keys' && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">API Keys & Fallback Rotation Pool</h2>
                <p className="text-xs text-slate-400">
                  Manage multiple engine keys. Priority 1 is used first; on 5 errors, auto-rotates to priority 2.
                </p>
              </div>
              <button
                onClick={() => setAddingKey(!addingKey)}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add API Key
              </button>
            </div>

            {addingKey && (
              <form onSubmit={handleAddKey} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">New API Key Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Service</label>
                    <select
                      value={newKeyService}
                      onChange={(e) => setNewKeyService(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="perplexity">Perplexity</option>
                      <option value="grok">xAI Grok</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="resend">Resend (Email)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Key Label</label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. primary-tier-1"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-slate-400 mb-1">Secret Key Value</label>
                    <input
                      type="password"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Priority</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={newKeyPriority}
                      onChange={(e) => setNewKeyPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddingKey(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    Save Key
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apiKeys.map((k) => (
                <div key={k.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white capitalize">{k.service}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                          Priority {k.priority}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleKeyActive(k.id, k.is_active)}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {k.is_active ? (
                          <ToggleRight className="w-7 h-7 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-slate-600" />
                        )}
                      </button>
                    </div>

                    <p className="font-mono text-xs text-slate-400 mb-2">
                      Label: <span className="text-white">{k.key_name}</span> • Purpose:{' '}
                      <span className="text-slate-300">{k.purpose}</span>
                    </p>

                    {k.error_count > 0 && (
                      <div className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded p-2 mb-2">
                        Errors: {k.error_count}/5 • Last: {k.last_error || 'Transient error'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                    <span>Used: {k.last_used_at ? new Date(k.last_used_at).toLocaleTimeString() : 'Never'}</span>
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: IP SHIELD & WEBHOOK DLQ                                 */}
        {/* ============================================================== */}
        {activeTab === 'security' && (
          <div className="mt-6 space-y-6">
            {/* IP Blacklist Shield */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-1">Anti-Scraping IP Blacklist Shield</h2>
              <p className="text-xs text-slate-400 mb-4">
                Blocked IPs receive immediate 403 Forbidden across public search check endpoints.
              </p>

              <form onSubmit={handleAddBlacklist} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                <div>
                  <input
                    type="text"
                    placeholder="IP Address (e.g. 192.168.1.1)"
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Reason (e.g. automated scraper)"
                    value={newIpReason}
                    onChange={(e) => setNewIpReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Expires in hours (e.g. 24)"
                    value={newIpHours}
                    onChange={(e) => setNewIpHours(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newIpAddress || !newIpReason}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" /> Block IP
                </button>
              </form>

              <div className="divide-y divide-slate-800">
                {blacklistedIps.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3">No active IP blocks.</p>
                ) : (
                  blacklistedIps.map((ip) => (
                    <div key={ip.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-mono font-bold text-white">{ip.ip_address}</div>
                        <div className="text-slate-400 text-[11px]">{ip.reason}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-500 text-[10px]">
                          {ip.expires_at ? `Expires: ${new Date(ip.expires_at).toLocaleTimeString()}` : 'Permanent'}
                        </span>
                        <button
                          onClick={() => handleRemoveBlacklist(ip.ip_address)}
                          className="text-emerald-400 hover:underline font-semibold"
                        >
                          Unblock
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Webhook Dead-Letter Queue */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-1">Webhook Dead-Letter Queue (LemonSqueezy)</h2>
              <p className="text-xs text-slate-400 mb-4">
                Failed billing webhook events. Retry to reconcile customer plan updates safely.
              </p>

              <div className="divide-y divide-slate-800">
                {webhookEvents.length === 0 ? (
                  <p className="text-xs text-emerald-400/80 py-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Dead-letter queue is clear. No failed webhooks detected.
                  </p>
                ) : (
                  webhookEvents.map((w) => (
                    <div key={w.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span className="font-mono text-emerald-400">#{w.id}</span>
                          <span>{w.event_name}</span>
                          <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">
                            Attempts: {w.attempt_count}
                          </span>
                        </div>
                        <p className="text-rose-400 text-[11px] mt-1">{w.error || w.last_error}</p>
                      </div>
                      <button
                        onClick={() => handleRetryWebhook(w.id)}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-bold transition"
                      >
                        Retry & Resolve
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: CONFIG & LIVE EMAIL TEMPLATES                           */}
        {/* ============================================================== */}
        {activeTab === 'config' && (
          <div className="mt-6 space-y-6">
            {/* Live Email Template Editor */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-1">Live Email Template Customizer</h2>
              <p className="text-xs text-slate-400 mb-4">
                Modify Markdown templates sent by AEO Tracker with dynamic variable interpolation.
              </p>

              <div className="flex gap-2 mb-4">
                {Object.keys(emailTemplates).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedTemplateKey(key);
                      setTemplateContentInput(emailTemplates[key].currentValue);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedTemplateKey === key
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {emailTemplates[key].name}
                  </button>
                ))}
              </div>

              {emailTemplates[selectedTemplateKey] && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Supported Variables:</span>
                    {emailTemplates[selectedTemplateKey].variables.map((v: string) => (
                      <code key={v} className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-800">
                        {v}
                      </code>
                    ))}
                  </div>

                  <textarea
                    rows={6}
                    value={templateContentInput}
                    onChange={(e) => setTemplateContentInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveTemplate}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition"
                    >
                      Save Email Template
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Global System Settings */}
            <div>
              <h2 className="text-base font-bold text-white mb-1">Global System Settings</h2>
              <p className="text-xs text-slate-400 mb-4">
                Parameters stored in <code className="text-emerald-400 font-mono">public.app_config</code>.
              </p>
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

            {/* Runtime Feature Flags */}
            <div>
              <h2 className="text-base font-bold text-white mb-1">Runtime Feature Flags</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {featureFlags.map((flag) => (
                  <div key={flag.flag_key} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
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
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {flag.is_enabled ? (
                        <ToggleRight className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-600" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 8: DB HYGIENE, BACKUPS & AUDITS                           */}
        {/* ============================================================== */}
        {activeTab === 'db' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1-Click JSON Backup */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">1-Click Database JSON Backup</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Instantly stream a full JSON snapshot of all customer profiles, projects, keywords, app configs, and active API keys.
                  </p>
                </div>
                <div className="mt-6">
                  <a
                    href="/api/admin/backup"
                    download
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                  >
                    <Download className="w-4 h-4" />
                    Download Full JSON Snapshot
                  </a>
                </div>
              </div>

              {/* Database Hygiene Pruner */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Storage & Database Hygiene</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Safely purge transient AI scan output responses older than 90 days and old error logs to reclaim table storage.
                  </p>
                  {hygieneStats && (
                    <div className="mt-3 text-xs text-slate-300 font-mono">
                      Reclaimable records: <span className="text-emerald-400 font-bold">{hygieneStats.totalReclaimableRows}</span> rows
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleExecuteHygienePrune}
                    className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-xl text-xs transition"
                  >
                    Execute Hygiene Prune (Delete &gt;90d)
                  </button>
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div>
              <h2 className="text-base font-bold text-white mb-1">Security & Action Audit Logs</h2>
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mt-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-5 py-3.5">Action</th>
                        <th className="px-5 py-3.5">Target Type</th>
                        <th className="px-5 py-3.5">Target ID</th>
                        <th className="px-5 py-3.5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                            No audit records logged yet.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-800/30 transition">
                            <td className="px-5 py-4 font-mono font-bold text-emerald-400">{log.action}</td>
                            <td className="px-5 py-4 text-slate-300">{log.target_type}</td>
                            <td className="px-5 py-4 font-mono text-[11px] text-slate-400">{log.target_id || '-'}</td>
                            <td className="px-5 py-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
