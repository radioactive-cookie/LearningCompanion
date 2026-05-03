import { useState, useEffect } from "react";
import { Shield, Plus, Trash2, LogOut, AlertTriangle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function api(path: string, options?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
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
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoFocus
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
          />
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 pr-10 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
            />
            <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" />{error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !email || !password}
            className="w-full bg-white text-gray-900 text-sm font-semibold rounded-lg px-4 py-3 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
interface Admin { id: number; email: string; createdAt: string; }

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const load = async () => {
    const res = await api("/api/admin/list");
    if (res.ok) setAdmins((await res.json()).admins);
  };

  useEffect(() => { load(); }, []);

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    const res = await api("/api/admin/add", { method: "POST", body: JSON.stringify({ email: newEmail.trim() }) });
    const data = await res.json();
    if (res.ok) { setMsg({ text: `${newEmail.trim()} added`, ok: true }); setNewEmail(""); load(); }
    else setMsg({ text: data.error ?? "Failed to add", ok: false });
    setBusy(false);
  };

  const removeAdmin = async (target: string) => {
    setRemoving(target);
    await api("/api/admin/remove", { method: "DELETE", body: JSON.stringify({ email: target }) });
    await load();
    setRemoving(null);
  };

  const logout = async () => {
    await api("/api/admin/logout", { method: "POST" });
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>

        {/* Add Admin */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-gray-500" />Add Admin
          </h2>
          <form onSubmit={addAdmin} className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={e => { setNewEmail(e.target.value); setMsg(null); }}
              placeholder="email@example.com"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
            />
            <button
              type="submit"
              disabled={busy || !newEmail.trim()}
              className="bg-white text-gray-900 text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-gray-100 disabled:opacity-40 transition-colors"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add"}
            </button>
          </form>
          {msg && (
            <p className={`flex items-center gap-1.5 text-xs mt-2 ${msg.ok ? "text-green-400" : "text-red-400"}`}>
              {msg.ok ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {msg.text}
            </p>
          )}
        </div>

        {/* Admin List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            Admins
            <span className="ml-auto text-xs text-gray-600">{admins.length} total</span>
          </h2>
          {admins.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">No admins yet</p>
          ) : (
            <ul className="space-y-2">
              {admins.map(a => (
                <li key={a.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm text-white">{a.email}</p>
                    <p className="text-xs text-gray-600">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                  {a.email === email ? (
                    <span className="text-xs text-gray-600">you</span>
                  ) : (
                    <button
                      onClick={() => removeAdmin(a.email)}
                      disabled={removing === a.email}
                      className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40"
                    >
                      {removing === a.email ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export function AdminPage() {
  const [status, setStatus] = useState<{ isAuthenticated: boolean; isAdminEmail: boolean; email?: string } | null>(null);
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

  return <Login onSuccess={check} />;
}
