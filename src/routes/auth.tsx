import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Sparkles, Mail, Lock, User as UserIcon, Brain, BookOpen, MessageCircle, Flame, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { LandingPreview } from "@/components/LandingPreview";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [view, setView] = useState<"welcome" | "form">("welcome");
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Welcome to MoyMoy! 💜");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
      setBusy(false);
    }
  };

  return (
    <div className="landing-stage relative min-h-screen overflow-hidden flex flex-col">
      {/* Atmospheric background */}
      <div className="landing-bg" aria-hidden />
      <div className="landing-grain" aria-hidden />
      {/* Particle dots */}
      <div className="landing-particles" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className={`particle p-${i}`} />
        ))}
      </div>

      {view === "welcome" ? <WelcomeView onStart={() => setView("form")} /> : (
        <FormView
          mode={mode}
          setMode={setMode}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          busy={busy}
          onSubmit={onSubmit}
          onGoogle={onGoogle}
          onBack={() => setView("welcome")}
        />
      )}
    </div>
  );
}

function WelcomeView({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative z-10 flex-1 flex flex-col px-6 pt-10 pb-8 max-w-md mx-auto w-full">
      {/* Brand mark */}
      <div className="flex items-center gap-2 fade-up fade-up-1">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur">
          <Sparkles className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-white/90 font-semibold tracking-tight">MoyMoy</span>
      </div>

      {/* 3D floating icon scene */}
      <div className="relative flex-1 grid place-items-center my-6">
        <div className="floating-scene">
          {/* Soft glow */}
          <div className="scene-glow" aria-hidden />

          {/* Tiny orbit dots */}
          <span className="orbit-dot od-1" />
          <span className="orbit-dot od-2" />
          <span className="orbit-dot od-3" />
          <span className="orbit-dot od-4" />
          <span className="orbit-dash od-d1" />
          <span className="orbit-dash od-d2" />
          <span className="orbit-dash od-d3" />

          <FloatIcon className="fi fi-1" delay="0s">
            <Brain className="h-7 w-7 text-white" strokeWidth={1.8} />
          </FloatIcon>
          <FloatIcon className="fi fi-2" delay="-2s" big>
            <Sparkles className="h-9 w-9 text-white" strokeWidth={1.8} />
          </FloatIcon>
          <FloatIcon className="fi fi-3" delay="-4s">
            <BookOpen className="h-7 w-7 text-white" strokeWidth={1.8} />
          </FloatIcon>
          <FloatIcon className="fi fi-4" delay="-1s">
            <MessageCircle className="h-6 w-6 text-white" strokeWidth={1.8} />
          </FloatIcon>
          <FloatIcon className="fi fi-5" delay="-3s">
            <Flame className="h-6 w-6 text-white" strokeWidth={1.8} />
          </FloatIcon>
        </div>
      </div>

      {/* Copy */}
      <div className="text-center fade-up fade-up-3">
        <h1 className="text-[40px] leading-[1.05] font-bold tracking-tight text-white">
          Study smarter,<br />
          <span className="landing-gradient-text">feel lighter.</span>
        </h1>
        <p className="mt-4 text-[15px] text-white/65 max-w-xs mx-auto">
          Your AI companion for notes, flashcards, and focused study sessions.
        </p>
      </div>

      {/* CTAs */}
      <div className="mt-7 space-y-3 fade-up fade-up-4">
        <button
          onClick={onStart}
          className="w-full rounded-full bg-white text-[#0b0612] font-semibold py-4 text-[15px] tap-scale shadow-[0_10px_40px_rgba(255,255,255,0.18)] hover:shadow-[0_14px_50px_rgba(255,255,255,0.28)] transition-shadow"
        >
          Get started
        </button>
        <button
          onClick={onStart}
          className="w-full rounded-full bg-white/8 border border-white/15 text-white font-medium py-4 text-[15px] tap-scale backdrop-blur"
        >
          I already have an account
        </button>
        <p className="text-center text-[11px] text-white/40 pt-2">
          By continuing you agree to our Terms & Privacy.
        </p>
      </div>
    </div>
  );
}

function FloatIcon({
  className, children, delay, big,
}: { className: string; children: React.ReactNode; delay: string; big?: boolean }) {
  return (
    <div
      className={`float-icon ${big ? "float-icon-lg" : ""} ${className}`}
      style={{ animationDelay: delay }}
    >
      <div className="float-icon-inner">
        <div className="float-icon-shine" />
        {children}
      </div>
    </div>
  );
}

function FormView(props: {
  mode: "signin" | "signup";
  setMode: (m: "signin" | "signup") => void;
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  busy: boolean;
  onSubmit: (e: FormEvent) => void;
  onGoogle: () => void;
  onBack: () => void;
}) {
  const { mode, setMode, name, setName, email, setEmail, password, setPassword, busy, onSubmit, onGoogle, onBack } = props;
  return (
    <div className="relative z-10 flex-1 flex flex-col px-6 pt-6 pb-8 max-w-md mx-auto w-full animate-route-in">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-6 tap-scale"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-white/60 mt-1.5">
          {mode === "signin" ? "Pick up where you left off ✨" : "Start your study journey today 💜"}
        </p>
      </div>

      <div className="rounded-3xl bg-white/8 border border-white/15 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex rounded-full bg-white/8 p-1 mb-5 border border-white/10">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${mode === "signin" ? "bg-white text-[#0b0612]" : "text-white/70"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition ${mode === "signup" ? "bg-white text-[#0b0612]" : "text-white/70"}`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <DarkField icon={<UserIcon className="h-4 w-4" />}>
              <input
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/40"
              />
            </DarkField>
          )}
          <DarkField icon={<Mail className="h-4 w-4" />}>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/40"
            />
          </DarkField>
          <DarkField icon={<Lock className="h-4 w-4" />}>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/40"
            />
          </DarkField>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-white text-[#0b0612] font-semibold py-3.5 mt-2 tap-scale disabled:opacity-60 shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-white/40">
          <div className="h-px flex-1 bg-white/15" />
          or
          <div className="h-px flex-1 bg-white/15" />
        </div>

        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className="w-full rounded-full bg-white/8 border border-white/15 text-white py-3 text-sm font-semibold tap-scale flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-white/12 transition"
        >
          <GoogleIcon /> Continue with Google
        </button>
      </div>
    </div>
  );
}

function DarkField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 focus-within:ring-2 focus-within:ring-white/30 focus-within:border-white/25 transition">
      <span className="text-white/50">{icon}</span>
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.32z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
