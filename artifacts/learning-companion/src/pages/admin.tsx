import { useState, useEffect } from "react";
import { Shield, Plus, Trash2, LogOut, Key, UserCheck, AlertTriangle, CheckCircle, Loader2, Lock } from "lucide-react";

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

// ── Step indicators ────────────────────────────────────────────────────────────
function Steps({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { label: "Login", icon: UserCheck },
    { label: "Verify", icon: Key },
    { label: "Dashboard", icon: Shield },
  ];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        const Icon = s.icon;
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${done ? "bg-emerald-500/20 text-emerald-400" : active ? "bg-white/10 text-white" : "bg-white/5 text-white/30"}`}>
              <Icon className="w-3 h-3" />
              {s.label}
            </div>
            {i < 2 && <div className={`w-8 h-px ${step > n ? "bg-emerald-500/40" : "bg-white/10"}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Login ──────────────────────────────────────────────────────────────
function LoginStep() {
  const handleLogin = () => {
    window.location.href = `${BASE}/api/login?returnTo=/admin`;
  };

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
        <Shield className="w-7 h-7 text-white/60" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Admin Access</h2>
      <p className="text-sm text-white/40 mb-7">
        Sign in with your authorized account to continue
      </p>
      <button
        onClick={handleLogin}
        className="w-full flex items-center justify-center gap-3 bg-[#1e1e20] hover:bg-[#28282a] border border-white/[0.12] text-white text-[15px] font-medium rounded-xl px-4 py-3.5 transition-all duration-150 hover:border-white/20"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4"/>
          <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
          <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4069 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
          <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9254L15.0218 2.344C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.9582L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>
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
  const [error, setError] = useState("");
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    async function check() {
      const res = await apiFetch("/api/admin/verify-password", {
        method: "POST",
        body: JSON.stringify({ password: "__probe__" }),
      });
      const data = await res.json();
      if (data.error === "Admin password not configured yet") setSetupMode(true);
      setCheckingSetup(false);
    }
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (setupMode && password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
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

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <span className="text-sm font-semibold text-white">{(displayName[0] || email[0] || "A").toUpperCase()}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white">{displayName}</p>
          <p className="text-xs text-white/40">{email}</p>
        </div>
        <div className="ml-auto flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-emerald-400">Admin</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <Lock className="w-4 h-4 text-white/40" />
        <h3 className="text-sm font-medium text-white">
          {setupMode ? "Set admin password" : "Enter admin password"}
        </h3>
      </div>
      {setupMode && (
        <p className="text-xs text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 mb-4">
          No password set yet. Create a secure admin password to protect this panel.
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
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {error}
          </p>
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

  const step: 1 | 2 | 3 = !status?.isAuthenticated ? 1 : !status?.isAdminVerified ? 2 : 3;

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
          <>
            <Steps step={step} />

            <div className="bg-[#131314] border border-white/[0.08] rounded-2xl p-7 shadow-2xl shadow-black/60">
              {step === 1 && <LoginStep />}

              {step === 2 && status?.isAdminEmail === false && (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <h2 className="text-base font-semibold text-white mb-2">Access Denied</h2>
                  <p className="text-sm text-white/40 mb-5">
                    <span className="text-white/60">{status.email}</span> is not authorized as an admin.
                  </p>
                  <button
                    onClick={() => { window.location.href = `${BASE}/api/logout`; }}
                    className="text-sm text-white/30 hover:text-white/60 transition-colors"
                  >
                    Sign out and try a different account
                  </button>
                </div>
              )}

              {step === 2 && status?.isAdminEmail === true && (
                <PasswordStep
                  displayName={status.displayName ?? status.email ?? "Admin"}
                  email={status.email ?? ""}
                  onVerified={fetchStatus}
                />
              )}

              {step === 3 && (
                <Dashboard
                  email={status!.email!}
                  displayName={status!.displayName!}
                  onLogout={fetchStatus}
                />
              )}
            </div>
          </>
        )}
      </div>

      <p className="relative z-10 mt-6 text-xs text-white/20">
        Restricted access · Direct URL only
      </p>
    </div>
  );
}
