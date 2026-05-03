import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4"/>
      <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
      <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4069 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
      <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9254L15.0218 2.344C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.9582L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335"/>
    </svg>
  );
}

export function SignIn() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#09090b] px-4 relative overflow-hidden">

      {/* Subtle radial glow behind the card */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      {/* Heading */}
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-4"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
          Build projects,<br />learn coding faster
        </h1>
        <p className="text-[#a1a1aa] text-base sm:text-lg font-normal tracking-wide">
          Your AI-powered learning companion
        </p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px]">
        <div className="bg-[#131314] border border-white/[0.08] rounded-2xl p-7 shadow-2xl shadow-black/60">

          {/* Google Button */}
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-[#1e1e20] hover:bg-[#28282a] border border-white/[0.12] text-white text-[15px] font-medium rounded-xl px-4 py-3.5 transition-all duration-150 hover:border-white/20 active:scale-[0.99] group"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[#52525b] text-xs font-medium tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Email Input */}
          <div className="mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-[#1e1e20] border border-white/[0.10] text-white placeholder-[#52525b] text-[15px] rounded-xl px-4 py-3.5 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-all duration-150 caret-white"
              onKeyDown={(e) => { if (e.key === "Enter") login(); }}
            />
          </div>

          {/* Continue with email Button */}
          <button
            onClick={login}
            className="w-full flex items-center justify-center bg-white hover:bg-[#f4f4f5] text-[#09090b] text-[15px] font-semibold rounded-xl px-4 py-3.5 transition-all duration-150 active:scale-[0.99] shadow-sm"
          >
            Continue with email
          </button>

          {/* Terms */}
          <p className="text-[#52525b] text-xs text-center mt-5 leading-relaxed">
            By continuing, you agree to our{" "}
            <span className="text-[#a1a1aa] hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            {" "}and{" "}
            <span className="text-[#a1a1aa] hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          </p>
        </div>

        {/* Sign up prompt */}
        <p className="text-center text-[#52525b] text-sm mt-5">
          Don't have an account?{" "}
          <button onClick={login} className="text-[#a1a1aa] hover:text-white transition-colors font-medium">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
