"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Loader2, Eye, EyeOff, ArrowLeft, Lock, UserPlus } from "lucide-react";
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
    const router = useRouter();

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
                    "Compte créé ! Vérifiez votre email pour confirmer votre inscription."
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
        <div
            className="min-h-screen flex"
            style={{ background: "var(--astra-bg)" }}
        >
            {/* LEFT: Branding panel */}
            <div
                className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden border-r"
                style={{ borderColor: "var(--astra-border)" }}
            >
                {/* Background gradient mesh */}
                <div className="absolute inset-0">
                    <div
                        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-25"
                        style={{
                            background: "radial-gradient(circle, var(--astra-primary), transparent 70%)",
                            top: "20%",
                            left: "20%",
                            animation: "floatOrb 20s ease-in-out infinite",
                        }}
                    />
                    <div
                        className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
                        style={{
                            background: "radial-gradient(circle, var(--astra-blue), transparent 70%)",
                            bottom: "20%",
                            right: "10%",
                            animation: "floatOrb 25s ease-in-out infinite reverse",
                        }}
                    />
                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: `linear-gradient(var(--astra-text-muted) 1px, transparent 1px),
                                linear-gradient(90deg, var(--astra-text-muted) 1px, transparent 1px)`,
                            backgroundSize: "60px 60px",
                        }}
                    />
                </div>

                {/* Logo top */}
                <div className="relative z-10 p-8">
                    <Link href="/" className="inline-flex items-center gap-2.5">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))",
                            }}
                        >
                            <Shield className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            <span style={{ color: "var(--astra-text)" }}>Secu</span>
                            <span style={{ color: "var(--astra-primary)" }}>Scan</span>
                        </span>
                    </Link>
                </div>

                {/* Center content */}
                <div className="relative z-10 px-12">
                    <h2
                        className="text-4xl font-extrabold tracking-tight leading-tight mb-4"
                        style={{ color: "var(--astra-text)" }}
                    >
                        Identifiez les
                        <br />
                        <span
                            className="bg-clip-text text-transparent"
                            style={{
                                backgroundImage: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))",
                            }}
                        >
                            vulnérabilités
                        </span>
                        <br />
                        avant les attaquants.
                    </h2>
                    <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--astra-text-secondary)" }}>
                        Plateforme d&apos;audit de cybersécurité automatisée.
                        Scannez, détectez, corrigez — en toute confiance.
                    </p>
                </div>

                {/* Bottom stats */}
                <div className="relative z-10 p-8">
                    <div
                        className="rounded-xl p-5"
                        style={{
                            background: "rgba(17, 24, 39, 0.6)",
                            border: "1px solid var(--astra-border)",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { value: "10K+", label: "Scans" },
                                { value: "99.9%", label: "Uptime" },
                                { value: "< 60s", label: "Scan time" },
                            ].map((s) => (
                                <div key={s.label} className="text-center">
                                    <p className="text-xl font-bold" style={{ color: "var(--astra-text)" }}>
                                        {s.value}
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--astra-text-muted)" }}>
                                        {s.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Login form */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
                {/* Mobile back link */}
                <Link
                    href="/"
                    className="absolute top-6 left-6 flex items-center gap-2 text-sm transition-colors"
                    style={{ color: "var(--astra-text-muted)" }}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                </Link>

                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-8">
                        <Link href="/" className="inline-flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))",
                                }}
                            >
                                <Shield className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                <span style={{ color: "var(--astra-text)" }}>Secu</span>
                                <span style={{ color: "var(--astra-primary)" }}>Scan</span>
                            </span>
                        </Link>
                    </div>

                    <h1
                        className="text-2xl font-bold tracking-tight mb-1"
                        style={{ color: "var(--astra-text)" }}
                    >
                        {isSignUp ? "Créer un compte" : "Bienvenue"}
                    </h1>
                    <p className="text-sm mb-8" style={{ color: "var(--astra-text-muted)" }}>
                        {isSignUp
                            ? "Commencez à sécuriser vos applications dès maintenant."
                            : "Connectez-vous pour accéder à votre dashboard."}
                    </p>

                    {/* Mode toggle */}
                    <div
                        className="flex rounded-lg p-1 mb-6"
                        style={{
                            background: "var(--astra-surface)",
                            border: "1px solid var(--astra-border)",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(false); setError(null); setMessage(null); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all"
                            style={{
                                background: !isSignUp
                                    ? "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))"
                                    : "transparent",
                                color: !isSignUp ? "white" : "var(--astra-text-muted)",
                            }}
                        >
                            <Lock className="h-3.5 w-3.5" />
                            Connexion
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(true); setError(null); setMessage(null); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all"
                            style={{
                                background: isSignUp
                                    ? "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))"
                                    : "transparent",
                                color: isSignUp ? "white" : "var(--astra-text-muted)",
                            }}
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            Inscription
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                className="text-xs font-medium block mb-1.5"
                                style={{ color: "var(--astra-text-secondary)" }}
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="nom@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all"
                                style={{
                                    background: "var(--astra-surface)",
                                    border: "1px solid var(--astra-border)",
                                    color: "var(--astra-text)",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "var(--astra-primary)")}
                                onBlur={(e) => (e.target.style.borderColor = "var(--astra-border)")}
                            />
                        </div>
                        <div>
                            <label
                                className="text-xs font-medium block mb-1.5"
                                style={{ color: "var(--astra-text-secondary)" }}
                            >
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-all pr-10"
                                    style={{
                                        background: "var(--astra-surface)",
                                        border: "1px solid var(--astra-border)",
                                        color: "var(--astra-text)",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "var(--astra-primary)")}
                                    onBlur={(e) => (e.target.style.borderColor = "var(--astra-border)")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: "var(--astra-text-muted)" }}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div
                                className="rounded-lg px-4 py-3 text-sm"
                                style={{
                                    background: "var(--astra-critical-muted)",
                                    border: "1px solid rgba(239, 68, 68, 0.2)",
                                    color: "var(--astra-critical)",
                                }}
                            >
                                {error}
                            </div>
                        )}
                        {message && (
                            <div
                                className="rounded-lg px-4 py-3 text-sm"
                                style={{
                                    background: "var(--astra-success-muted)",
                                    border: "1px solid rgba(34, 197, 94, 0.2)",
                                    color: "var(--astra-success)",
                                }}
                            >
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-lg font-semibold text-sm text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{
                                background: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))",
                            }}
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading
                                ? "Chargement..."
                                : isSignUp
                                    ? "Créer mon compte"
                                    : "Se connecter"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null); }}
                            className="text-sm transition-colors"
                            style={{ color: "var(--astra-text-muted)" }}
                        >
                            {isSignUp
                                ? "Déjà un compte ? "
                                : "Pas encore de compte ? "}
                            <span style={{ color: "var(--astra-primary)" }} className="font-medium">
                                {isSignUp ? "Se connecter" : "S'inscrire"}
                            </span>
                        </button>
                    </div>

                    <div
                        className="mt-8 pt-6 flex items-center justify-center gap-4 text-xs border-t"
                        style={{
                            borderColor: "var(--astra-border)",
                            color: "var(--astra-text-muted)",
                        }}
                    >
                        <span>AES-256</span>
                        <span>•</span>
                        <span>TLS 1.3</span>
                        <span>•</span>
                        <span>GDPR</span>
                    </div>
                </div>
            </div>
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
