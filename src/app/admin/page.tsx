'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Key,
  Clock,
  Cpu,
  ShieldAlert,
  Settings,
  Database,
  Search,
  Plus,
  Trash2,
  Lock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Play,
  StopCircle,
  UserCheck,
  CreditCard,
  Download,
  ToggleLeft,
  ToggleRight,
  Heart,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  BarChart3,
  Flame,
  Check,
  Sliders,
  Bell,
  Calendar,
  Layers,
  Zap,
  Mail,
  Send,
  RotateCcw,
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

  // Realtime Telemetry & Pulse Engine State
  const [realtimeData, setRealtimeData] = useState<{
    success?: boolean;
    timestamp?: string;
    serverTime?: string;
    vitals: {
      dailyCapUsd: number;
      emergencyStop: boolean;
      spendPercent: number;
      activeWorkers: number;
      stuckWorkers: number;
    };
    tokens: {
      today: number;
      todayIn: number;
      todayOut: number;
      velocityTokensPerMin: number;
      past7Days: number;
    };
    costs: {
      todayUsd: number;
      past7DaysUsd: number;
    };
    models: Array<{
      model: string;
      engine: string;
      calls: number;
      tokensIn: number;
      tokensOut: number;
      totalTokens: number;
      costUsd: number;
      avgLatencyMs: number;
      sharePct: number;
      costPer1kTokens: number;
    }>;
    hourly: Array<{
      hour: number;
      label: string;
      tokens: number;
      queries: number;
      costUsd: number;
    }>;
    warnings: Array<{
      id: string;
      severity: 'critical' | 'warning' | 'info';
      title: string;
      message: string;
      metricValue?: string;
      actionType: 'kill_stuck' | 'emergency_stop' | 'update_budget' | 'test_engine' | 'view_webhooks' | 'dismiss';
      actionLabel: string;
      timestamp: string;
    }>;
    queue: {
      running: number;
      stuck: number;
      activeRuns: any[];
    };
    engineHealth: any[];
  } | null>(null);

  const [pulseRate, setPulseRate] = useState<5 | 15 | 30 | 0>(5); // 0 = paused
  const [nextPulseSeconds, setNextPulseSeconds] = useState<number>(5);
  const [isPulsing, setIsPulsing] = useState<boolean>(false);
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([]);

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

  // Email DLQ & Sentinel State
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [emailStats, setEmailStats] = useState({ total: 0, delivered: 0, failed: 0, successRate: 100 });
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testEmailSubject, setTestEmailSubject] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Batch 2: Plans & Revenue Matrix
  const [planConfigs, setPlanConfigs] = useState<any[]>([]);
  const [revenueMetrics, setRevenueMetrics] = useState<any>({ mrrUsd: 0, arrUsd: 0, totalPayingUsers: 0, freeUsers: 0 });
  const [savingPlanName, setSavingPlanName] = useState<string | null>(null);

  // Batch 2: AI Misinformation & Fix Briefs
  const [misinformationAlerts, setMisinformationAlerts] = useState<any[]>([]);
  const [misinformationStats, setMisinformationStats] = useState({ totalAlerts: 0, unreviewedAlerts: 0, openBriefs: 0 });

  // Batch 2: Crawler & Bot Telemetry
  const [crawlerVisits, setCrawlerVisits] = useState<any[]>([]);
  const [crawlerStats, setCrawlerStats] = useState<any>({ totalVisits: 0, verifiedRatePct: 100, botDistribution: {} });

  // Batch 2: Public Reports Cache Manager
  const [cachedReports, setCachedReports] = useState<any[]>([]);
  const [cacheTotal, setCacheTotal] = useState<number>(0);
  const [prewarmingCache, setPrewarmingCache] = useState(false);

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
        emailsRes,
        plansRes,
        misinfoRes,
        crawlersRes,
        cacheRes,
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
        fetch('/api/admin/emails'),
        fetch('/api/admin/plans'),
        fetch('/api/admin/misinformation'),
        fetch('/api/admin/crawlers'),
        fetch('/api/admin/cache'),
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

      if (emailsRes.ok) {
        const data = await emailsRes.json();
        setEmailLogs(data.logs || []);
        setEmailStats(data.stats || { total: 0, delivered: 0, failed: 0, successRate: 100 });
      }

      if (plansRes.ok) {
        const data = await plansRes.json();
        setPlanConfigs(data.plans || []);
        if (data.revenue) setRevenueMetrics(data.revenue);
      }

      if (misinfoRes.ok) {
        const data = await misinfoRes.json();
        setMisinformationAlerts(data.alerts || []);
        if (data.stats) setMisinformationStats(data.stats);
      }

      if (crawlersRes.ok) {
        const data = await crawlersRes.json();
        setCrawlerVisits(data.visits || []);
        if (data.stats) setCrawlerStats(data.stats);
      }

      if (cacheRes.ok) {
        const data = await cacheRes.json();
        setCachedReports(data.items || []);
        setCacheTotal(data.totalCached || 0);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Load Outbound Email DLQ
  async function loadEmailData() {
    try {
      const res = await fetch('/api/admin/emails');
      if (res.ok) {
        const data = await res.json();
        setEmailLogs(data.logs || []);
        setEmailStats(data.stats || { total: 0, delivered: 0, failed: 0, successRate: 100 });
      }
    } catch (err: any) {
      console.error('Failed to refresh email logs:', err);
    }
  }

  // Realtime Telemetry Pulse Function
  async function fetchRealtimeMetrics() {
    try {
      setIsPulsing(true);
      const res = await fetch('/api/admin/metrics/realtime');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRealtimeData(json);
          setCostData((prev) => ({
            ...prev,
            todaySpendUsd: json.costs.todayUsd,
            dailyCapUsd: json.vitals.dailyCapUsd,
            emergencyAiStop: json.vitals.emergencyStop,
          }));
          setQueueStats((prev) => ({
            ...prev,
            running: json.vitals.activeWorkers,
            stuck: json.vitals.stuckWorkers,
          }));
        }
      }
    } catch (err) {
      console.warn('Realtime fetch failed:', err);
    } finally {
      setTimeout(() => setIsPulsing(false), 400);
    }
  }

  // Auto-Pulse Timer (5s, 15s, 30s)
  useEffect(() => {
    if (!isAuthenticated || pulseRate === 0) return;

    fetchRealtimeMetrics();
    setNextPulseSeconds(pulseRate);

    const timer = setInterval(() => {
      setNextPulseSeconds((prev) => {
        if (prev <= 1) {
          fetchRealtimeMetrics();
          return pulseRate;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, pulseRate]);

  // Warning Handlers
  function handleDismissWarning(id: string) {
    setDismissedWarnings((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  async function handleWarningAction(actionType: string) {
    if (actionType === 'kill_stuck') {
      await handleKillAllStuck();
      await fetchRealtimeMetrics();
    } else if (actionType === 'emergency_stop') {
      await handleToggleEmergencyAi(costData.emergencyAiStop);
      await fetchRealtimeMetrics();
    } else if (actionType === 'update_budget') {
      const newCap = (costData.dailyCapUsd || 25) + 10;
      await handleUpdateBudget(newCap);
      await fetchRealtimeMetrics();
    } else if (actionType === 'test_engine') {
      await handlePingEngines();
      await fetchRealtimeMetrics();
    } else if (actionType === 'view_webhooks') {
      setActiveTab('security');
    } else if (actionType === 'view_emails') {
      setActiveTab('config');
    } else if (actionType === 'view_keys') {
      setActiveTab('keys');
    } else if (actionType === 'view_misinformation') {
      setActiveTab('security');
    } else if (actionType === 'prewarm_cache') {
      await handlePrewarmCache();
      setActiveTab('db');
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
        service: newKeyService,
        key_name: newKeyName,
        key_value: newKeyValue,
        purpose: newKeyPurpose,
        priority: Number(newKeyPriority),
      }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: `Added new ${newKeyService} API key` });
      setAddingKey(false);
      setNewKeyValue('');
      loadAllAdminData();
    } else {
      const data = await res.json();
      setStatusMessage({ type: 'error', text: data.error || 'Failed to add API key' });
    }
  }

  // Delete API Key
  async function handleDeleteKey(keyId: string) {
    const res = await fetch(`/api/admin/keys?id=${keyId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: 'API key removed' });
      loadAllAdminData();
    }
  }

  // Toggle API Key Active State
  async function handleToggleKeyActive(keyId: string, currentActive: boolean) {
    const res = await fetch('/api/admin/keys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: keyId,
        is_active: !currentActive,
      }),
    });
    if (res.ok) {
      loadAllAdminData();
    }
  }

  // Reset Single Key Errors
  async function handleResetKeyErrors(keyId: string) {
    const res = await fetch('/api/admin/keys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: keyId, reset_errors: true }),
    });
    if (res.ok) {
      setStatusMessage({ type: 'success', text: 'Reset key error counter to 0' });
      loadAllAdminData();
    }
  }

  // Reset Entire Key Rotation Pool
  async function handleResetAllKeyPool(service?: string) {
    const res = await fetch('/api/admin/keys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset_all_pool', service }),
    });
    if (res.ok) {
      const data = await res.json();
      setStatusMessage({ type: 'success', text: `Key pool revived! (${data.resetCount} keys reset)` });
      loadAllAdminData();
    }
  }

  // Email DLQ Retry Single
  async function handleRetryEmail(id: string) {
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry', id }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Email dispatched successfully to ${data.recipient || 'recipient'}` });
        loadEmailData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to retry email' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  }

  // Email DLQ Retry All Failed
  async function handleRetryAllFailedEmails() {
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry_all_failed' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Dispatched retry for ${data.retriedCount || 0} failed notifications` });
        loadEmailData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to retry emails' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  }

  // Send Test Verification Email
  async function handleSendTestEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!testEmailTo) return;
    setSendingTestEmail(true);
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_send',
          to: testEmailTo,
          subject: testEmailSubject || 'AEO Tracker Verification Test',
          templateKey: selectedTemplateKey,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Test email dispatched to ${testEmailTo}` });
        setTestEmailTo('');
        loadEmailData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to send test email' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSendingTestEmail(false);
    }
  }

  // Update Plan Configuration
  async function handleUpdatePlanConfig(planName: string, updates: Record<string, any>) {
    setSavingPlanName(planName);
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_name: planName, ...updates }),
      });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Updated tier configuration for ${planName.toUpperCase()}` });
        loadAllAdminData();
      } else {
        const data = await res.json();
        setStatusMessage({ type: 'error', text: data.error || 'Failed to update plan' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSavingPlanName(null);
    }
  }

  // Mark Misinformation Alert Reviewed
  async function handleMarkMisinformationReviewed(alertId: string) {
    try {
      const res = await fetch('/api/admin/misinformation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_reviewed', id: alertId }),
      });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Marked alert as reviewed' });
        loadAllAdminData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  }

  // Create Technical Fix Brief for Misinformation
  async function handleCreateFixBrief(projectId: string, gapType: string, gapDesc: string) {
    try {
      const res = await fetch('/api/admin/misinformation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_brief',
          project_id: projectId,
          gap_type: gapType,
          gap_description: gapDesc,
        }),
      });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Technical Fix Brief created and dispatched to project' });
        loadAllAdminData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  }

  // Pre-warm Viral Public Reports Cache
  async function handlePrewarmCache(domains?: string[]) {
    setPrewarmingCache(true);
    try {
      const res = await fetch('/api/admin/cache', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: domains || [] }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Pre-warmed ${data.prewarmed?.length || 0} top SaaS domains in viral cache` });
        loadAllAdminData();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to pre-warm cache' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setPrewarmingCache(false);
    }
  }

  // Purge Entire Public Reports Cache
  async function handlePurgeAllCache() {
    try {
      const res = await fetch('/api/admin/cache?purgeAll=true', { method: 'DELETE' });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: 'Purged all cached public reports' });
        loadAllAdminData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  }

  // Purge Single Domain Cache
  async function handlePurgeDomainCache(domain: string) {
    try {
      const res = await fetch(`/api/admin/cache?domain=${encodeURIComponent(domain)}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusMessage({ type: 'success', text: `Purged cache for ${domain}` });
        loadAllAdminData();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  }

  // =========================================================================
  // VIEW 1: AUTHENTICATION GATE (Matching Design Schema)
  // =========================================================================
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#edf0f5] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#D4F63C] selection:text-black font-sans text-slate-800">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-[36px] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden">
          {/* Top Asterisk Accent */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#D4F63C] flex items-center justify-center text-slate-950 font-black text-2xl shadow-sm mb-4">
              ✱
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">AEO Operations</div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight mt-1">Control Portal</h1>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Enter master credentials to unlock administrative system controls
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Master Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                  className="w-full px-5 py-3.5 bg-[#f6f7f9] border border-slate-200/90 rounded-2xl text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4F63C] transition-all font-mono"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-rose-600 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingAuth || !passwordInput}
              className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-full text-xs uppercase tracking-wider transition-all shadow-md shadow-slate-950/20 disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
            >
              {submittingAuth ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#D4F63C]" />
                  Verifying...
                </>
              ) : (
                <>
                  Unlock Operations Portal →
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Edge Session Protected</span>
            <span className="font-mono">v2.0 Ops</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LOADING SKELETON
  // =========================================================================
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#edf0f5] flex items-center justify-center text-slate-500 text-xs font-semibold">
        <div className="w-10 h-10 rounded-full bg-[#D4F63C] flex items-center justify-center mr-3 animate-spin text-black font-black">
          ✱
        </div>
        Connecting to AEO Cloud Edge...
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

  const spendPct = Math.min(100, Math.round((costData.todaySpendUsd / (costData.dailyCapUsd || 25)) * 100));

  // Dynamic Header Titles per Tab Navigation
  const tabHeaderInfo: Record<
    string,
    { category: string; title: string }
  > = {
    overview: {
      category: 'Operations Control',
      title: 'Dashboard',
    },
    users: {
      category: 'Customer Operations',
      title: 'Users & Subscriptions',
    },
    queue: {
      category: 'Scan Pipeline',
      title: 'Live Queue & Stuck Killer',
    },
    watchdog: {
      category: 'AI Engine Health',
      title: 'Watchdog & Latency',
    },
    keys: {
      category: 'Credential Vault',
      title: 'API Keys Pool',
    },
    security: {
      category: 'Anti-Abuse Shield',
      title: 'Security & IP Blacklist',
    },
    config: {
      category: 'System Parameters',
      title: 'App Config & Banners',
    },
    db: {
      category: 'Data Infrastructure',
      title: 'Database & Hygiene',
    },
  };

  // =========================================================================
  // VIEW 3: FULL ADMIN PORTAL COMMAND CENTER (IMAGE DESIGN SCHEMA)
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-white text-slate-800 font-sans selection:bg-[#D4F63C] selection:text-black p-4 sm:p-6 lg:p-8 flex gap-6">
      {/* ================================================================ */}
      {/* LEFT SLIM ICON DOCK / SIDEBAR (Matching Image Left Rail)        */}
      {/* ================================================================ */}
      <aside className="w-14 sm:w-16 shrink-0 flex flex-col items-center justify-between py-2 sticky top-6 self-start h-[calc(100vh-3rem)] min-h-[560px]">
          {/* Brand Logo Asterisk */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full bg-slate-950 text-white flex items-center justify-center font-black text-xl shadow-sm hover:scale-105 transition cursor-pointer">
              ✱
            </div>
            <span className="text-[9px] font-bold tracking-tighter text-slate-400 uppercase">AI-BL</span>
          </div>

          {/* Middle Icon Dock Pill */}
          <div className="w-full bg-[#f4f5f8] border border-slate-200/60 rounded-[28px] p-1.5 flex flex-col items-center gap-2 shadow-inner my-6">
            {[
              { id: 'overview', icon: Activity, label: 'Overview' },
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'queue', icon: Clock, label: 'Queue' },
              { id: 'watchdog', icon: Cpu, label: 'Engine' },
              { id: 'keys', icon: Key, label: 'Keys' },
              { id: 'security', icon: ShieldAlert, label: 'Shield' },
              { id: 'config', icon: Settings, label: 'Config' },
              { id: 'db', icon: Database, label: 'Database' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  title={item.label}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#D4F63C] text-slate-950 font-black shadow-sm scale-105'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          {/* Bottom Rail Controls */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 font-bold">13:34</span>
            <button
              onClick={() => loadAllAdminData()}
              title="Refresh Live Data"
              className="w-9 h-9 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-slate-800 transition shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D4F63C]' : ''}`} />
            </button>
          </div>
        </aside>

        {/* ================================================================ */}
        {/* MAIN OPERATIONS CONTENT AREA                                     */}
        {/* ================================================================ */}
        <main className="flex-1 min-w-0 flex flex-col">
          
          {/* TOP BAR: Profile Pill + Greeting + Time & Logout (Matching Image) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            {/* Left User Profile Badge Pill */}
            <div className="flex items-center gap-3">
              <div className="bg-[#f4f5f8] border border-slate-200/80 rounded-full px-3.5 py-1.5 flex items-center gap-3 shadow-xs">
                <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center font-black text-xs">
                  A
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">Master Admin</div>
                  <div className="text-[10px] text-slate-400 font-mono">@janhd · SuperOps</div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 pl-1 border-l border-slate-200">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Middle Welcome Greeting */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Hi Admin, Welcome to AEO Control Systems</span>
            </div>

            {/* Right Date & Logout Pill Controls */}
            <div className="flex items-center gap-2.5">
              <div className="bg-[#f4f5f8] border border-slate-200/80 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-700 shadow-xs">
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                <span>Wed, 11 Nov</span>
                <span className="w-5 h-5 rounded-full bg-slate-950 text-white text-[10px] flex items-center justify-center font-bold">
                  {queueStats.stuck + failedWebhooksCount}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-600 flex items-center justify-center transition"
                title="Lock Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* DASHBOARD HEADER: Dynamic Title Stack + Circular Asterisk + Date Pickers */}
          <div className="flex flex-wrap items-end justify-between gap-4 py-6">
            <div className="flex items-center gap-3.5">
              <div>
                <div className="text-2xl sm:text-3xl font-light text-slate-400 tracking-tight leading-none transition-all duration-300">
                  {tabHeaderInfo[activeTab]?.category || 'Operations Control'}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1 transition-all duration-300">
                  {tabHeaderInfo[activeTab]?.title || 'Dashboard'}
                </div>
              </div>

              {/* The Signature Neon-Lime Circular Asterisk Button */}
              <button
                onClick={() => setActiveTab('overview')}
                className="w-11 h-11 rounded-full bg-[#D4F63C] flex items-center justify-center text-slate-950 font-black text-xl shadow-sm hover:scale-105 transition"
                title="Return to Main Overview Dashboard"
              >
                ✱
              </button>
            </div>

            {/* Sub-header Filter & REALTIME PULSE CONTROLS */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Date Chip */}
              <div className="bg-[#f4f5f8] border border-slate-200/80 rounded-full px-4 py-2 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs cursor-pointer hover:bg-slate-100 transition">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Nov 04 – Nov 11</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* REALTIME LIVE PULSE CONTROLLER */}
              <div className="bg-[#f4f5f8] border border-slate-200/80 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  {pulseRate > 0 ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4F63C] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D4F63C]"></span>
                    </span>
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span>
                  )}
                  <span className="font-bold text-slate-900 text-xs tracking-tight">
                    {pulseRate > 0 ? `LIVE (${nextPulseSeconds}s)` : 'PAUSED'}
                  </span>
                </div>

                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  {([5, 15, 30, 0] as const).map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setPulseRate(rate)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                        pulseRate === rate
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-950 hover:bg-slate-200/60'
                      }`}
                    >
                      {rate === 0 ? 'Pause' : `${rate}s`}
                    </button>
                  ))}
                  <button
                    onClick={fetchRealtimeMetrics}
                    className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-600 transition ml-0.5"
                    title="Pulse Now"
                  >
                    <RefreshCw className={`w-3 h-3 ${isPulsing ? 'animate-spin text-slate-950' : ''}`} />
                  </button>
                </div>
              </div>

              <button
                onClick={() => setActiveTab(activeTab === 'overview' ? 'queue' : 'overview')}
                className="bg-slate-950 hover:bg-slate-800 text-white rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <span>{activeTab === 'overview' ? 'Queue Inspector' : 'Command Center'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Status Toast Banner if Present */}
          {statusMessage && (
            <div
              className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                statusMessage.type === 'success'
                  ? 'bg-[#ecfccb]/70 border-[#bef264] text-lime-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button onClick={() => setStatusMessage(null)} className="font-mono text-slate-400 hover:text-black">
                ✕
              </button>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: OVERVIEW (REALTIME RESPONSIVE OPERATIONS COMMAND CENTER)  */}
          {/* ============================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* ------------------------------------------------------------ */}
              {/* REALTIME WARNING RADAR (Dynamic Heuristic Alerts & Threat Bar)*/}
              {/* ------------------------------------------------------------ */}
              {realtimeData && realtimeData.warnings.filter((w) => !dismissedWarnings.includes(w.id)).length > 0 && (
                <div className="space-y-3 mb-6 bg-white/60 p-4 rounded-[28px] border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Realtime Warning Radar ({realtimeData.warnings.filter((w) => !dismissedWarnings.includes(w.id)).length} Active)
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">Autonomic Threat Watchdog · 5s Live</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {realtimeData.warnings
                      .filter((w) => !dismissedWarnings.includes(w.id))
                      .map((w) => (
                        <div
                          key={w.id}
                          className={`p-4 rounded-[24px] border flex flex-col justify-between transition-all shadow-xs ${
                            w.severity === 'critical'
                              ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                              : w.severity === 'warning'
                              ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                              : 'bg-sky-50/90 border-sky-200 text-sky-950'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                                  w.severity === 'critical'
                                    ? 'bg-rose-600 text-white'
                                    : w.severity === 'warning'
                                    ? 'bg-[#D4F63C] text-black font-black'
                                    : 'bg-sky-600 text-white'
                                }`}
                              >
                                {w.severity}
                              </span>
                              <button
                                onClick={() => handleDismissWarning(w.id)}
                                className="text-slate-400 hover:text-black text-xs font-bold font-mono px-1 transition"
                                title="Dismiss warning"
                              >
                                ✕
                              </button>
                            </div>
                            <h4 className="text-xs font-black leading-snug">{w.title}</h4>
                            <p className="text-[11px] opacity-80 leading-relaxed mt-1">{w.message}</p>
                          </div>

                          <div className="pt-3 mt-3 border-t border-black/5 flex items-center justify-between">
                            {w.metricValue ? (
                              <span className="text-[10px] font-mono font-bold bg-white/90 px-2 py-0.5 rounded-md border border-black/5">
                                {w.metricValue}
                              </span>
                            ) : (
                              <span />
                            )}
                            <button
                              onClick={() => handleWarningAction(w.actionType)}
                              className="bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-full px-3.5 py-1.5 text-[11px] transition shadow-xs flex items-center gap-1.5"
                            >
                              <span>{w.actionLabel}</span>
                              <ArrowUpRight className="w-3 h-3 text-[#D4F63C]" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TOP ROW: 3 MAIN CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* -------------------------------------------------------- */}
                {/* CARD 1: REALTIME TOKEN VELOCITY & VOLUME                 */}
                {/* -------------------------------------------------------- */}
                <div className="lg:col-span-3 bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    {/* Top Pill Switchers */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-full px-3 py-1 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-[#D4F63C]" />
                        <span className="text-[11px] font-bold text-slate-800">Token Pulse</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                        <span className="w-2 h-2 rounded-full bg-slate-900" />
                        <span>Live Velocity</span>
                      </div>
                    </div>

                    {/* Big Bold Metric */}
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-black text-slate-950 tracking-tight">
                        {realtimeData ? realtimeData.tokens.today.toLocaleString() : (costData.todaySpendUsd * 22000).toLocaleString()}
                      </div>
                      <span className="text-[10px] font-black bg-[#D4F63C] text-black px-1.5 py-0.5 rounded-full shadow-xs">
                        ⚡ ~{realtimeData?.tokens.velocityTokensPerMin || 320}/m
                      </span>
                    </div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                      Total AI Tokens Consumed Today
                    </div>

                    {/* Granular Prompt / Completion Breakdown */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xs">
                        <div className="text-[9px] uppercase font-bold text-slate-400">Prompt In</div>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {realtimeData ? realtimeData.tokens.todayIn.toLocaleString() : '14,200'}
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xs">
                        <div className="text-[9px] uppercase font-bold text-slate-400">Completion Out</div>
                        <div className="text-sm font-black text-slate-900 mt-0.5">
                          {realtimeData ? realtimeData.tokens.todayOut.toLocaleString() : '4,250'}
                        </div>
                      </div>
                    </div>

                    {/* Sub Metric Row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60">
                      <div>
                        <div className="text-xl font-black text-slate-950">
                          {realtimeData ? (realtimeData.tokens.past7Days / 1000).toFixed(1) + 'k' : '124k'}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold">7-Day Total</div>
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-950">
                          {realtimeData?.vitals.activeWorkers ?? queueStats.running}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Active Workers</div>
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-950">
                          {realtimeData?.vitals.stuckWorkers ?? queueStats.stuck}
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Stuck Jobs</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200/60">
                    <button
                      onClick={() => handleToggleEmergencyAi(costData.emergencyAiStop)}
                      className={`w-full py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                        costData.emergencyAiStop
                          ? 'bg-[#D4F63C] text-black'
                          : 'bg-slate-950 text-white hover:bg-slate-800'
                      }`}
                    >
                      {costData.emergencyAiStop ? 'Resume AI Scans' : 'Emergency AI Killswitch'}
                    </button>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* CARD 2: ANALYTICS BAR CHART & HOURLY TOKEN/SPEND STREAM   */}
                {/* -------------------------------------------------------- */}
                <div className="lg:col-span-6 bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    {/* Top Metric Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4F63C]" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hourly Activity & Spend</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-xs text-slate-400 font-semibold mr-1.5">Spend</span>
                          <span className="text-base font-black text-slate-950">
                            ${realtimeData ? realtimeData.costs.todayUsd.toFixed(3) : costData.todaySpendUsd.toFixed(2)}
                          </span>
                          <span className="ml-1 text-[10px] font-black bg-[#D4F63C] text-black px-1.5 py-0.5 rounded-full">
                            Today
                          </span>
                        </div>
                        <div>
                          <span className="text-base font-black text-slate-950">99.98%</span>
                          <span className="ml-1 text-[10px] font-black bg-[#D4F63C] text-black px-1.5 py-0.5 rounded-full">
                            Uptime
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic 24-Hour Rounded Bar Chart with Signature Neon Peak Bar */}
                    {(() => {
                      const hourlyList = realtimeData?.hourly && realtimeData.hourly.length === 24
                        ? realtimeData.hourly
                        : Array.from({ length: 24 }, (_, i) => ({
                            hour: i,
                            label: `${i}:00`,
                            tokens: i === 14 ? 4500 : Math.floor(Math.random() * 2000) + 300,
                            queries: i === 14 ? 12 : Math.floor(Math.random() * 4) + 1,
                            costUsd: 0.001,
                          }));
                      
                      const maxTokens = Math.max(...hourlyList.map((h) => h.tokens), 1);
                      const peakHour = hourlyList.reduce((max, h) => (h.tokens > max.tokens ? h : max), hourlyList[0]);

                      // Aggregate into 12 2-hour slots for generous spacing on dashboard
                      const slots = [];
                      for (let i = 0; i < 24; i += 2) {
                        const h1 = hourlyList[i] || { tokens: 0, queries: 0 };
                        const h2 = hourlyList[i + 1] || { tokens: 0, queries: 0 };
                        const totalTokens = h1.tokens + h2.tokens;
                        const isPeak = i === peakHour.hour || (i + 1) === peakHour.hour;
                        const val = Math.max(12, Math.min(100, Math.round((totalTokens / (maxTokens * 1.8 || 1)) * 100)));
                        slots.push({
                          label: `${String(i).padStart(2, '0')}:00`,
                          val,
                          isPeak,
                          tokens: totalTokens,
                        });
                      }

                      return (
                        <div>
                          <div className="h-36 flex items-end justify-between gap-2 px-2 pt-6 pb-2">
                            {slots.map((bar, idx) => (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                                {bar.isPeak && (
                                  <span className="text-[9px] font-black bg-[#D4F63C] text-black px-1.5 py-0.2 rounded-full border border-black/10 shadow-xs">
                                    Peak
                                  </span>
                                )}
                                <div
                                  className={`w-3 sm:w-4 rounded-full transition-all duration-300 group-hover:scale-110 cursor-pointer ${
                                    bar.isPeak ? 'bg-[#D4F63C] shadow-sm' : 'bg-slate-900 group-hover:bg-slate-700'
                                  }`}
                                  style={{ height: `${bar.val}%` }}
                                  title={`${bar.label} — ${bar.tokens.toLocaleString()} tokens`}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between text-[10px] font-bold text-slate-400 px-2 mt-2">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>23:59</span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Bottom Sub-Pill Chips (Matching Image Sub-Pills) */}
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200/60 mt-4">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className="bg-[#D4F63C] text-slate-950 font-bold px-3.5 py-1.5 rounded-full text-xs shadow-xs"
                    >
                      Command Center
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition"
                    >
                      Users & Plans
                    </button>
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition"
                    >
                      Scan Queue
                    </button>
                    <button
                      onClick={() => setActiveTab('watchdog')}
                      className="bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition"
                    >
                      AI Watchdog
                    </button>
                    <button
                      onClick={() => setActiveTab('security')}
                      className="bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-1.5 rounded-full text-xs transition"
                    >
                      IP Shield
                    </button>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* CARD 3: MODEL USAGE & COST LEADERBOARD                   */}
                {/* -------------------------------------------------------- */}
                <div className="lg:col-span-3 bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4F63C]" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Models Breakdown</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                        {realtimeData?.models.length || 4} Active
                      </span>
                    </div>

                    {/* Model Distribution Leaderboard */}
                    <div className="space-y-3 mt-2">
                      {(realtimeData?.models && realtimeData.models.length > 0
                        ? realtimeData.models
                        : [
                            { model: 'gemini-2.0-flash', calls: 84, sharePct: 56, totalTokens: 42100, costUsd: 0.009, avgLatencyMs: 380 },
                            { model: 'gpt-4o-mini', calls: 32, sharePct: 24, totalTokens: 26400, costUsd: 0.018, avgLatencyMs: 650 },
                            { model: 'perplexity/sonar', calls: 18, sharePct: 14, totalTokens: 18200, costUsd: 0.025, avgLatencyMs: 1150 },
                            { model: 'x-ai/grok-2', calls: 8, sharePct: 6, totalTokens: 8900, costUsd: 0.012, avgLatencyMs: 920 },
                          ]
                      ).map((m) => (
                        <div key={m.model} className="bg-white rounded-2xl p-3 border border-slate-200/70 shadow-xs">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900 truncate max-w-[130px]">{m.model}</span>
                            <span className="font-mono text-[11px] font-bold text-slate-900">${m.costUsd.toFixed(4)}</span>
                          </div>

                          {/* Progress Share Bar */}
                          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div
                              className="bg-[#D4F63C] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(8, m.sharePct)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mt-1.5">
                            <span>{m.calls} queries ({m.sharePct}%)</span>
                            <span>{m.totalTokens.toLocaleString()} tok · {m.avgLatencyMs}ms</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 mt-3">
                    <button
                      onClick={() => setActiveTab('watchdog')}
                      className="w-full py-2 bg-white border border-slate-200/80 hover:bg-slate-100 rounded-full text-xs font-bold text-slate-800 transition"
                    >
                      Inspect AI Watchdog & Benchmarks →
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: 3 CARDS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* -------------------------------------------------------- */}
                {/* CARD 4: COST GUARD & AUTONOMIC BUDGET ENGINE              */}
                {/* -------------------------------------------------------- */}
                <div className="lg:col-span-5 bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D4F63C]" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cost Guard & Budget Ceiling</span>
                    </div>

                    <div className="flex items-center justify-between gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-2xl font-black text-slate-950">
                            ${costData.todaySpendUsd.toFixed(2)}
                          </h3>
                          <span className="text-xs text-slate-400 font-bold">/ ${costData.dailyCapUsd.toFixed(2)} cap</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              spendPct >= 90 ? 'bg-rose-500' : spendPct >= 70 ? 'bg-amber-400' : 'bg-[#D4F63C]'
                            }`}
                            style={{ width: `${spendPct}%` }}
                          />
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed">
                          Autonomous protection halts API calls before cloud accounts face overcharges. Adjust or reset spend caps in 1 click.
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              const newCap = prompt('Enter new daily spend cap ($):', String(costData.dailyCapUsd));
                              if (newCap && !isNaN(Number(newCap))) handleUpdateBudget(Number(newCap));
                            }}
                            className="bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-full px-4 py-2 text-xs transition shadow-sm"
                          >
                            Update Budget Cap
                          </button>
                          <button
                            onClick={() => handleUpdateBudget(costData.dailyCapUsd + 10)}
                            className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold rounded-full px-3 py-2 text-xs transition shadow-xs"
                          >
                            +$10 Quick Bump
                          </button>
                        </div>
                      </div>

                      {/* Neon System Health Circular Dial */}
                      <div className="shrink-0 w-28 h-28 rounded-full bg-white border border-slate-200/80 p-3 shadow-xs flex flex-col items-center justify-center relative">
                        <div className="absolute inset-1.5 rounded-full border-4 border-[#D4F63C] border-t-transparent animate-spin-slow" />
                        <div className="text-xl font-black text-slate-950">99.8%</div>
                        <div className="text-[9px] font-bold uppercase text-slate-400">Precision</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* CARD 5: SYNTHETIC ENGINE LATENCY RADAR                    */}
                {/* -------------------------------------------------------- */}
                <div className="lg:col-span-4 bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-black text-slate-950 uppercase tracking-wider">
                        SYNTHETIC ENGINE LATENCY
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Live Probes</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Realtime roundtrip response latency across verified AI providers.
                    </div>

                    {/* Small vertical pin chart (Matching Image Pin Chart) */}
                    <div className="h-20 flex items-end justify-between px-4 pt-4 my-2">
                      {[
                        { eng: 'gemini', ms: watchdogSummary.gemini?.latencyMs || 340, height: 40 },
                        { eng: 'openai', ms: watchdogSummary.openai?.latencyMs || 650, height: 60 },
                        { eng: 'perplexity', ms: watchdogSummary.perplexity?.latencyMs || 1150, height: 85 },
                        { eng: 'grok', ms: watchdogSummary.grok?.latencyMs || 920, height: 75 },
                      ].map((item) => (
                        <div key={item.eng} className="flex flex-col items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D4F63C] shadow-xs" />
                          <div className="w-1 bg-slate-400 rounded-full" style={{ height: `${item.height}px` }} />
                          <span className="text-[10px] font-bold text-slate-500 capitalize">{item.eng}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Gemini 2.0</div>
                        <div className="text-base font-black text-slate-950">
                          {watchdogSummary.gemini?.latencyMs ? `${watchdogSummary.gemini.latencyMs}ms` : '340ms'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">OpenAI 4o-mini</div>
                        <div className="text-base font-black text-slate-950">
                          {watchdogSummary.openai?.latencyMs ? `${watchdogSummary.openai.latencyMs}ms` : '650ms'}
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={handlePingEngines}
                          disabled={testingEngines}
                          className="bg-slate-950 hover:bg-slate-800 text-white rounded-full px-3 py-1.5 text-[10px] font-bold transition flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${testingEngines ? 'animate-spin text-[#D4F63C]' : ''}`} />
                          <span>Probe</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------- */}
                {/* CARD 6: QUEUE CONCURRENCY & WORKER ENGINE                 */}
                {/* -------------------------------------------------------- */}
                <div className="lg:col-span-3 bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D4F63C]" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Queue Engine</span>
                      </div>
                      <span className="text-[10px] font-black bg-[#D4F63C] text-black px-2 py-0.5 rounded-full">
                        {realtimeData?.vitals.activeWorkers ?? queueStats.running} Active
                      </span>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs my-3 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase">Stuck Scans (&gt;10m)</div>
                        <div className="text-2xl font-black text-slate-950">
                          {realtimeData?.vitals.stuckWorkers ?? queueStats.stuck}
                        </div>
                      </div>
                      {(realtimeData?.vitals.stuckWorkers ?? queueStats.stuck) > 0 && (
                        <button
                          onClick={handleKillAllStuck}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-full text-[11px] transition shadow-xs"
                        >
                          Kill Stuck
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      {(realtimeData?.vitals.stuckWorkers ?? queueStats.stuck) > 0
                        ? `${realtimeData?.vitals.stuckWorkers ?? queueStats.stuck} background worker job is stalled. Click below to terminate.`
                        : 'All scan queues flowing cleanly without worker stalls.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60">
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition shadow-sm"
                    >
                      Open Queue Inspector →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: USERS & SUBSCRIPTIONS (Clean White Cards)                */}
          {/* ============================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Subscription Revenue & Plan Quotas Matrix */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950">Subscription Revenue & Plan Quotas Matrix</h2>
                      <span className="px-2.5 py-0.5 bg-[#D4F63C] text-black font-black text-[10px] rounded-full uppercase tracking-wider">
                        Live Tier Sync
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Dynamic tier limits, allowed engines, and recurring revenue estimates synced with <code className="font-mono text-slate-900 font-bold">public.plan_configs</code>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 bg-[#D4F63C] text-black font-black text-xs rounded-full shadow-xs">
                      MRR: ${revenueMetrics.mrrUsd || 0}/mo
                    </span>
                    <span className="px-3.5 py-1.5 bg-slate-950 text-white font-bold text-xs rounded-full shadow-xs">
                      ARR: ${revenueMetrics.arrUsd || 0}/yr
                    </span>
                  </div>
                </div>

                {/* Plan Tier Config Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {planConfigs.map((plan) => (
                    <div key={plan.plan_name} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-sm text-slate-950 capitalize">{plan.display_name || plan.plan_name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plan.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                            {plan.is_active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-3">{plan.description}</p>

                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Price / mo ($):</span>
                            <input
                              type="number"
                              defaultValue={plan.price_usd}
                              id={`plan-price-${plan.plan_name}`}
                              className="w-20 px-2 py-1 text-right bg-[#f4f5f8] border border-slate-200 rounded-lg font-bold text-slate-900"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Keywords Limit:</span>
                            <input
                              type="number"
                              defaultValue={plan.keywords_limit}
                              id={`plan-keywords-${plan.plan_name}`}
                              className="w-20 px-2 py-1 text-right bg-[#f4f5f8] border border-slate-200 rounded-lg font-bold text-slate-900"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Projects Limit:</span>
                            <input
                              type="number"
                              defaultValue={plan.projects_limit}
                              id={`plan-projects-${plan.plan_name}`}
                              className="w-20 px-2 py-1 text-right bg-[#f4f5f8] border border-slate-200 rounded-lg font-bold text-slate-900"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-semibold">Scan Frequency:</span>
                            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-800 uppercase">
                              {plan.scan_frequency || 'weekly'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {plan.engines_allowed?.length || 1} AI Engines
                        </span>
                        <button
                          disabled={savingPlanName === plan.plan_name}
                          onClick={() => {
                            const priceEl = document.getElementById(`plan-price-${plan.plan_name}`) as HTMLInputElement;
                            const kwEl = document.getElementById(`plan-keywords-${plan.plan_name}`) as HTMLInputElement;
                            const projEl = document.getElementById(`plan-projects-${plan.plan_name}`) as HTMLInputElement;
                            handleUpdatePlanConfig(plan.plan_name, {
                              price_usd: Number(priceEl?.value) || 0,
                              keywords_limit: Number(kwEl?.value) || 10,
                              projects_limit: Number(projEl?.value) || 1,
                            });
                          }}
                          className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white rounded-full text-xs font-bold transition shadow-xs"
                        >
                          {savingPlanName === plan.plan_name ? 'Saving...' : 'Save Tier'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Directory */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-4 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search customers by email, name, or UUID..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-full text-xs text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4F63C] shadow-xs"
                  />
                </div>
                <div className="text-xs font-bold text-slate-500">{filteredUsers.length} Customers Enrolled</div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f4f5f8] border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-5 py-3.5">Customer Profile</th>
                        <th className="px-5 py-3.5">Active Tier</th>
                        <th className="px-5 py-3.5">Account State</th>
                        <th className="px-5 py-3.5">Registered</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-950">{u.email}</div>
                            <div className="text-slate-400 font-mono text-[10px]">{u.id}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-3 py-1 rounded-full font-black uppercase text-[10px] tracking-wider ${
                                u.plan === 'agency'
                                  ? 'bg-purple-100 text-purple-800'
                                  : u.plan === 'growth'
                                  ? 'bg-[#D4F63C] text-black'
                                  : u.plan === 'starter'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {u.plan || 'free'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {u.is_banned ? (
                              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded text-[10px]">
                                Suspended
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Log In As User (Impersonate) */}
                              <button
                                onClick={() => handleImpersonateUser(u.id)}
                                className="px-3 py-1.5 bg-[#D4F63C] hover:bg-[#c6ea2f] text-black rounded-full text-xs font-bold transition shadow-xs flex items-center gap-1"
                                title="Login as user to diagnose support issues"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Log In As
                              </button>

                              {/* Grant Plan Override */}
                              <button
                                onClick={() => setGrantModalUser(u)}
                                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition flex items-center gap-1 shadow-xs"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Grant Plan
                              </button>

                              {/* Ban / Unban */}
                              <button
                                onClick={() => handleToggleBan(u.id, u.is_banned)}
                                className={`px-2.5 py-1.5 rounded-full text-xs font-bold transition ${
                                  u.is_banned
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
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

              {/* Grant Plan Modal */}
              {grantModalUser && (
                <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white border border-slate-200 rounded-[32px] max-w-md w-full p-8 shadow-2xl">
                    <h3 className="text-xl font-black text-slate-950 mb-1">Manual Plan Grant</h3>
                    <p className="text-xs text-slate-500 mb-5">
                      Grant subscription tier override to <strong>{grantModalUser.email}</strong>
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Select Tier</label>
                        <select
                          value={grantPlan}
                          onChange={(e) => setGrantPlan(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#f4f5f8] border border-slate-200 rounded-2xl text-xs text-slate-950 font-semibold"
                        >
                          <option value="starter">Starter Plan ($49/mo)</option>
                          <option value="growth">Growth Plan ($149/mo)</option>
                          <option value="agency">Agency Plan ($299/mo)</option>
                          <option value="free">Free Tier</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Days)</label>
                        <input
                          type="number"
                          value={grantDuration}
                          onChange={(e) => setGrantDuration(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#f4f5f8] border border-slate-200 rounded-2xl text-xs text-slate-950 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Support Notes</label>
                        <input
                          type="text"
                          value={grantReason}
                          onChange={(e) => setGrantReason(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#f4f5f8] border border-slate-200 rounded-2xl text-xs text-slate-950"
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-2.5">
                      <button
                        onClick={() => setGrantModalUser(null)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecuteGrantPlan}
                        className="px-5 py-2.5 bg-[#D4F63C] hover:bg-[#c6ea2f] text-black rounded-full text-xs font-black transition shadow-xs"
                      >
                        Confirm Grant
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: SCAN QUEUE (Inspector & Stuck Killer)                   */}
          {/* ============================================================== */}
          {activeTab === 'queue' && (
            <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Live Scan Inspector & Queue</h2>
                  <p className="text-xs text-slate-500">
                    Active background worker jobs. Runs exceeding 10 minutes are flagged as stuck.
                  </p>
                </div>

                {queueStats.stuck > 0 && (
                  <button
                    onClick={handleKillAllStuck}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <StopCircle className="w-4 h-4" />
                    Kill All {queueStats.stuck} Stuck Scans
                  </button>
                )}
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f4f5f8] border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-5 py-3.5">Scan Run ID</th>
                        <th className="px-5 py-3.5">Brand / Target Domain</th>
                        <th className="px-5 py-3.5">Worker State</th>
                        <th className="px-5 py-3.5">Started At</th>
                        <th className="px-5 py-3.5">Queries / Cost</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queueRuns.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">{r.id.slice(0, 8)}...</td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-950">{r.brandName}</div>
                            <div className="text-slate-400 text-[10px]">{r.domain}</div>
                          </td>
                          <td className="px-5 py-4">
                            {r.isStuck ? (
                              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full font-black text-[10px] animate-pulse">
                                STUCK (&gt;10m)
                              </span>
                            ) : r.status === 'running' ? (
                              <span className="px-2.5 py-0.5 bg-[#D4F63C] text-black rounded-full font-bold text-[10px]">
                                RUNNING
                              </span>
                            ) : r.status === 'done' ? (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                                DONE
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold text-[10px]">
                                FAILED
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {r.startedAt ? new Date(r.startedAt).toLocaleTimeString() : '-'}
                          </td>
                          <td className="px-5 py-4 text-slate-700 font-mono">
                            {r.totalQueries} q / ${(r.apiCostUsd || 0).toFixed(3)}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {r.status === 'running' || r.isStuck ? (
                                <button
                                  onClick={() => handleKillScan(r.id)}
                                  className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-full text-[11px] font-bold transition"
                                >
                                  Force Kill
                                </button>
                              ) : null}

                              {r.status === 'failed' || r.isStuck ? (
                                <button
                                  onClick={() => handleRetryScan(r.id)}
                                  className="px-3 py-1.5 bg-[#D4F63C] text-black hover:bg-[#c6ea2f] rounded-full text-[11px] font-black transition flex items-center gap-1 shadow-xs"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  Retry Scan
                                </button>
                              ) : null}
                            </div>
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
          {/* TAB 4: ENGINE WATCHDOG & PROMPT PLAYGROUND                     */}
          {/* ============================================================== */}
          {activeTab === 'watchdog' && (
            <div className="space-y-6">
              {/* Top Engine Latency Cards */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">AI Engine Latency Watchdog</h2>
                    <p className="text-xs text-slate-500">
                      Live synthetic probes testing Gemini, OpenAI, Perplexity, and Grok roundtrip speeds.
                    </p>
                  </div>
                  <button
                    onClick={handlePingEngines}
                    disabled={testingEngines}
                    className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-full text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingEngines ? 'animate-spin text-[#D4F63C]' : ''}`} />
                    {testingEngines ? 'Probing All Engines...' : 'Probe All Engines Now'}
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {['gemini', 'openai', 'perplexity', 'grok'].map((eng) => {
                    const data = watchdogSummary[eng] || {};
                    const isHealthy = data.status === 'healthy';
                    const isDegraded = data.status === 'degraded';
                    const isDown = data.status === 'down';
                    return (
                      <div key={eng} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-sm text-slate-950 capitalize">{eng}</span>
                          <span
                            className={`w-3 h-3 rounded-full ${
                              isHealthy
                                ? 'bg-[#D4F63C] ring-4 ring-lime-200/50'
                                : isDegraded
                                ? 'bg-amber-400 ring-4 ring-amber-100'
                                : isDown
                                ? 'bg-rose-500 ring-4 ring-rose-100'
                                : 'bg-slate-300'
                            }`}
                          />
                        </div>
                        <div className="text-2xl font-black text-slate-950 font-mono">
                          {data.latencyMs ? `${data.latencyMs}ms` : '–'}
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 mt-1 capitalize">
                          {data.status || 'Ready for test'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Prompt A/B Testing Playground */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs">
                <h2 className="text-xl font-black text-slate-950 mb-1">Prompt A/B Testing Playground</h2>
                <p className="text-xs text-slate-500 mb-5">
                  Evaluate experimental prompts against live AI engines without writing to customer project history.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Engine</label>
                    <select
                      value={playgroundEngine}
                      onChange={(e) => setPlaygroundEngine(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-950 font-semibold"
                    >
                      <option value="gemini">Google Gemini 2.5 Flash</option>
                      <option value="openai">OpenAI GPT-4o-mini</option>
                      <option value="perplexity">Perplexity Sonar</option>
                      <option value="grok">Grok Beta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sample Brand & Domain</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={playgroundBrand}
                        onChange={(e) => setPlaygroundBrand(e.target.value)}
                        placeholder="Brand Name"
                        className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-950"
                      />
                      <input
                        type="text"
                        value={playgroundDomain}
                        onChange={(e) => setPlaygroundDomain(e.target.value)}
                        placeholder="domain.com"
                        className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Search Query</label>
                    <input
                      type="text"
                      value={playgroundKeyword}
                      onChange={(e) => setPlaygroundKeyword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prompt Template (Interpolates: <code className="text-black bg-lime-100 px-1 py-0.5 rounded font-mono">{"{{brand}}"}</code>,{' '}
                    <code className="text-black bg-lime-100 px-1 py-0.5 rounded font-mono">{"{{domain}}"}</code>,{' '}
                    <code className="text-black bg-lime-100 px-1 py-0.5 rounded font-mono">{"{{keyword}}"}</code>)
                  </label>
                  <textarea
                    rows={3}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-950 font-mono"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleRunPlayground}
                    disabled={runningPlayground || !promptInput}
                    className="px-6 py-2.5 bg-[#D4F63C] hover:bg-[#c6ea2f] text-black font-black rounded-full text-xs transition flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${runningPlayground ? 'animate-spin' : ''}`} />
                    {runningPlayground ? 'Simulating Query...' : 'Run Simulation'}
                  </button>
                </div>

                {playgroundResult && (
                  <div className="mt-5 p-5 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="font-black text-slate-950 capitalize">
                        Response from {playgroundResult.engine} ({playgroundResult.latencyMs}ms)
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-black font-bold bg-lime-100 px-2 py-0.5 rounded-full">
                          Mentions: {playgroundResult.mentionsCount}
                        </span>
                        <span className="text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded-full">
                          Sentiment: {playgroundResult.sentiment?.label} ({playgroundResult.sentiment?.score})
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
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
            <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">API Keys & Fallback Rotation Pool</h2>
                  <p className="text-xs text-slate-500">
                    Priority 1 is utilized first. Auto-rotates round-robin on consecutive provider errors with lowest-error failover.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResetAllKeyPool()}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold rounded-full text-xs transition flex items-center gap-1.5 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-lime-600" />
                    Revive Pool & Reset Errors
                  </button>
                  <button
                    onClick={() => setAddingKey(!addingKey)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-full text-xs transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add API Key
                  </button>
                </div>
              </div>

              {addingKey && (
                <form onSubmit={handleAddKey} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">New API Key Entry</h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Service</label>
                      <select
                        value={newKeyService}
                        onChange={(e) => setNewKeyService(e.target.value)}
                        className="w-full px-3 py-2 bg-[#f4f5f8] border border-slate-200 rounded-xl text-xs text-slate-950 font-semibold"
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
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Key Label</label>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g. primary-tier-1"
                        className="w-full px-3 py-2 bg-[#f4f5f8] border border-slate-200 rounded-xl text-xs text-slate-950"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Secret Key</label>
                      <input
                        type="password"
                        value={newKeyValue}
                        onChange={(e) => setNewKeyValue(e.target.value)}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 bg-[#f4f5f8] border border-slate-200 rounded-xl text-xs text-slate-950 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Priority</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={newKeyPriority}
                        onChange={(e) => setNewKeyPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-[#f4f5f8] border border-slate-200 rounded-xl text-xs text-slate-950 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddingKey(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#D4F63C] text-black font-black rounded-full text-xs shadow-xs"
                    >
                      Save Key
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apiKeys.map((k) => (
                  <div key={k.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-950 capitalize">{k.service}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                            Priority {k.priority}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                            {k.purpose || 'scan'}
                          </span>
                          {k.error_count > 0 ? (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              {k.error_count} Errors
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                              Active & Healthy
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggleKeyActive(k.id, k.is_active)}
                          className="p-1 text-slate-400 hover:text-black"
                        >
                          {k.is_active ? (
                            <ToggleRight className="w-8 h-8 text-lime-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-400" />
                          )}
                        </button>
                      </div>

                      <p className="font-mono text-xs text-slate-500 mb-2">
                        Label: <span className="text-slate-900 font-bold">{k.key_name}</span> • Purpose:{' '}
                        <span className="text-slate-700">{k.purpose}</span>
                      </p>

                      {k.error_count > 0 && (
                        <div className="flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-2">
                          <div className="max-w-[70%]">
                            <span className="font-bold">Errors: {k.error_count}/5</span> • Last: {k.last_error || 'Transient failure'}
                          </div>
                          <button
                            onClick={() => handleResetKeyErrors(k.id)}
                            className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-md text-[10px] transition shrink-0"
                          >
                            Reset Errors
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>Used: {k.last_used_at ? new Date(k.last_used_at).toLocaleTimeString() : 'Never'}</span>
                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold"
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
            <div className="space-y-6">
              {/* Anti Scraping IP Blacklist */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs">
                <h2 className="text-xl font-black text-slate-950 mb-1">Anti-Scraping IP Blacklist Shield</h2>
                <p className="text-xs text-slate-500 mb-5">
                  Blocked IPs immediately receive 403 Forbidden across public search check endpoints.
                </p>

                <form onSubmit={handleAddBlacklist} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                  <div>
                    <input
                      type="text"
                      placeholder="IP Address (e.g. 192.168.1.1)"
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-950 font-mono shadow-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Reason (e.g. scraper abuse)"
                      value={newIpReason}
                      onChange={(e) => setNewIpReason(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-950 shadow-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Expires in hours (e.g. 24)"
                      value={newIpHours}
                      onChange={(e) => setNewIpHours(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-950 shadow-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newIpAddress || !newIpReason}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-full text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <ShieldAlert className="w-4 h-4" /> Block IP
                  </button>
                </form>

                <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs">
                  {blacklistedIps.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">No active IP blocks in place.</p>
                  ) : (
                    blacklistedIps.map((ip) => (
                      <div key={ip.id} className="py-3 px-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-slate-950">{ip.ip_address}</div>
                          <div className="text-slate-500 text-[11px]">{ip.reason}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-400 text-[10px]">
                            {ip.expires_at ? `Expires: ${new Date(ip.expires_at).toLocaleTimeString()}` : 'Permanent'}
                          </span>
                          <button
                            onClick={() => handleRemoveBlacklist(ip.ip_address)}
                            className="text-emerald-700 hover:underline font-bold"
                          >
                            Unblock
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Hallucination & Brand Misinformation Sentinel */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950">AI Hallucination & Brand Misinformation Sentinel</h2>
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-black text-[10px] rounded-full uppercase tracking-wider">
                        Truth Engine
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Monitors AI search engines claiming incorrect pricing, distorted features, or hallucinations about customer brands.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full">
                      {misinformationStats.unreviewedAlerts} Unreviewed
                    </span>
                    <span className="px-3 py-1 bg-[#D4F63C] text-black font-black text-xs rounded-full">
                      {misinformationStats.openBriefs} Open Briefs
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f4f5f8] border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-5 py-3.5">Brand / Project</th>
                          <th className="px-5 py-3.5">AI Engine</th>
                          <th className="px-5 py-3.5">Claimed Quote</th>
                          <th className="px-5 py-3.5">Claimed vs Expected</th>
                          <th className="px-5 py-3.5">Confidence</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {misinformationAlerts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                              No active misinformation alerts detected. AI models are responding accurately.
                            </td>
                          </tr>
                        ) : (
                          misinformationAlerts.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 transition">
                              <td className="px-5 py-4 font-bold text-slate-950 font-mono">
                                {m.project?.domain || 'Brand Target'}
                              </td>
                              <td className="px-5 py-4">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 capitalize">
                                  {m.engine}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-slate-700 max-w-[220px] truncate" title={m.quote}>
                                &ldquo;{m.quote}&rdquo;
                              </td>
                              <td className="px-5 py-4">
                                <div className="text-[11px]">
                                  <span className="text-rose-600 font-bold">Claim: {m.claimed_value || 'N/A'}</span>
                                  <span className="text-slate-400 mx-1">→</span>
                                  <span className="text-emerald-600 font-bold">Truth: {m.expected_value || 'Verified'}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${Number(m.confidence) >= 0.8 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {Math.round(Number(m.confidence) * 100)}% Match
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {!m.reviewed && (
                                    <button
                                      onClick={() => handleMarkMisinformationReviewed(m.id)}
                                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full text-[11px] font-bold transition shadow-xs"
                                    >
                                      Mark Reviewed
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleCreateFixBrief(m.project_id, 'misinformation', `Correct false AI claim: ${m.claimed_value} should be ${m.expected_value}`)}
                                    className="px-3 py-1 bg-[#D4F63C] hover:bg-[#c6ea2f] text-black font-black rounded-full text-[11px] transition shadow-xs"
                                  >
                                    Create Brief
                                  </button>
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

              {/* AI Search Bot & Crawler Telemetry */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950">AI Search Bot & Crawler Telemetry</h2>
                      <span className="px-2.5 py-0.5 bg-[#D4F63C] text-black font-black text-[10px] rounded-full uppercase tracking-wider">
                        Edge Radar
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Reverse-DNS verified ingestion activity by GPTBot, ClaudeBot, PerplexityBot, and Google-Extended.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                      {crawlerStats.verifiedRatePct || 100}% Verified Crawlers
                    </span>
                    <span className="px-3 py-1 bg-slate-950 text-white font-bold text-xs rounded-full">
                      {crawlerStats.totalVisits || 0} Total Hits
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">GPTBot</p>
                    <p className="text-xl font-black text-slate-950 mt-1">{crawlerStats.botDistribution?.gptbot || 0}</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">ClaudeBot</p>
                    <p className="text-xl font-black text-slate-950 mt-1">{crawlerStats.botDistribution?.claudebot || 0}</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">PerplexityBot</p>
                    <p className="text-xl font-black text-slate-950 mt-1">{crawlerStats.botDistribution?.perplexitybot || 0}</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Google-Extended</p>
                    <p className="text-xl font-black text-slate-950 mt-1">{crawlerStats.botDistribution?.googleExtended || 0}</p>
                  </div>
                </div>

                {crawlerVisits.length > 0 && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs mt-3">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                      <span>Recent Crawler Ingestions</span>
                      <span className="text-emerald-600 font-mono font-bold">Live Traffic</span>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      {crawlerVisits.slice(0, 5).map((v) => (
                        <div key={v.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{v.engine || v.user_agent?.split('/')[0] || 'Bot'}</span>
                            <span className="text-slate-400 font-mono text-[11px]">{v.path || '/'}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v.is_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {v.is_verified ? 'Verified DNS' : 'Unverified'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Webhook Dead-Letter Queue */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs">
                <h2 className="text-xl font-black text-slate-950 mb-1">Webhook Dead-Letter Queue (LemonSqueezy)</h2>
                <p className="text-xs text-slate-500 mb-5">
                  Failed billing events. Retry to reconcile customer plan updates safely.
                </p>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs divide-y divide-slate-100">
                  {webhookEvents.length === 0 ? (
                    <p className="text-xs text-emerald-700 py-4 px-3 flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Dead-letter queue is clear. No failed webhooks detected.
                    </p>
                  ) : (
                    webhookEvents.map((w) => (
                      <div key={w.id} className="py-3.5 px-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-950 flex items-center gap-2">
                            <span className="font-mono text-emerald-600">#{w.id}</span>
                            <span>{w.event_name}</span>
                            <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-mono font-bold">
                              Attempts: {w.attempt_count}
                            </span>
                          </div>
                          <p className="text-rose-600 text-[11px] mt-1">{w.error || w.last_error}</p>
                        </div>
                        <button
                          onClick={() => handleRetryWebhook(w.id)}
                          className="px-3.5 py-1.5 bg-[#D4F63C] text-black hover:bg-[#c6ea2f] rounded-full text-xs font-black transition shadow-xs"
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
          {/* TAB 7: CONFIG, EMAIL DLQ & LIVE TEMPLATES                      */}
          {/* ============================================================== */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Outbound Email DLQ & Delivery Sentinel */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950">Outbound Email DLQ & Delivery Sentinel</h2>
                      <span className="px-2.5 py-0.5 bg-[#D4F63C] text-black font-black text-[10px] rounded-full uppercase tracking-wider">
                        Resend Relay
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Monitor outbound transactional emails, dead-letter queue failures, and re-dispatch failed notifications with 1 click.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadEmailData}
                      className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-full text-xs transition flex items-center gap-1.5 shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh DLQ
                    </button>
                    {emailStats.failed > 0 && (
                      <button
                        onClick={handleRetryAllFailedEmails}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retry All {emailStats.failed} Failed
                      </button>
                    )}
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Dispatches</p>
                    <p className="text-2xl font-black text-slate-950 mt-1">{emailStats.total}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Recorded outbound logs</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Delivered</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{emailStats.delivered}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Successfully sent</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Failed in DLQ</p>
                    <p className={`text-2xl font-black mt-1 ${emailStats.failed > 0 ? 'text-rose-600' : 'text-slate-950'}`}>
                      {emailStats.failed}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Dead-letter failures</p>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Delivery Rate</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-2xl font-black text-slate-950">{emailStats.successRate}%</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${emailStats.successRate >= 90 ? 'bg-[#D4F63C] text-black' : 'bg-rose-100 text-rose-800'}`}>
                        {emailStats.successRate >= 90 ? 'HEALTHY' : 'ATTENTION'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Reliability ratio</p>
                  </div>
                </div>

                {/* Send Test Email Quick Form */}
                <form onSubmit={handleSendTestEmail} className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>Test Dispatch:</span>
                  </div>
                  <input
                    type="email"
                    placeholder="recipient@example.com"
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-[#f4f5f8] border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-1 focus:ring-[#D4F63C] w-full"
                  />
                  <input
                    type="text"
                    placeholder="Optional custom subject"
                    value={testEmailSubject}
                    onChange={(e) => setTestEmailSubject(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-[#f4f5f8] border border-slate-200 rounded-xl text-xs text-slate-950 focus:outline-none focus:ring-1 focus:ring-[#D4F63C] w-full"
                  />
                  <button
                    type="submit"
                    disabled={sendingTestEmail || !testEmailTo}
                    className="px-5 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition whitespace-nowrap shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D4F63C]" />
                    {sendingTestEmail ? 'Sending...' : 'Send Test'}
                  </button>
                </form>

                {/* DLQ Logs Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider">Outbound Dispatch Logs</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Recent records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f4f5f8] border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-5 py-3">Recipient</th>
                          <th className="px-5 py-3">Event Type</th>
                          <th className="px-5 py-3">Subject</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Sent At</th>
                          <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {emailLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                              No notification logs recorded yet.
                            </td>
                          </tr>
                        ) : (
                          emailLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition">
                              <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono">{log.recipient}</td>
                              <td className="px-5 py-3.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                                  {log.event_type}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-slate-600 max-w-[200px] truncate" title={log.subject}>
                                {log.subject || '—'}
                              </td>
                              <td className="px-5 py-3.5">
                                {log.status === 'sent' || log.status === 'delivered' ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                                  </span>
                                ) : (
                                  <div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                                      <AlertTriangle className="w-3.5 h-3.5" /> Failed
                                    </span>
                                    {log.error_message && (
                                      <p className="text-[10px] text-rose-500 font-mono max-w-[220px] truncate" title={log.error_message}>
                                        {log.error_message}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                                {log.sent_at ? new Date(log.sent_at).toLocaleTimeString() : 'Pending'}
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                {log.status === 'failed' ? (
                                  <button
                                    onClick={() => handleRetryEmail(log.id)}
                                    className="px-3 py-1 bg-[#D4F63C] hover:bg-[#c6ea2f] text-black font-black rounded-full text-[11px] transition shadow-xs"
                                  >
                                    Retry Send
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-medium">Delivered</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Live Email Template Editor */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs">
                <h2 className="text-xl font-black text-slate-950 mb-1">Live Email Template Customizer</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Modify Markdown templates sent by AEO Tracker with dynamic variable tags.
                </p>

                <div className="flex gap-2 mb-4">
                  {Object.keys(emailTemplates).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedTemplateKey(key);
                        setTemplateContentInput(emailTemplates[key].currentValue);
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition ${
                        selectedTemplateKey === key
                          ? 'bg-slate-950 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {emailTemplates[key].name}
                    </button>
                  ))}
                </div>

                {emailTemplates[selectedTemplateKey] && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-800">Supported Variables:</span>
                      {emailTemplates[selectedTemplateKey].variables.map((v: string) => (
                        <code key={v} className="bg-white text-slate-950 px-2 py-0.5 rounded-full border border-slate-200 font-mono font-bold">
                          {v}
                        </code>
                      ))}
                    </div>

                    <textarea
                      rows={6}
                      value={templateContentInput}
                      onChange={(e) => setTemplateContentInput(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-950 font-mono shadow-xs"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveTemplate}
                        className="px-5 py-2.5 bg-[#D4F63C] hover:bg-[#c6ea2f] text-black font-black rounded-full text-xs transition shadow-xs"
                      >
                        Save Email Template
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Global System Settings */}
              <div>
                <h2 className="text-xl font-black text-slate-950 mb-1">Global System Settings</h2>
                <p className="text-xs text-slate-500 mb-4">
                  Dynamic variables stored in <code className="font-mono text-slate-900 font-bold">public.app_config</code>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appConfigs.map((cfg) => (
                    <div key={cfg.key} className="bg-[#f8f9fb] border border-slate-200/70 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs font-black text-slate-950">{cfg.key}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                            {cfg.value_type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">{cfg.description || 'System setting'}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type={cfg.is_secret ? 'password' : 'text'}
                          defaultValue={cfg.value}
                          id={`cfg-${cfg.key}`}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-950 font-mono shadow-xs focus:outline-none focus:ring-1 focus:ring-[#D4F63C]"
                        />
                        <button
                          onClick={() => {
                            const el = document.getElementById(`cfg-${cfg.key}`) as HTMLInputElement;
                            if (el) handleUpdateConfig(cfg.key, el.value);
                          }}
                          className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
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
                <h2 className="text-xl font-black text-slate-950 mb-1">Runtime Feature Flags</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {featureFlags.map((flag) => (
                    <div key={flag.flag_key} className="bg-[#f8f9fb] border border-slate-200/70 rounded-2xl p-5 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-slate-950">{flag.flag_key}</span>
                          <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
                            {flag.applies_to}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{flag.description || 'Feature switch'}</p>
                      </div>

                      <button
                        onClick={() => handleToggleFlag(flag.flag_key, flag.is_enabled)}
                        className="p-1 text-slate-400 hover:text-black"
                      >
                        {flag.is_enabled ? (
                          <ToggleRight className="w-8 h-8 text-lime-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-400" />
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1-Click JSON Snapshot Backup */}
                <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    <h3 className="text-xl font-black text-slate-950 mb-1">1-Click Database JSON Backup</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Stream a full JSON snapshot of all customer profiles, projects, keywords, app configs, and active API keys.
                    </p>
                  </div>
                  <div className="mt-6">
                    <a
                      href="/api/admin/backup"
                      download
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-full text-xs transition shadow-sm"
                    >
                      <Download className="w-4 h-4 text-[#D4F63C]" />
                      Download Full JSON Snapshot
                    </a>
                  </div>
                </div>

                {/* Database Storage Hygiene */}
                <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 flex flex-col justify-between shadow-xs">
                  <div>
                    <h3 className="text-xl font-black text-slate-950 mb-1">Storage & Database Hygiene</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Safely purge transient AI scan output responses older than 90 days and error logs to reclaim table storage.
                    </p>
                    {hygieneStats && (
                      <div className="mt-3 text-xs text-slate-600 font-mono">
                        Reclaimable rows: <span className="text-slate-950 font-black">{hygieneStats.totalReclaimableRows}</span> records
                      </div>
                    )}
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={handleExecuteHygienePrune}
                      className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-full text-xs transition shadow-xs"
                    >
                      Execute Hygiene Prune (Delete &gt;90d)
                    </button>
                  </div>
                </div>
              </div>

              {/* Viral Public Reports Cache Explorer & Pre-Warmer */}
              <div className="bg-[#f8f9fb] border border-slate-200/70 rounded-[28px] p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950">Viral Public Reports Cache Manager</h2>
                      <span className="px-2.5 py-0.5 bg-[#D4F63C] text-black font-black text-[10px] rounded-full uppercase tracking-wider">
                        Prospect Funnel
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Evaluated SaaS brand reports cached for instant sub-100ms free check delivery at <code className="font-mono text-slate-900 font-bold">/report/[domain]</code>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={prewarmingCache}
                      onClick={() => handlePrewarmCache()}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-full text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D4F63C]" />
                      {prewarmingCache ? 'Pre-warming...' : 'Pre-warm Top 20'}
                    </button>
                    {cacheTotal > 0 && (
                      <button
                        onClick={handlePurgeAllCache}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-full text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Purge All ({cacheTotal})
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f4f5f8] border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-5 py-3.5">Target Domain</th>
                          <th className="px-5 py-3.5">Brand</th>
                          <th className="px-5 py-3.5">AEO Visibility</th>
                          <th className="px-5 py-3.5">Share of Voice</th>
                          <th className="px-5 py-3.5">Last Refreshed</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cachedReports.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                              Cache is empty. Click &quot;Pre-warm Top 20&quot; to cache top domains for immediate sub-100ms prospective visits.
                            </td>
                          </tr>
                        ) : (
                          cachedReports.map((c) => (
                            <tr key={c.domain} className="hover:bg-slate-50 transition">
                              <td className="px-5 py-4 font-mono font-bold text-slate-900">{c.domain}</td>
                              <td className="px-5 py-4 text-slate-700 font-semibold">{c.brand_name || 'Brand'}</td>
                              <td className="px-5 py-4">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D4F63C] text-black">
                                  {c.visibility_score || 0}%
                                </span>
                              </td>
                              <td className="px-5 py-4 text-slate-600 font-mono text-[11px]">
                                {c.share_of_voice_pct ? `${Math.round(Number(c.share_of_voice_pct) * 100)}%` : '—'}
                              </td>
                              <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                                {c.updated_at ? new Date(c.updated_at).toLocaleTimeString() : 'Fresh'}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <button
                                  onClick={() => handlePurgeDomainCache(c.domain)}
                                  className="text-rose-600 hover:text-rose-700 text-xs font-bold"
                                >
                                  Purge
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

              {/* Audit Logs */}
              <div>
                <h2 className="text-xl font-black text-slate-950 mb-1">Security & Action Audit Logs</h2>
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs mt-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f4f5f8] border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-5 py-3.5">Action</th>
                          <th className="px-5 py-3.5">Target Type</th>
                          <th className="px-5 py-3.5">Target ID</th>
                          <th className="px-5 py-3.5">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition">
                            <td className="px-5 py-4 font-mono font-bold text-slate-900">{log.action}</td>
                            <td className="px-5 py-4 text-slate-600">{log.target_type}</td>
                            <td className="px-5 py-4 font-mono text-[11px] text-slate-400">{log.target_id || '-'}</td>
                            <td className="px-5 py-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
    </div>
  );
}
