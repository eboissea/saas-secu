"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Terminal, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(
        searchParams.get("mode") === "signup"
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [typedText, setTypedText] = useState("");
    const router = useRouter();

    const terminalLines = isSignUp
        ? "// REGISTER_NEW_ACCOUNT\n> AUTHORIZATION_REQUIRED"
        : "// USER_AUTHENTICATION\n> SYSTEM_ACCESS_RESTRICTED";

    useEffect(() => {
        setTypedText("");
        let i = 0;
        const interval = setInterval(() => {
            if (i < terminalLines.length) {
                setTypedText(terminalLines.slice(0, i + 1));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 25);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignUp]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        const supabase = createClient();

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: `${window.location.origin}/dashboard` },
            });
            if (error) setError(error.message);
            else
                setMessage(
                    "[ ACCESS_REQUEST_SENT ] — Vérifiez votre email pour confirmer."
                );
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) setError(error.message);
            else {
                router.push("/dashboard");
                router.refresh();
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050a0e] text-white font-mono flex overflow-hidden">
            {/* Scanline */}
            <div
                className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.15) 2px, rgba(0,255,136,0.15) 4px)",
                }}
            />

            {/* LEFT PANEL — Visual / Branding */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 relative border-r border-[#00ff88]/10 overflow-hidden">
                {/* Hex grid */}
                <div
                    className="absolute inset-0 opacity-15"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.3V34.7L30 52L0 34.7V17.3L30 0Z' fill='none' stroke='%2300ff88' stroke-width='0.5'/%3E%3C/svg%3E")`,
                        backgroundSize: "60px 52px",
                    }}
                />
                {/* Scanning beam */}
                <div
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff88]/60 to-transparent"
                    style={{ animation: "scan 4s linear infinite", top: "10%" }}
                />
                {/* Glows */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00ff88]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#0066ff]/10 rounded-full blur-3xl" />

                <div className="relative z-10 p-10">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-8 h-8 border border-[#00ff88] flex items-center justify-center">
                            <Shield className="h-4 w-4 text-[#00ff88]" />
                        </div>
                        <span>
                            <span className="text-[#00ff88] font-black tracking-widest text-sm">
                                SECU
                            </span>
                            <span className="text-white font-black tracking-widest text-sm">
                                SCAN
                            </span>
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 p-10">
                    <p className="text-[#00ff88]/40 text-xs mb-2">{"// SCANNING_ACTIVE"}</p>
                    <h2 className="text-4xl font-black tracking-tight leading-tight mb-4">
                        IDENTIFY
                        <br />
                        <span className="text-[#00ff88]">VULNERABILITIES</span>
                        <br />
                        BEFORE THEY DO.
                    </h2>
                    <p className="text-[#8899aa] text-xs leading-relaxed max-w-xs">
                        Plateforme d&apos;audit de cybersécurité automatisée. Scannez, détectez, corrigez.
                    </p>
                </div>

                <div className="relative z-10 p-10">
                    <div className="border border-[#00ff88]/20 bg-black/40 p-4 text-xs space-y-1">
                        <p className="text-[#00ff88]/60">[ LIVE_THREAT_FEED ]</p>
                        <p className="text-[#8899aa]">
                            <span className="text-yellow-400">[!]</span> XSS detected @ /api/search
                        </p>
                        <p className="text-[#8899aa]">
                            <span className="text-red-400">[✗]</span> SQL injection attempt blocked
                        </p>
                        <p className="text-[#8899aa]">
                            <span className="text-[#00ff88]">[✓]</span> HTTPS enforced
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
                            <span className="text-[#00ff88]/60">SYSTEM_ONLINE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL — Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative z-20">
                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <Link href="/" className="lg:hidden inline-flex items-center gap-2 mb-8">
                        <div className="w-7 h-7 border border-[#00ff88] flex items-center justify-center">
                            <Shield className="h-3 w-3 text-[#00ff88]" />
                        </div>
                        <span className="text-[#00ff88] font-black tracking-widest text-sm">SECU</span>
                        <span className="text-white font-black tracking-widest text-sm">SCAN</span>
                    </Link>

                    {/* Terminal header */}
                    <div className="border border-[#00ff88]/30 bg-black/60 backdrop-blur">
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#00ff88]/20 bg-[#00ff88]/5">
                            <Terminal className="h-3 w-3 text-[#00ff88]" />
                            <span className="text-[#00ff88]/60 text-xs">auth.terminal</span>
                            <div className="ml-auto flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]/60" />
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="text-[#00ff88] text-xs mb-6 min-h-[2.5rem]">
                                <pre className="whitespace-pre">{typedText}<span className="animate-pulse">_</span></pre>
                            </div>

                            {/* Mode toggle tabs */}
                            <div className="flex mb-6 gap-2">
                                <button
                                    onClick={() => { setIsSignUp(false); setError(null); setMessage(null); }}
                                    className={`flex-1 py-2.5 text-xs font-black tracking-widest transition-all border ${!isSignUp
                                            ? "bg-[#00ff88] text-black border-[#00ff88]"
                                            : "text-[#8899aa] border-white/10 hover:border-[#00ff88]/40 hover:text-[#00ff88]"
                                        }`}
                                >
                                    CONNECT_
                                </button>
                                <button
                                    onClick={() => { setIsSignUp(true); setError(null); setMessage(null); }}
                                    className={`flex-1 py-2.5 text-xs font-black tracking-widest transition-all border ${isSignUp
                                            ? "bg-[#00ff88] text-black border-[#00ff88]"
                                            : "text-[#00ff88] border-[#00ff88]/50 bg-[#00ff88]/5 hover:bg-[#00ff88]/15 hover:border-[#00ff88]"
                                        }`}
                                >
                                    S&apos;INSCRIRE ↗
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-[#00ff88]/50 text-xs tracking-widest block mb-1">
                                        [ _EMAIL ]
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="operator@domain.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-black/40 border border-[#00ff88]/20 focus:border-[#00ff88] outline-none px-3 py-2.5 text-white text-xs placeholder:text-[#8899aa]/40 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-[#00ff88]/50 text-xs tracking-widest block mb-1">
                                        [ _PASSWORD ]
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full bg-black/40 border border-[#00ff88]/20 focus:border-[#00ff88] outline-none px-3 py-2.5 text-white text-xs placeholder:text-[#8899aa]/40 transition-colors pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00ff88]/30 hover:text-[#00ff88] transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="border border-red-500/30 bg-red-500/5 px-3 py-2 text-red-400 text-xs">
                                        <span className="text-red-500">[ERROR]</span> {error}
                                    </div>
                                )}
                                {message && (
                                    <div className="border border-[#00ff88]/30 bg-[#00ff88]/5 px-3 py-2 text-[#00ff88] text-xs">
                                        {message}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-[#00ff88] text-black text-xs font-black tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                                    {loading
                                        ? "PROCESSING_"
                                        : isSignUp
                                            ? "CREATE_ACCOUNT_"
                                            : "INITIATE_SESSION_"}
                                </button>
                            </form>

                            <div className="mt-5 text-center">
                                <button
                                    type="button"
                                    onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                                    className="text-xs text-[#8899aa] hover:text-[#00ff88] transition-colors underline underline-offset-4"
                                >
                                    {isSignUp
                                        ? "Déjà un compte ? → CONNECT_"
                                        : "Pas encore de compte ? → S'INSCRIRE"}
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-[#00ff88]/10 text-[#8899aa]/40 text-xs">
                                <span>[ SYS ] AES-256 | TLS 1.3 | GDPR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
