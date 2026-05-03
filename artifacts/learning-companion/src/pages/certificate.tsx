import { useRef, useState, useCallback } from "react";
import { useParams } from "wouter";
import { Award, Download, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCertificate } from "@workspace/api-client-react";
import type { CertificateRecord } from "@workspace/api-client-react";
import certBrand from "@assets/neural-network_1777789423317.png";

// ---------------------------------------------------------------------------
// Language meta
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
    year: "numeric", month: "long", day: "numeric",
  });
}

function CertificateCard({ cert }: { cert: CertificateRecord }) {
  const meta = LANG_META[cert.language] ?? { label: cert.language, icon: "💻", accent: "#6366f1" };

  return (
    <div
      id="certificate-card"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      className="relative w-full bg-white overflow-hidden select-none"
    >
      <div className="absolute inset-0 border-[12px] border-amber-200 pointer-events-none" />
      <div className="absolute inset-3 border-2 border-amber-300 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #000 0px, #000 1px, transparent 0px, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />
      {["top-5 left-5", "top-5 right-5", "bottom-5 left-5", "bottom-5 right-5"].map((pos) => (
        <div key={pos} className={`absolute ${pos} text-amber-300 text-2xl leading-none pointer-events-none`}>✦</div>
      ))}

      <div className="relative z-10 px-16 py-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-1">
          <Award className="w-6 h-6 text-amber-500" />
          <p className="text-[11px] font-sans font-semibold tracking-[0.3em] text-amber-600 uppercase">
            Certificate of Completion
          </p>
          <Award className="w-6 h-6 text-amber-500" />
        </div>
        <div className="my-3 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <p className="text-xs font-sans text-gray-400 tracking-widest uppercase mb-4 mt-2">This is to certify that</p>
        <p className="text-4xl font-bold text-gray-800 mb-1 leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
          {cert.userName}
        </p>
        <div className="my-3 h-px w-48 mx-auto bg-amber-200" />
        <p className="text-xs font-sans text-gray-400 tracking-widest uppercase mt-4 mb-2">has successfully completed</p>
        <div className="flex items-center justify-center gap-3 my-3">
          <span className="text-3xl">{meta.icon}</span>
          <p className="text-2xl font-bold" style={{ color: meta.accent }}>{cert.topic}</p>
        </div>
        <p className="text-xs font-sans text-gray-400 tracking-widest uppercase mt-4 mb-2">
          covering all five levels of progression
        </p>
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
        <div className="flex items-end justify-between mt-5 px-4">
          <div className="text-left">
            <p className="text-xs font-sans text-gray-400 mb-1">Issued on</p>
            <p className="text-sm font-bold text-gray-700 font-sans">{formatDate(cert.issuedAt)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center">
              <div className="w-5 h-5 rounded bg-white flex items-center justify-center overflow-hidden border border-amber-100 shadow-sm">
                <img src={certBrand} alt="Companion" className="w-3.5 h-3.5 object-contain" />
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

export function CertificatePage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: cert, isLoading, isError } = useGetCertificate(id, {
    query: { enabled: !!id, staleTime: 300_000 },
  });

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !cert) return;
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
  }, [cert]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8">
        <Skeleton className="w-full max-w-2xl h-80 rounded-xl" />
        <Skeleton className="w-48 h-9 rounded-lg" />
      </div>
    );
  }

  if (isError || !cert) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive">
          <AlertCircle className="w-8 h-8" />
        </div>
        <p className="font-semibold">Certificate not found</p>
        <p className="text-sm text-muted-foreground">This certificate link may be invalid or expired.</p>
        <Button variant="outline" size="sm" onClick={() => history.back()}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Go back
        </Button>
      </div>
    );
  }

  const meta = LANG_META[cert.language] ?? { label: cert.language, icon: "💻", accent: "#6366f1" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-950 dark:to-zinc-900 flex flex-col">
      {/* Top nav */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-amber-200/50 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">&lt;/&gt;</span>
          </div>
          <span className="font-semibold tracking-tight">Companion</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.icon}</span>
          <span className="text-sm font-medium text-muted-foreground">{cert.topic}</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Award className="w-5 h-5 text-amber-500" />
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Achievement Unlocked</p>
          </div>
          <p className="text-muted-foreground text-sm">
            <strong className="text-foreground">{cert.userName}</strong> completed all 5 levels of {cert.topic}
          </p>
        </div>

        {/* Certificate */}
        <div ref={cardRef} className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl">
          <CertificateCard cert={cert} />
        </div>

        {/* Download button */}
        <Button onClick={handleDownload} disabled={downloading} className="gap-2" size="lg">
          <Download className="w-4 h-4" />
          {downloading ? "Generating…" : "Download Certificate"}
        </Button>

        <p className="text-xs text-muted-foreground">
          Certificate ID: <span className="font-mono">{cert.id.slice(0, 8).toUpperCase()}</span>
          {" · "}Issued {formatDate(cert.issuedAt)}
        </p>
      </main>
    </div>
  );
}
