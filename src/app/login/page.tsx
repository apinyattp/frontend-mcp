"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoIcon, UsersIcon, BookIcon, ShieldIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type?: string;
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
            },
          ) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && user) router.push("/groups");
  }, [isLoading, user, router]);

  // Load Google Identity Services
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });
      if (googleBtnRef.current) {
        window.google?.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: 340,
          text: "continue_with",
          shape: "pill",
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCredentialResponse(response: { credential: string }) {
    setError("");
    setSigningIn(true);
    try {
      await login(response.credential);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSigningIn(false);
    }
  }

  // Fallback handler for when GSI is not configured
  async function handleFallbackSignIn() {
    setError("");
    setSigningIn(true);
    try {
      await login("dev-mode");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSigningIn(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const gsiConfigured =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== "your-google-client-id-here";

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] bg-[radial-gradient(circle,rgba(108,92,231,0.15),transparent_70%)] -top-[10%] -left-[5%] animate-[drift_20s_ease-in-out_infinite]" />
        <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] bg-[radial-gradient(circle,rgba(45,135,255,0.1),transparent_70%)] -bottom-[15%] -right-[10%] animate-[drift_20s_ease-in-out_infinite_-7s]" />
        <div className="absolute w-[300px] h-[300px] rounded-full blur-[100px] bg-[radial-gradient(circle,rgba(232,90,150,0.08),transparent_70%)] top-1/2 left-[60%] animate-[drift_20s_ease-in-out_infinite_-14s]" />
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[length:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 p-10 animate-[fadeUp_0.8s_ease-out]">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-[72px] h-[72px] bg-gradient-to-br from-accent to-[#4834d4] rounded-[20px] flex items-center justify-center shadow-[0_8px_40px_var(--color-accent-glow),inset_0_1px_0_rgba(255,255,255,0.15)] animate-[float_6s_ease-in-out_infinite]">
            <LogoIcon className="w-9 h-9 text-white" />
          </div>
          <h1 className="font-serif text-[2rem] font-medium tracking-[-0.02em] bg-gradient-to-br from-text-primary to-text-secondary bg-clip-text text-transparent">
            KnowledgeHub
          </h1>
          <p className="text-text-secondary text-[0.95rem] font-light tracking-[0.02em]">
            Team knowledge, organized.
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-surface border border-border rounded-[24px] p-12 px-11 w-full max-w-[420px] backdrop-blur-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)] animate-[fadeUp_0.8s_ease-out_0.15s_both]">
          <h2 className="font-serif text-[1.5rem] font-medium text-center mb-2">
            Welcome back
          </h2>
          <p className="text-text-secondary text-[0.88rem] text-center mb-9 leading-relaxed">
            Sign in with your organization&apos;s Google account to access your
            team&apos;s knowledge base.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-[10px] bg-danger/10 border border-danger/20 text-danger text-[0.85rem] text-center">
              {error}
            </div>
          )}

          {/* Google Sign-In button */}
          {gsiConfigured ? (
            <div ref={googleBtnRef} className="flex justify-center" />
          ) : (
            <button
              onClick={handleFallbackSignIn}
              disabled={signingIn}
              className="flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-white rounded-[14px] text-[0.95rem] font-medium text-[#3c4043] cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3),0_2px_8px_rgba(66,133,244,0.2)] active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
            >
              {signingIn ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              <span>{signingIn ? "Signing in..." : "Continue with Google"}</span>
            </button>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-secondary text-[0.75rem] uppercase tracking-[0.1em]">
              what you get
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-[10px] bg-white/[0.02] border border-white/[0.03] hover:bg-accent/5 hover:border-accent/10 transition-all">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <UsersIcon className="w-4 h-4 text-accent" />
              </div>
              <div className="text-[0.82rem] text-text-secondary leading-snug">
                <strong className="text-text-primary font-medium">Team Groups</strong> —
                Organize members into collaborative workspaces
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-[10px] bg-white/[0.02] border border-white/[0.03] hover:bg-accent/5 hover:border-accent/10 transition-all">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <BookIcon className="w-4 h-4 text-accent" />
              </div>
              <div className="text-[0.82rem] text-text-secondary leading-snug">
                <strong className="text-text-primary font-medium">Knowledge Bases</strong>{" "}
                — Create & share team knowledge within groups
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 px-3.5 rounded-[10px] bg-white/[0.02] border border-white/[0.03] hover:bg-accent/5 hover:border-accent/10 transition-all">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <ShieldIcon className="w-4 h-4 text-accent" />
              </div>
              <div className="text-[0.82rem] text-text-secondary leading-snug">
                <strong className="text-text-primary font-medium">Role-based Access</strong>{" "}
                — Admin & user permissions per group
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-text-secondary text-[0.78rem] text-center leading-relaxed animate-[fadeUp_0.8s_ease-out_0.3s_both]">
          By signing in, you agree to our{" "}
          <a href="#" className="text-accent hover:text-accent-light transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-accent hover:text-accent-light transition-colors">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
