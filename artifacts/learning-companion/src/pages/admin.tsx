import { useState, useEffect } from "react";
import { Shield, Plus, Trash2, LogOut, AlertTriangle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

interface AdminStatus {
  isAuthenticated: boolean;
  isAdminEmail: boolean;
  isAdminVerified: boolean;
  bootstrapMode?: boolean;
  displayName?: string;
  email?: string;
}

interface AdminEntry {
  id: number;
  email: string;
  createdAt: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res;
}

// ── Login form ─────────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return;
    setLoading(true);
    const res = await apiFetch("/api/admin/login-direct", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const data = await res.json();
    if (res.ok) {
      onSuccess();
    } else {
      setError(data.error ?? "Login failed");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
        <Shield className="w-7 h-7 text-white/60" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-1 text-center">Admin Login</h2>
      <p className="text-sm text-white/40 mb-7 text-center">Enter your admin email and password</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
          className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim() || !password}
          className="w-full bg-white text-black text-sm font-semibold rounded-xl px-4 py-3 mt-1 transition-all hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
        </button>
      </form>
    </div>
  );
}

// ── Step 2: Password verify ────────────────────────────────────────────────────
function PasswordStep({
  displayName,
  email,
  onVerified,
}: {
  displayName: string;
  email: string;
  onVerified: () => void;
}) {
  const [password, setPassword] = useState("");
  const [setupMode, setSetupMode] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [clickLoading, setClickLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function init() {
      const [probeRes, accountsRes] = await Promise.all([
        apiFetch("/api/admin/verify-password", {
          method: "POST",
          body: JSON.stringify({ password: "__probe__" }),
        }),
        apiFetch("/api/admin/accounts"),
      ]);
      const probeData = await probeRes.json();
      if (probeData.error === "Admin password not configured yet") setSetupMode(true);
      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData.accounts ?? []);
      }
      setCheckingSetup(false);
    }
    init();
  }, []);

  const handleAccountClick = async (accountEmail: string) => {
    if (accountEmail.toLowerCase() !== email.toLowerCase()) return;
    setError("");
    setClickLoading(true);
    try {
      const res = await apiFetch("/api/admin/skip-verify", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setClickLoading(false); return; }
      onVerified();
    } catch {
      setError("Network error. Try again.");
      setClickLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (setupMode && password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      if (setupMode) {
        const res = await apiFetch("/api/admin/setup-password", {
          method: "POST",
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setLoading(false); return; }
      }
      const res = await apiFetch("/api/admin/verify-password", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      onVerified();
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-white/40 animate-spin" /></div>;
  }

  const isMyAccount = (a: string) => a.toLowerCase() === email.toLowerCase();

  return (
    <div>
      {/* Admin accounts — click to log in */}
      {accounts.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-white/40 mb-2.5 flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            Select your admin account to proceed
          </p>
          <ul className="space-y-2">
            {accounts.map((a) => {
              const mine = isMyAccount(a);
              return (
                <li key={a}>
                  <button
                    onClick={() => handleAccountClick(a)}
                    disabled={!mine || clickLoading}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                      mine
                        ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 cursor-pointer"
                        : "bg-white/[0.03] border-white/[0.06] opacity-40 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${mine ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/40"}`}>
                        {a[0].toUpperCase()}
                      </div>
                      <span className={`text-sm ${mine ? "text-white" : "text-white/40"}`}>{a}</span>
                    </div>
                    {mine && (
                      clickLoading
                        ? <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                        : <span className="text-xs text-emerald-400 font-medium">Click to enter →</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5 mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />{error}
        </p>
      )}

      {/* Password fallback */}
      <button
        onClick={() => setShowPassword((v) => !v)}
        className="w-full text-xs text-white/25 hover:text-white/50 transition-colors text-center py-1.5 mb-1"
      >
        {showPassword ? "Hide password form ↑" : "Or enter admin password instead ↓"}
      </button>

      {showPassword && (
        <>
          {setupMode && (
            <p className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 mb-3">
              No password set yet. Create one to enable password-based login.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className="w-full bg-[#1e1e20] border border-white/[0.10] text-white placeholder-[#52525b] text-[15px] rounded-xl px-4 py-3.5 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all"
            />
            {setupMode && (
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-[#1e1e20] border border-white/[0.10] text-white placeholder-[#52525b] text-[15px] rounded-xl px-4 py-3.5 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#f4f4f5] disabled:opacity-50 text-[#09090b] text-[15px] font-semibold rounded-xl px-4 py-3.5 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {setupMode ? "Set password & enter" : "Enter dashboard"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

// ── Step 3: Dashboard ─────────────────────────────────────────────────────────
function Dashboard({ email, displayName, onLogout }: { email: string; displayName: string; onLogout: () => void }) {
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [listLoading, setListLoading] = useState(true);

  const fetchAdmins = async () => {
    setListLoading(true);
    const res = await apiFetch("/api/admin/list");
    if (res.ok) {
      const data = await res.json();
      setAdmins(data.admins);
    }
    setListLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    if (!newEmail.trim()) return;
    setAddLoading(true);
    const res = await apiFetch("/api/admin/add", {
      method: "POST",
      body: JSON.stringify({ email: newEmail.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setAddSuccess(`${newEmail.trim()} added as admin`);
      setNewEmail("");
      await fetchAdmins();
    } else {
      setAddError(data.error ?? "Failed to add");
    }
    setAddLoading(false);
  };

  const handleRemove = async (targetEmail: string) => {
    setRemoveLoading(targetEmail);
    await apiFetch("/api/admin/remove", {
      method: "DELETE",
      body: JSON.stringify({ email: targetEmail }),
    });
    await fetchAdmins();
    setRemoveLoading(null);
  };

  const handleLogout = async () => {
    await apiFetch("/api/admin/logout", { method: "POST" });
    onLogout();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Admin Dashboard</h2>
          <p className="text-xs text-white/40 mt-0.5">Signed in as {displayName} · {email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Lock
        </button>
      </div>

      {/* Add admin */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-white/40" />
          Add Admin
        </h3>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => { setNewEmail(e.target.value); setAddError(""); setAddSuccess(""); }}
            placeholder="admin@example.com"
            className="flex-1 bg-[#1e1e20] border border-white/[0.10] text-white placeholder-[#52525b] text-sm rounded-lg px-3 py-2.5 outline-none focus:border-white/25 transition-all"
          />
          <button
            type="submit"
            disabled={addLoading || !newEmail.trim()}
            className="bg-white hover:bg-[#f4f4f5] disabled:opacity-50 text-[#09090b] text-sm font-semibold rounded-lg px-4 py-2.5 transition-all whitespace-nowrap"
          >
            {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
          </button>
        </form>
        {addError && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{addError}</p>}
        {addSuccess && <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" />{addSuccess}</p>}
      </div>

      {/* Admin list */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-white/40" />
          Admin Accounts
          <span className="ml-auto text-xs text-white/30">{admins.length} total</span>
        </h3>
        {listLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-white/30 animate-spin" /></div>
        ) : admins.length === 0 ? (
          <p className="text-sm text-white/30 text-center py-4">No admins configured</p>
        ) : (
          <ul className="space-y-2">
            {admins.map((admin) => (
              <li key={admin.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                <div>
                  <p className="text-sm text-white">{admin.email}</p>
                  <p className="text-xs text-white/30">{new Date(admin.createdAt).toLocaleDateString()}</p>
                </div>
                {admin.email !== email && (
                  <button
                    onClick={() => handleRemove(admin.email)}
                    disabled={removeLoading === admin.email}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                  >
                    {removeLoading === admin.email ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                )}
                {admin.email === email && (
                  <span className="text-xs text-white/20 px-2">(you)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ── Main admin page ────────────────────────────────────────────────────────────
export function AdminPage() {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/status");
    if (res.ok) setStatus(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, []);

  const showDashboard = status?.isAuthenticated && status?.isAdminEmail;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#09090b] px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl" />
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
          <Shield className="w-4 h-4 text-white/60" />
        </div>
        <span className="text-sm font-medium text-white/60">Companion · Admin</span>
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-7 h-7 text-white/30 animate-spin" />
          </div>
        ) : (
          <div className="bg-[#131314] border border-white/[0.08] rounded-2xl p-7 shadow-2xl shadow-black/60">
            {showDashboard ? (
              <Dashboard
                email={status!.email!}
                displayName={status!.displayName!}
                onLogout={fetchStatus}
              />
            ) : (
              <LoginForm onSuccess={fetchStatus} />
            )}
          </div>
        )}
      </div>

      <p className="relative z-10 mt-6 text-xs text-white/20">
        Restricted access · Direct URL only
      </p>
    </div>
  );
}
