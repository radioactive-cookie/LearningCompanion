import { useRef, useState, useCallback } from "react";
import { X, Download, Link2, Check, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CertificateRecord } from "@workspace/api-client-react";

// ---------------------------------------------------------------------------
// Language meta — icons + display labels
// ---------------------------------------------------------------------------
const LANG_META: Record<string, { label: string; icon: string; accent: string }> = {
  python:     { label: "Python",     icon: "🐍", accent: "#3b82f6" },
  javascript: { label: "JavaScript", icon: "⚡", accent: "#eab308" },
  html:       { label: "HTML",       icon: "🌐", accent: "#f97316" },
  css:        { label: "CSS",        icon: "🎨", accent: "#0ea5e9" },
  java:       { label: "Java",       icon: "☕", accent: "#ef4444" },
  "c++":      { label: "C++",        icon: "⚙️", accent: "#6366f1" },
  typescript: { label: "TypeScript", icon: "💙", accent: "#2563eb" },
  react:      { label: "React",      icon: "⚛️", accent: "#06b6d4" },
  sql:        { label: "SQL",        icon: "🗄️", accent: "#22c55e" },
  php:        { label: "PHP",        icon: "🐘", accent: "#a855f7" },
  go:         { label: "Go",         icon: "🔵", accent: "#14b8a6" },
  ruby:       { label: "Ruby",       icon: "💎", accent: "#f43f5e" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Certificate card — the visual certificate rendered in the DOM
// ---------------------------------------------------------------------------
function CertificateCard({ cert, nameOverride }: { cert: CertificateRecord; nameOverride?: string }) {
  const meta = LANG_META[cert.language] ?? { label: cert.language, icon: "💻", accent: "#6366f1" };
  const name = nameOverride ?? cert.userName;

  return (
    <div
      id="certificate-card"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      className="relative w-full bg-white overflow-hidden select-none"
    >
      {/* Outer gold border frame */}
      <div className="absolute inset-0 border-[12px] border-amber-200 rounded-none pointer-events-none" />
      <div className="absolute inset-3 border-2 border-amber-300 pointer-events-none" />

      {/* Background pattern — subtle diagonal lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #000 0px, #000 1px, transparent 0px, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Corner ornaments */}
      {["top-5 left-5", "top-5 right-5", "bottom-5 left-5", "bottom-5 right-5"].map((pos) => (
        <div key={pos} className={`absolute ${pos} text-amber-300 text-2xl leading-none pointer-events-none`}>✦</div>
      ))}

      <div className="relative z-10 px-16 py-12 text-center">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-1">
          <Award className="w-6 h-6 text-amber-500" />
          <p className="text-[11px] font-sans font-semibold tracking-[0.3em] text-amber-600 uppercase">
            Certificate of Completion
          </p>
          <Award className="w-6 h-6 text-amber-500" />
        </div>

        <div className="my-3 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

        {/* This is to certify */}
        <p className="text-xs font-sans text-gray-400 tracking-widest uppercase mb-4 mt-2">
          This is to certify that
        </p>

        {/* Learner name */}
        <p
          className="text-4xl font-bold text-gray-800 mb-1 leading-tight"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {name}
        </p>
        <div className="my-3 h-px w-48 mx-auto bg-amber-200" />

        <p className="text-xs font-sans text-gray-400 tracking-widest uppercase mt-4 mb-2">
          has successfully completed
        </p>

        {/* Language icon + topic */}
        <div className="flex items-center justify-center gap-3 my-3">
          <span className="text-3xl">{meta.icon}</span>
          <div>
            <p className="text-2xl font-bold text-gray-800" style={{ color: meta.accent }}>
              {cert.topic}
            </p>
          </div>
        </div>

        <p className="text-xs font-sans text-gray-400 tracking-widest uppercase mt-4 mb-2">
          covering all five levels of progression
        </p>

        {/* Level chips */}
        <div className="flex items-center justify-center gap-2 mt-2 mb-6">
          {["Fundamentals", "Introduction", "Hands-on", "Deep Dive", "Challenge"].map((lvl) => (
            <span
              key={lvl}
              className="text-[9px] font-sans font-semibold px-2 py-0.5 rounded-full border"
              style={{ borderColor: meta.accent + "60", color: meta.accent, backgroundColor: meta.accent + "15" }}
            >
              {lvl}
            </span>
          ))}
        </div>

        <div className="my-3 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />

        {/* Footer row */}
        <div className="flex items-end justify-between mt-5 px-4">
          <div className="text-left">
            <p className="text-xs font-sans text-gray-400 mb-1">Issued on</p>
            <p className="text-sm font-bold text-gray-700 font-sans">{formatDate(cert.issuedAt)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <div className="w-5 h-5 rounded bg-gray-800 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold font-sans">&lt;/&gt;</span>
              </div>
              <span className="text-sm font-bold text-gray-800 font-sans tracking-tight">Companion</span>
            </div>
            <p className="text-[9px] font-sans text-gray-400 mt-0.5">Learning Companion Bot</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-sans text-gray-400 mb-1">Certificate ID</p>
            <p className="text-[10px] font-mono text-gray-500">{cert.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
interface CertificateModalProps {
  cert: CertificateRecord;
  shareUrl: string;
  onClose: () => void;
  onNameSave?: (name: string) => void;
}

export function CertificateModal({ cert, shareUrl, onClose, onNameSave }: CertificateModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [editingName, setEditingName] = useState(!cert.userName || cert.userName === "Learner");
  const [nameInput, setNameInput] = useState(cert.userName === "Learner" ? "" : cert.userName);
  const [confirmedName, setConfirmedName] = useState(cert.userName === "Learner" ? "" : cert.userName);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [shareUrl]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `${cert.topic.replace(/\s+/g, "-")}-certificate.png`;
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Failed to create certificate image.");
      link.href = URL.createObjectURL(blob);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (e) {
      console.error("Download failed", e);
    } finally {
      setDownloading(false);
    }
  }, [cert.topic]);

  const handleNameConfirm = () => {
    const trimmed = nameInput.trim() || "Learner";
    setConfirmedName(trimmed);
    setEditingName(false);
    onNameSave?.(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-border">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-sm">Your Certificate</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name entry — shown first time */}
        {editingName && (
          <div className="px-5 py-4 bg-amber-500/5 border-b border-amber-500/20">
            <p className="text-sm font-medium mb-2 text-foreground">What name should appear on the certificate?</p>
            <div className="flex gap-2">
              <Input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="flex-1 text-sm"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleNameConfirm(); }}
              />
              <Button size="sm" onClick={handleNameConfirm} className="shrink-0">
                Add to certificate
              </Button>
            </div>
          </div>
        )}

        {/* Certificate preview */}
        <div className="p-5 bg-gray-50 dark:bg-muted/30">
          <div ref={cardRef} className="rounded-lg overflow-hidden shadow-lg">
            <CertificateCard cert={cert} nameOverride={confirmedName || undefined} />
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-border flex items-center gap-3 flex-wrap">
          {!editingName && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground underline"
              onClick={() => setEditingName(true)}
            >
              Change name
            </button>
          )}
          <div className="flex-1" />

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCopyLink}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Link2 className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy link"}
          </Button>

          <Button
            size="sm"
            className="gap-2"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Downloading…" : "Download PNG"}
          </Button>
        </div>
      </div>
    </div>
  );
}
