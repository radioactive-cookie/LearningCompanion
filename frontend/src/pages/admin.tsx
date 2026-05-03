import { useState, useEffect, useCallback } from "react";
import {
  Shield, Plus, Trash2, LogOut, AlertTriangle, CheckCircle,
  Loader2, Eye, EyeOff, Users, Activity, Cpu, Clock, Wifi, WifiOff,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const SUPERADMIN = "pritammunshi2005@gmail.com";

async function api(path: string, options?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
}

// ── First-time setup ───────────────────────────────────────────────────────────
function SetupPassword({ onDone }: { onDone: () => void }) {
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 6) { setError("Minimum 6 characters"); return; }
    setBusy(true);
    const res = await api("/api/admin/add-initial", {
      method: "POST",
      body: JSON.stringify({ email: adminEmail.trim(), password }),
    });
    const data = await res.json();
    if (res.ok) onDone();
    else setError(data.error ?? "Setup failed");
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800 mb-4">
            <Shield className="w-6 h-6 text-gray-300" />
          </div>
          <h1 className="text-xl font-semibold text-white">Admin Setup</h1>
          <p className="text-sm text-gray-500 mt-1">Create your admin account to get started</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
            placeholder="Admin email" required autoFocus
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500 transition-colors" />
          <div className="relative">
            <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500 transition-colors" />
            <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <input type={show ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm password" required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500 transition-colors" />
          {error && <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertTriangle className="w-3.5 h-3.5" />{error}</p>}
          <button type="submit" disabled={busy || !adminEmail || !password || !confirm}
            className="w-full bg-white text-gray-900 text-sm font-semibold rounded-lg px-4 py-3 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Admin Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────────────────────────
function Login({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await api("/api/admin/login-direct", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) onSuccess();
    else setError(data.error ?? "Login failed");
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-800 mb-4">
            <Shield className="w-6 h-6 text-gray-300" />
          </div>
          <h1 className="text-xl font-semibold text-white">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your admin account</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email" required autoFocus
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500 transition-colors" />
          <div className="relative">
            <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500 transition-colors" />
            <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="flex items-center gap-1.5 text-xs text-red-400"><AlertTriangle className="w-3.5 h-3.5" />{error}</p>}
          <button type="submit" disabled={busy || !email || !password}
            className="w-full bg-white text-gray-900 text-sm font-semibold rounded-lg px-4 py-3 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-lg font-semibold text-white leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
interface Admin { id: number; email: string; createdAt: string; }
interface Stats {
  totalUsers: number;
  activeSessions: number;
  stepDistribution: { label: string; count: number }[];
  apiStatus: string;
  lastRequestTime: string | null;
}

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const isSuperAdmin = email.toLowerCase() === SUPERADMIN;

  // Admin management state
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [addMsg, setAddMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [adminsLoading, setAdminsLoading] = useState(true);

  // Stats state
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadAdmins = useCallback(async () => {
    setAdminsLoading(true);
    const res = await api("/api/admin/list");
    if (res.ok) setAdmins((await res.json()).admins);
    setAdminsLoading(false);
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await api("/api/admin/stats");
    if (res.ok) setStats(await res.json());
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    loadAdmins();
    loadStats();
  }, [loadAdmins, loadStats]);

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg(null);
    setAddBusy(true);
    const res = await api("/api/admin/add", { method: "POST", body: JSON.stringify({ email: newEmail.trim() }) });
    const data = await res.json();
    if (res.ok) { setAddMsg({ text: `${newEmail.trim()} added`, ok: true }); setNewEmail(""); loadAdmins(); }
    else setAddMsg({ text: data.error ?? "Failed to add", ok: false });
    setAddBusy(false);
  };

  const removeAdmin = async (target: string) => {
    setRemoving(target);
    const res = await api("/api/admin/remove", { method: "DELETE", body: JSON.stringify({ email: target }) });
    const data = await res.json();
    if (!res.ok) setAddMsg({ text: data.error ?? "Failed to remove", ok: false });
    await loadAdmins();
    setRemoving(null);
  };

  const logout = async () => {
    await api("/api/admin/logout", { method: "POST" });
    onLogout();
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "No requests yet";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">{email}{isSuperAdmin && <span className="ml-2 text-amber-400">· Superadmin</span>}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>

        {/* ── Section 1: Admin Management ───────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Admin Management</h2>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
            {/* Add admin */}
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />Add Admin</p>
              <form onSubmit={addAdmin} className="flex gap-2">
                <input type="email" value={newEmail}
                  onChange={e => { setNewEmail(e.target.value); setAddMsg(null); }}
                  placeholder="email@example.com"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500 transition-colors" />
                <button type="submit" disabled={addBusy || !newEmail.trim()}
                  className="bg-white text-gray-900 text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-gray-100 disabled:opacity-40 transition-colors flex items-center">
                  {addBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
                </button>
              </form>
              {addMsg && (
                <p className={`flex items-center gap-1.5 text-xs mt-2 ${addMsg.ok ? "text-green-400" : "text-red-400"}`}>
                  {addMsg.ok ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {addMsg.text}
                </p>
              )}
            </div>

            {/* Admin list */}
            <div>
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />Admins
                <span className="ml-auto">{admins.length} total</span>
              </p>
              {adminsLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-gray-600 animate-spin" /></div>
              ) : admins.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-4">No admins yet</p>
              ) : (
                <ul className="space-y-2">
                  {admins.map(a => (
                    <li key={a.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm text-white flex items-center gap-2">
                          {a.email}
                          {a.email.toLowerCase() === SUPERADMIN && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 rounded px-1.5 py-0.5">superadmin</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600">{new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                      {a.email === email ? (
                        <span className="text-xs text-gray-600">you</span>
                      ) : isSuperAdmin ? (
                        <button onClick={() => removeAdmin(a.email)} disabled={removing === a.email}
                          className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40">
                          {removing === a.email ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-700">—</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* ── Section 2: User Activity Overview ────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-white uppercase tracking-wide">User Activity Overview</h2>
            </div>
            <button onClick={loadStats} className="text-xs text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1">
              <Loader2 className={`w-3 h-3 ${statsLoading ? "animate-spin" : ""}`} />Refresh
            </button>
          </div>

          {statsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-gray-600 animate-spin" /></div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<Users className="w-4 h-4 text-blue-400" />} label="Total Users" value={stats?.totalUsers ?? 0} />
                <StatCard icon={<Wifi className="w-4 h-4 text-green-400" />} label="Active Sessions" value={stats?.activeSessions ?? 0} />
              </div>

              {/* Step distribution */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-xs text-gray-500 mb-3">Current step users are on</p>
                {!stats?.stepDistribution?.length ? (
                  <p className="text-sm text-gray-600 text-center py-2">No progress data yet</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.stepDistribution.map((s, i) => {
                      const max = stats.stepDistribution[0]?.count ?? 1;
                      const pct = Math.round((s.count / max) * 100);
                      return (
                        <li key={i}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-400 truncate max-w-[200px]">{s.label}</span>
                            <span className="text-gray-500 ml-2">{s.count} user{s.count !== 1 ? "s" : ""}</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Section 3: System Health ──────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wide">System Health</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={stats?.apiStatus === "working"
                ? <Wifi className="w-4 h-4 text-green-400" />
                : <WifiOff className="w-4 h-4 text-red-400" />}
              label="API Status"
              value={stats?.apiStatus === "working" ? "Working" : "Failed"}
              sub={stats?.apiStatus === "working" ? "All endpoints responding" : "Check server logs"}
            />
            <StatCard
              icon={<Clock className="w-4 h-4 text-purple-400" />}
              label="Last Request"
              value={stats?.lastRequestTime ? formatTime(stats.lastRequestTime) : "—"}
              sub={stats?.lastRequestTime ? new Date(stats.lastRequestTime).toLocaleDateString() : "No requests yet"}
            />
          </div>
        </section>

      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export function AdminPage() {
  const [status, setStatus] = useState<{
    isAuthenticated: boolean;
    isAdminEmail: boolean;
    hasPassword?: boolean;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const check = async () => {
    setLoading(true);
    const res = await api("/api/admin/status");
    if (res.ok) setStatus(await res.json());
    setLoading(false);
  };

  useEffect(() => { check(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
      </div>
    );
  }

  if (status?.isAuthenticated && status?.isAdminEmail) {
    return <Dashboard email={status.email!} onLogout={check} />;
  }

  if (status?.hasPassword === false) {
    return <SetupPassword onDone={check} />;
  }

  return <Login onSuccess={check} />;
}
