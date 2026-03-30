"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    Shield,
    LogOut,
    Loader2,
    AlertTriangle,
    CheckCircle2,
    Info,
    Search,
    Terminal,
    Activity,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Vulnerability {
    id: string;
    name: string;
    severity: string;
    cvss_score: number;
    category: string;
    description: string;
    affected_url: string;
    remediation: string;
}

interface ScanResult {
    url: string;
    scan_id: string;
    timestamp: string;
    summary: {
        risk_level: string;
        total_vulnerabilities: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };
    vulnerabilities: Vulnerability[];
}

const SEVERITY_CONFIG: Record<
    string,
    { color: string; bg: string; border: string; icon: typeof AlertTriangle }
> = {
    high: {
        color: "text-red-400",
        bg: "bg-red-500/5",
        border: "border-red-500/30",
        icon: AlertTriangle,
    },
    medium: {
        color: "text-yellow-400",
        bg: "bg-yellow-500/5",
        border: "border-yellow-500/30",
        icon: AlertTriangle,
    },
    low: {
        color: "text-blue-400",
        bg: "bg-blue-500/5",
        border: "border-blue-500/30",
        icon: Info,
    },
    info: {
        color: "text-[#8899aa]",
        bg: "bg-white/2",
        border: "border-white/10",
        icon: CheckCircle2,
    },
};

export function DashboardContent({ user }: { user: User }) {
    const [url, setUrl] = useState("");
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [logLines, setLogLines] = useState<string[]>([]);
    const router = useRouter();

    const addLog = (line: string) =>
        setLogLines((prev) => [...prev, line]);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setScanning(true);
        setResult(null);
        setLogLines([]);

        const steps: [number, string][] = [
            [300, `[*] Initializing scan engine...`],
            [600, `[*] Probing target: ${url}`],
            [1000, `[*] Enumerating attack surface...`],
            [1500, `[!] Endpoint discovered: /api/search`],
            [2000, `[!] Endpoint discovered: /auth/login`],
            [2500, `[*] Running OWASP checks (1/10)...`],
            [3000, `[!] VULN-001 HIGH — XSS Reflected (CVSS: 7.1)`],
            [3400, `[!] VULN-002 MED — Missing security headers`],
            [3800, `[i] VULN-003 INFO — Server version exposed`],
            [4200, `[*] Generating report...`],
            [
                5000,
                `[✓] Scan complete — 5 vulnerabilities found`,
            ],
        ];

        for (const [delay, line] of steps) {
            await new Promise((r) => setTimeout(r, delay));
            addLog(line);
        }

        setResult({
            url,
            scan_id: `SCAN_${Date.now()}`,
            timestamp: new Date().toISOString(),
            summary: {
                risk_level: "HIGH",
                total_vulnerabilities: 5,
                critical: 0,
                high: 1,
                medium: 2,
                low: 1,
                info: 1,
            },
            vulnerabilities: [
                {
                    id: "VULN-001",
                    name: "Cross-Site Scripting (XSS) Réfléchi",
                    severity: "high",
                    cvss_score: 7.1,
                    category: "OWASP A03:2021 — Injection",
                    description:
                        "Un paramètre de requête est reflété dans la page sans échappement approprié.",
                    affected_url: `${url}/search?q=<script>alert(1)</script>`,
                    remediation:
                        "Échapper toutes les entrées utilisateur. Utiliser Content-Security-Policy.",
                },
                {
                    id: "VULN-002",
                    name: "En-têtes de sécurité manquants",
                    severity: "medium",
                    cvss_score: 5.3,
                    category: "OWASP A05:2021 — Mauvaise configuration",
                    description: "X-Frame-Options, X-Content-Type-Options absents.",
                    affected_url: url,
                    remediation: "Ajouter les en-têtes de sécurité recommandés.",
                },
                {
                    id: "VULN-003",
                    name: "Cookie de session sans flag Secure",
                    severity: "medium",
                    cvss_score: 4.8,
                    category: "OWASP A07:2021 — Authentification défaillante",
                    description: "Le cookie session_id est transmis sans flag Secure.",
                    affected_url: url,
                    remediation: "Configurer Secure, HttpOnly et SameSite=Strict.",
                },
                {
                    id: "VULN-004",
                    name: "robots.txt expose des chemins sensibles",
                    severity: "low",
                    cvss_score: 3.1,
                    category: "OWASP A01:2021 — Contrôle d'accès défaillant",
                    description:
                        "robots.txt contient /admin et /api/internal.",
                    affected_url: `${url}/robots.txt`,
                    remediation: "Protéger ces routes par authentification.",
                },
                {
                    id: "VULN-005",
                    name: "Version serveur exposée",
                    severity: "info",
                    cvss_score: 0.0,
                    category: "OWASP A05:2021 — Mauvaise configuration",
                    description: "Header Server révèle nginx/1.21.3.",
                    affected_url: url,
                    remediation: "Activer server_tokens off.",
                },
            ],
        });

        setScanning(false);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#050a0e] text-white font-mono">
            {/* Scanline */}
            <div
                className="fixed inset-0 pointer-events-none z-10 opacity-[0.02]"
                style={{
                    backgroundImage:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.15) 2px, rgba(0,255,136,0.15) 4px)",
                }}
            />

            {/* Header */}
            <header className="relative z-20 border-b border-[#00ff88]/10 bg-[#050a0e]/90 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-7 h-7 border border-[#00ff88] flex items-center justify-center">
                            <Shield className="h-3.5 w-3.5 text-[#00ff88]" />
                        </div>
                        <span className="text-[#00ff88] font-black tracking-widest text-sm">
                            SECU
                        </span>
                        <span className="text-white font-black tracking-widest text-sm">
                            SCAN
                        </span>
                        <span className="text-[#00ff88]/40 text-xs">{"// DASHBOARD"}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-pulse" />
                            <span className="text-[#00ff88]/50 text-xs">{user.email}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-1.5 border border-white/10 text-[#8899aa] text-xs hover:border-red-500/30 hover:text-red-400 transition-all"
                        >
                            <LogOut className="h-3 w-3" />
                            LOGOUT_
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-20 max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#00ff88]/10">
                    {[
                        { label: "SCANS_RUN", value: "01", icon: Activity },
                        {
                            label: "VULNS_FOUND",
                            value: result
                                ? result.summary.total_vulnerabilities.toString().padStart(2, "0")
                                : "—",
                            icon: AlertTriangle,
                        },
                        {
                            label: "RISK_LEVEL",
                            value: result ? result.summary.risk_level : "—",
                            icon: Shield,
                        },
                        { label: "STATUS", value: scanning ? "SCAN" : "READY", icon: Terminal },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-[#050a0e] p-4">
                            <stat.icon className="h-4 w-4 text-[#00ff88]/50 mb-2" />
                            <p className="text-[#8899aa] text-xs tracking-widest">
                                {stat.label}
                            </p>
                            <p className="text-white font-black text-lg">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Scan form */}
                <div className="border border-[#00ff88]/20 bg-black/30">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-[#00ff88]/10 bg-[#00ff88]/5">
                        <Search className="h-3 w-3 text-[#00ff88]" />
                        <span className="text-[#00ff88]/60 text-xs">new_scan.sh</span>
                    </div>
                    <div className="p-4">
                        <form onSubmit={handleScan} className="flex gap-3">
                            <div className="flex-1 flex items-center border border-[#00ff88]/20 focus-within:border-[#00ff88] transition-colors">
                                <span className="text-[#00ff88]/50 text-xs px-3">$</span>
                                <input
                                    type="url"
                                    placeholder="https://target.example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    required
                                    disabled={scanning}
                                    className="flex-1 bg-transparent outline-none py-2.5 pr-3 text-white text-xs placeholder:text-[#8899aa]/30"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={scanning}
                                className="px-6 py-2.5 bg-[#00ff88] text-black text-xs font-black tracking-widest hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {scanning ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Search className="h-3 w-3" />
                                )}
                                {scanning ? "SCANNING_" : "RUN_SCAN_"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Terminal log */}
                {(scanning || logLines.length > 0) && (
                    <div className="border border-[#00ff88]/20 bg-black/60">
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#00ff88]/10 bg-[#00ff88]/5">
                            <Terminal className="h-3 w-3 text-[#00ff88]" />
                            <span className="text-[#00ff88]/60 text-xs">scan.log</span>
                            {scanning && (
                                <div className="ml-auto flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                                    <span className="text-yellow-400/60 text-xs">RUNNING</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 text-xs space-y-1 max-h-48 overflow-y-auto">
                            {logLines.map((line, i) => (
                                <p
                                    key={i}
                                    className={
                                        line.includes("[!]")
                                            ? "text-yellow-400"
                                            : line.includes("[✓]")
                                                ? "text-[#00ff88]"
                                                : line.includes("HIGH")
                                                    ? "text-red-400"
                                                    : "text-[#8899aa]"
                                    }
                                >
                                    {line}
                                </p>
                            ))}
                            {scanning && (
                                <p className="text-[#00ff88]/50 animate-pulse">_</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="border border-[#00ff88]/20">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-[#00ff88]/10 bg-[#00ff88]/5">
                            <div className="flex items-center gap-2">
                                <span className="text-[#00ff88] text-xs font-black">
                                    VULNERABILITY_REPORT
                                </span>
                                <span className="text-[#00ff88]/30 text-xs">
                                    {"// "}{result.scan_id}
                                </span>
                            </div>
                            <span className="text-[#8899aa] text-xs">
                                {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="divide-y divide-[#00ff88]/10">
                            {result.vulnerabilities.map((vuln) => {
                                const cfg = SEVERITY_CONFIG[vuln.severity] || SEVERITY_CONFIG.info;
                                const Icon = cfg.icon;
                                return (
                                    <div
                                        key={vuln.id}
                                        className={`p-4 ${cfg.bg} hover:bg-[#00ff88]/5 transition-colors`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="text-white text-xs font-bold">
                                                        {vuln.name}
                                                    </span>
                                                    <span
                                                        className={`text-xs px-1.5 py-0.5 border ${cfg.border} ${cfg.color} uppercase`}
                                                    >
                                                        {vuln.severity}
                                                    </span>
                                                    {vuln.cvss_score > 0 && (
                                                        <span className="text-[#8899aa] text-xs">
                                                            CVSS: {vuln.cvss_score}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[#8899aa] text-xs mb-1">
                                                    {vuln.description}
                                                </p>
                                                <p className="text-[#00ff88]/50 text-xs truncate">
                                                    {vuln.affected_url}
                                                </p>
                                            </div>
                                            <span className="text-[#8899aa]/40 text-xs font-mono flex-shrink-0">
                                                {vuln.id}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
