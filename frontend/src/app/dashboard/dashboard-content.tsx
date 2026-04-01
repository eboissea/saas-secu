"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
    Shield, LogOut, Loader2, CheckCircle2,
    Search, Terminal, Activity, Copy, Check, ChevronDown,
    ChevronUp, LayoutDashboard, Scan, Bug, FileCheck,
    Menu, X, Filter,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Vulnerability {
    id: string; name: string; severity: string; cvss_score: number;
    category: string; description: string; affected_url: string;
    remediation: string; status: string;
}

interface ScanResult {
    url: string; scan_id: string; timestamp: string;
    summary: { risk_level: string; total_vulnerabilities: number; critical: number; high: number; medium: number; low: number; info: number; };
    vulnerabilities: Vulnerability[];
}

const SEV: Record<string, { color: string; bg: string; label: string }> = {
    critical: { color: "var(--astra-critical)", bg: "var(--astra-critical-muted)", label: "Critical" },
    high: { color: "var(--astra-high)", bg: "var(--astra-high-muted)", label: "High" },
    medium: { color: "var(--astra-medium)", bg: "var(--astra-medium-muted)", label: "Medium" },
    low: { color: "var(--astra-low)", bg: "var(--astra-low-muted)", label: "Low" },
    info: { color: "var(--astra-info)", bg: "var(--astra-info-muted)", label: "Info" },
};

const STATUS_OPTS = ["Open", "In Progress", "Fixed", "Won't Fix", "False Positive"];
const STATUS_COLORS: Record<string, string> = {
    "Open": "var(--astra-high)", "In Progress": "var(--astra-medium)",
    "Fixed": "var(--astra-success)", "Won't Fix": "var(--astra-info)",
    "False Positive": "var(--astra-text-muted)",
};

const NAV = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "scan", label: "Scanner", icon: Scan },
    { id: "vulns", label: "Vulnérabilités", icon: Bug },
    { id: "compliance", label: "Compliance", icon: FileCheck },
];

function ts() { return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }

export function DashboardContent({ user }: { user: User }) {
    const [view, setView] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [url, setUrl] = useState("");
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [logLines, setLogLines] = useState<{ time: string; text: string }[]>([]);
    const [scanCount, setScanCount] = useState(0);
    const [totalVulns, setTotalVulns] = useState(0);
    const [history, setHistory] = useState<ScanResult[]>([]);
    const [expandedVulns, setExpandedVulns] = useState<Set<string>>(new Set());
    const [copied, setCopied] = useState(false);
    const [vulnFilter, setVulnFilter] = useState("all");
    const logRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        setScanCount(parseInt(localStorage.getItem("secuscan_count") || "0", 10));
        setTotalVulns(parseInt(localStorage.getItem("secuscan_vulns") || "0", 10));
        setHistory(JSON.parse(localStorage.getItem("secuscan_history") || "[]"));
    }, []);

    useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logLines]);

    const addLog = (text: string) => setLogLines((p) => [...p, { time: ts(), text }]);

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        setScanning(true); setResult(null); setLogLines([]); setExpandedVulns(new Set());
        const steps: [number, string][] = [
            [300, "[*] Initializing scan engine..."], [600, `[*] Probing target: ${url}`],
            [1000, "[*] Enumerating attack surface..."], [1500, "[!] Endpoint: /api/search"],
            [1800, "[!] Endpoint: /auth/login"], [2100, "[!] Endpoint: /api/user"],
            [2500, "[*] OWASP checks (1/10)... XSS"], [2800, "[*] OWASP checks (2/10)... SQLi"],
            [3100, "[*] OWASP checks (3/10)... Auth"], [3400, "[HIGH] VULN-001 — XSS Reflected (CVSS: 7.1)"],
            [3700, "[MED] VULN-002 — Missing headers"], [4000, "[MED] VULN-003 — Cookie sans Secure"],
            [4300, "[LOW] VULN-004 — robots.txt expose /admin"], [4600, "[INFO] VULN-005 — Server version"],
            [4900, "[*] Generating report..."], [5400, "[✓] Scan complete — 5 vulnerabilities"],
        ];
        for (const [d, l] of steps) { await new Promise((r) => setTimeout(r, d)); addLog(l); }
        const sr: ScanResult = {
            url, scan_id: `SCAN_${Date.now()}`, timestamp: new Date().toISOString(),
            summary: { risk_level: "HIGH", total_vulnerabilities: 5, critical: 0, high: 1, medium: 2, low: 1, info: 1 },
            vulnerabilities: [
                { id: "VULN-001", name: "Cross-Site Scripting (XSS) Réfléchi", severity: "high", cvss_score: 7.1, category: "OWASP A03:2021 — Injection", description: "Paramètre reflété sans échappement, permettant l'injection de scripts.", affected_url: `${url}/search?q=<script>alert(1)</script>`, remediation: "Échapper les entrées utilisateur. Implémenter CSP stricte.", status: "Open" },
                { id: "VULN-002", name: "En-têtes de sécurité manquants", severity: "medium", cvss_score: 5.3, category: "OWASP A05:2021 — Mauvaise config", description: "X-Frame-Options, X-Content-Type-Options et HSTS absents.", affected_url: url, remediation: "Ajouter X-Frame-Options: DENY, X-Content-Type-Options: nosniff, HSTS.", status: "Open" },
                { id: "VULN-003", name: "Cookie sans flag Secure", severity: "medium", cvss_score: 4.8, category: "OWASP A07:2021 — Auth défaillante", description: "Cookie session_id transmis sans flag Secure.", affected_url: url, remediation: "Configurer Secure, HttpOnly et SameSite=Strict.", status: "Open" },
                { id: "VULN-004", name: "robots.txt expose des chemins sensibles", severity: "low", cvss_score: 3.1, category: "OWASP A01:2021 — Contrôle d'accès", description: "robots.txt révèle /admin et /api/internal.", affected_url: `${url}/robots.txt`, remediation: "Retirer les routes sensibles de robots.txt.", status: "Open" },
                { id: "VULN-005", name: "Version serveur exposée", severity: "info", cvss_score: 0.0, category: "OWASP A05:2021 — Mauvaise config", description: "Header Server révèle nginx/1.21.3.", affected_url: url, remediation: "server_tokens off (nginx).", status: "Open" },
            ],
        };
        setResult(sr);
        const nc = scanCount + 1, nv = totalVulns + 5, nh = [sr, ...history].slice(0, 10);
        setScanCount(nc); setTotalVulns(nv); setHistory(nh);
        localStorage.setItem("secuscan_count", String(nc));
        localStorage.setItem("secuscan_vulns", String(nv));
        localStorage.setItem("secuscan_history", JSON.stringify(nh));
        setScanning(false); setView("vulns");
    };

    const handleLogout = async () => { const s = createClient(); await s.auth.signOut(); router.push("/"); router.refresh(); };
    const toggleVuln = (id: string) => setExpandedVulns((p) => { const n = new Set(p); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; });

    const updateVulnStatus = (vulnId: string, newStatus: string) => {
        if (!result) return;
        const updated = { ...result, vulnerabilities: result.vulnerabilities.map((v) => v.id === vulnId ? { ...v, status: newStatus } : v) };
        setResult(updated);
        const nh = history.map((h) => h.scan_id === updated.scan_id ? updated : h);
        setHistory(nh);
        localStorage.setItem("secuscan_history", JSON.stringify(nh));
    };

    const copyReport = async () => {
        if (!result) return;
        const t = [`SECUSCAN REPORT\nScan: ${result.scan_id}\nTarget: ${result.url}\nDate: ${new Date(result.timestamp).toLocaleString("fr-FR")}\nRisk: ${result.summary.risk_level}\n`, ...result.vulnerabilities.map((v) => `[${v.id}] ${v.name}\n  Severity: ${v.severity.toUpperCase()} (CVSS: ${v.cvss_score})\n  ${v.category}\n  ${v.remediation}`)].join("\n");
        await navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000);
    };

    const logColor = (t: string) => { if (t.includes("[HIGH]")) return "var(--astra-high)"; if (t.includes("[MED]")) return "var(--astra-medium)"; if (t.includes("[LOW]")) return "var(--astra-low)"; if (t.includes("[INFO]")) return "var(--astra-info)"; if (t.includes("[✓]")) return "var(--astra-success)"; if (t.includes("[!]")) return "var(--astra-medium)"; return "var(--astra-text-muted)"; };

    const allVulns = history.flatMap((h) => h.vulnerabilities.map((v) => ({ ...v, scanUrl: h.url, scanId: h.scan_id })));
    const filteredVulns = vulnFilter === "all" ? allVulns : allVulns.filter((v) => v.severity === vulnFilter);
    const fixedCount = allVulns.filter((v) => v.status === "Fixed").length;
    const openCount = allVulns.filter((v) => v.status === "Open").length;
    const secScore = allVulns.length > 0 ? Math.max(0, Math.round(100 - (openCount / allVulns.length) * 60)) : 100;

    const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
        <div className={`rounded-xl p-5 ${className}`} style={{ background: "var(--astra-surface)", border: "1px solid var(--astra-border)" }}>{children}</div>
    );

    return (
        <div className="min-h-screen flex" style={{ background: "var(--astra-bg)", color: "var(--astra-text)" }}>
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? "w-56" : "w-16"} flex-shrink-0 border-r flex flex-col transition-all duration-300`} style={{ background: "var(--astra-surface)", borderColor: "var(--astra-border)" }}>
                <div className="h-14 flex items-center justify-between px-3 border-b" style={{ borderColor: "var(--astra-border)" }}>
                    {sidebarOpen && (
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))" }}>
                                <Shield className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="font-bold text-sm"><span style={{ color: "var(--astra-text)" }}>Secu</span><span style={{ color: "var(--astra-primary)" }}>Scan</span></span>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md transition-colors" style={{ color: "var(--astra-text-muted)" }}>
                        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>
                <nav className="flex-1 py-3 px-2 space-y-1">
                    {NAV.map((n) => (
                        <button key={n.id} onClick={() => setView(n.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${!sidebarOpen ? "justify-center" : ""}`}
                            style={{ background: view === n.id ? "var(--astra-primary-muted)" : "transparent", color: view === n.id ? "var(--astra-primary-hover)" : "var(--astra-text-secondary)" }}>
                            <n.icon className="h-4 w-4 flex-shrink-0" />
                            {sidebarOpen && <span>{n.label}</span>}
                        </button>
                    ))}
                </nav>
                <div className="p-3 border-t" style={{ borderColor: "var(--astra-border)" }}>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${!sidebarOpen ? "justify-center" : ""}`} style={{ color: "var(--astra-text-muted)" }}>
                        <LogOut className="h-4 w-4" />
                        {sidebarOpen && <span>Déconnexion</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-14 flex items-center justify-between px-6 border-b flex-shrink-0" style={{ background: "var(--astra-surface)", borderColor: "var(--astra-border)" }}>
                    <h1 className="text-sm font-semibold" style={{ color: "var(--astra-text)" }}>{NAV.find((n) => n.id === view)?.label || "Dashboard"}</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--astra-success)" }} />
                            <span className="text-xs" style={{ color: "var(--astra-text-muted)" }}>{user.email}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* OVERVIEW */}
                    {view === "overview" && (<>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Security Score", value: `${secScore}/100`, color: secScore > 70 ? "var(--astra-success)" : "var(--astra-high)" },
                                { label: "Total Scans", value: String(scanCount), color: "var(--astra-primary)" },
                                { label: "Vulns Ouvertes", value: String(openCount), color: "var(--astra-high)" },
                                { label: "Vulns Corrigées", value: String(fixedCount), color: "var(--astra-success)" },
                            ].map((s) => (
                                <Card key={s.label}>
                                    <p className="text-xs mb-1" style={{ color: "var(--astra-text-muted)" }}>{s.label}</p>
                                    <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                                </Card>
                            ))}
                        </div>
                        <div className="grid lg:grid-cols-2 gap-4">
                            <Card>
                                <p className="text-sm font-semibold mb-4">Répartition par sévérité</p>
                                {Object.entries(SEV).map(([key, s]) => {
                                    const count = allVulns.filter((v) => v.severity === key).length;
                                    const pct = allVulns.length > 0 ? (count / allVulns.length) * 100 : 0;
                                    return (
                                        <div key={key} className="flex items-center gap-3 mb-3">
                                            <span className="text-xs w-16" style={{ color: "var(--astra-text-muted)" }}>{s.label}</span>
                                            <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--astra-surface-2)" }}>
                                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: s.color }} />
                                            </div>
                                            <span className="text-xs font-mono w-6 text-right" style={{ color: "var(--astra-text-muted)" }}>{count}</span>
                                        </div>
                                    );
                                })}
                            </Card>
                            <Card>
                                <p className="text-sm font-semibold mb-4">Scans récents</p>
                                {history.length === 0 ? <p className="text-xs" style={{ color: "var(--astra-text-muted)" }}>Aucun scan effectué</p> : history.slice(0, 5).map((h) => (
                                    <div key={h.scan_id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "var(--astra-border)" }}>
                                        <Activity className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--astra-primary)" }} />
                                        <span className="text-xs truncate flex-1" style={{ color: "var(--astra-text-secondary)" }}>{h.url}</span>
                                        <span className="text-xs font-medium" style={{ color: SEV[h.summary.risk_level.toLowerCase()]?.color || "var(--astra-text-muted)" }}>{h.summary.risk_level}</span>
                                        <span className="text-xs" style={{ color: "var(--astra-text-muted)" }}>{h.summary.total_vulnerabilities} vulns</span>
                                    </div>
                                ))}
                            </Card>
                        </div>
                    </>)}

                    {/* SCAN */}
                    {view === "scan" && (<>
                        <Card>
                            <p className="text-sm font-semibold mb-4">Nouveau scan</p>
                            <form onSubmit={handleScan} className="flex gap-3">
                                <input type="url" placeholder="https://target.example.com" value={url} onChange={(e) => setUrl(e.target.value)} required disabled={scanning}
                                    className="flex-1 rounded-lg px-4 py-3 text-sm outline-none transition-all" style={{ background: "var(--astra-surface-2)", border: "1px solid var(--astra-border)", color: "var(--astra-text)" }}
                                    onFocus={(e) => (e.target.style.borderColor = "var(--astra-primary)")} onBlur={(e) => (e.target.style.borderColor = "var(--astra-border)")} />
                                <button type="submit" disabled={scanning} className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-2"
                                    style={{ background: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))" }}>
                                    {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    {scanning ? "Scanning..." : "Lancer le scan"}
                                </button>
                            </form>
                        </Card>
                        {(scanning || logLines.length > 0) && (
                            <Card>
                                <div className="flex items-center gap-2 mb-3">
                                    <Terminal className="h-4 w-4" style={{ color: "var(--astra-primary)" }} />
                                    <span className="text-sm font-semibold">Terminal</span>
                                    {scanning && <div className="ml-auto flex items-center gap-1.5"><div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--astra-medium)" }} /><span className="text-xs" style={{ color: "var(--astra-medium)" }}>Running</span></div>}
                                </div>
                                <div ref={logRef} className="rounded-lg p-4 text-xs space-y-1 max-h-60 overflow-y-auto font-mono" style={{ background: "var(--astra-bg)" }}>
                                    {logLines.map((l, i) => (<p key={i} className="flex gap-3"><span className="flex-shrink-0 select-none" style={{ color: "var(--astra-text-muted)" }}>{l.time}</span><span style={{ color: logColor(l.text) }}>{l.text}</span></p>))}
                                    {scanning && <p className="animate-pulse" style={{ color: "var(--astra-primary)" }}>_</p>}
                                </div>
                            </Card>
                        )}
                    </>)}

                    {/* VULNS */}
                    {view === "vulns" && (<>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Filter className="h-4 w-4" style={{ color: "var(--astra-text-muted)" }} />
                                <div className="flex gap-1">
                                    {["all", ...Object.keys(SEV)].map((f) => (
                                        <button key={f} onClick={() => setVulnFilter(f)} className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                                            style={{ background: vulnFilter === f ? "var(--astra-primary-muted)" : "transparent", color: vulnFilter === f ? "var(--astra-primary-hover)" : "var(--astra-text-muted)" }}>
                                            {f === "all" ? "Tous" : SEV[f].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {result && <button onClick={copyReport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all" style={{ border: "1px solid var(--astra-border)", color: "var(--astra-text-muted)" }}>
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? "Copié" : "Copier rapport"}
                            </button>}
                        </div>
                        {filteredVulns.length === 0 ? (
                            <Card><p className="text-sm text-center py-8" style={{ color: "var(--astra-text-muted)" }}>Aucune vulnérabilité. Lancez un scan pour commencer.</p></Card>
                        ) : (
                            <div className="space-y-2">
                                {filteredVulns.map((vuln) => {
                                    const s = SEV[vuln.severity] || SEV.info;
                                    const exp = expandedVulns.has(vuln.id);
                                    return (
                                        <Card key={`${vuln.scanId}-${vuln.id}`} className="!p-0 overflow-hidden">
                                            <button onClick={() => toggleVuln(vuln.id)} className="w-full text-left p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: s.color }} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <span className="text-sm font-semibold">{vuln.name}</span>
                                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                                                            {vuln.cvss_score > 0 && <span className="text-xs" style={{ color: "var(--astra-text-muted)" }}>CVSS {vuln.cvss_score}</span>}
                                                        </div>
                                                        <p className="text-xs truncate" style={{ color: "var(--astra-text-muted)" }}>{vuln.affected_url}</p>
                                                    </div>
                                                    <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: `${STATUS_COLORS[vuln.status] || "var(--astra-text-muted)"}18`, color: STATUS_COLORS[vuln.status] || "var(--astra-text-muted)" }}>{vuln.status}</span>
                                                    {exp ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: "var(--astra-text-muted)" }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: "var(--astra-text-muted)" }} />}
                                                </div>
                                            </button>
                                            {exp && (
                                                <div className="px-4 pb-4 border-t" style={{ borderColor: "var(--astra-border)" }}>
                                                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                                                        <div>
                                                            <p className="text-xs font-semibold mb-2" style={{ color: "var(--astra-primary)" }}>Description</p>
                                                            <p className="text-xs leading-relaxed" style={{ color: "var(--astra-text-secondary)" }}>{vuln.description}</p>
                                                            <p className="text-xs font-semibold mt-3 mb-1" style={{ color: "var(--astra-primary)" }}>Catégorie</p>
                                                            <p className="text-xs" style={{ color: "var(--astra-text-secondary)" }}>{vuln.category}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-semibold mb-2" style={{ color: "var(--astra-success)" }}>Remédiation</p>
                                                            <p className="text-xs leading-relaxed" style={{ color: "var(--astra-text-secondary)" }}>{vuln.remediation}</p>
                                                            <p className="text-xs font-semibold mt-3 mb-2" style={{ color: "var(--astra-primary)" }}>Statut</p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {STATUS_OPTS.map((st) => (
                                                                    <button key={st} onClick={() => updateVulnStatus(vuln.id, st)} className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                                                                        style={{ background: vuln.status === st ? `${STATUS_COLORS[st]}25` : "var(--astra-surface-2)", color: vuln.status === st ? STATUS_COLORS[st] : "var(--astra-text-muted)", border: vuln.status === st ? `1px solid ${STATUS_COLORS[st]}40` : "1px solid transparent" }}>
                                                                        {st}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </>)}

                    {/* COMPLIANCE */}
                    {view === "compliance" && (<>
                        <Card>
                            <p className="text-sm font-semibold mb-4">OWASP Top 10 Coverage</p>
                            {[
                                { id: "A01", name: "Broken Access Control", pct: 85 },
                                { id: "A02", name: "Cryptographic Failures", pct: 70 },
                                { id: "A03", name: "Injection", pct: 95 },
                                { id: "A04", name: "Insecure Design", pct: 60 },
                                { id: "A05", name: "Security Misconfiguration", pct: 90 },
                                { id: "A06", name: "Vulnerable Components", pct: 75 },
                                { id: "A07", name: "Auth Failures", pct: 88 },
                                { id: "A08", name: "Data Integrity Failures", pct: 65 },
                                { id: "A09", name: "Logging Failures", pct: 50 },
                                { id: "A10", name: "SSRF", pct: 80 },
                            ].map((o) => (
                                <div key={o.id} className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-mono w-8" style={{ color: "var(--astra-primary)" }}>{o.id}</span>
                                    <span className="text-xs w-48 truncate" style={{ color: "var(--astra-text-secondary)" }}>{o.name}</span>
                                    <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--astra-surface-2)" }}>
                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${o.pct}%`, background: o.pct >= 80 ? "var(--astra-success)" : o.pct >= 60 ? "var(--astra-medium)" : "var(--astra-high)" }} />
                                    </div>
                                    <span className="text-xs font-mono w-10 text-right" style={{ color: "var(--astra-text-muted)" }}>{o.pct}%</span>
                                </div>
                            ))}
                        </Card>
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { name: "SOC 2", items: ["Access Control", "Encryption", "Monitoring", "Incident Response"], pct: 78 },
                                { name: "GDPR", items: ["Data Protection", "Consent", "Right to Erasure", "Breach Notification"], pct: 85 },
                                { name: "ISO 27001", items: ["Risk Assessment", "Asset Management", "Access Control", "Cryptography"], pct: 72 },
                            ].map((c) => (
                                <Card key={c.name}>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-semibold">{c.name}</p>
                                        <span className="text-lg font-bold" style={{ color: c.pct >= 80 ? "var(--astra-success)" : "var(--astra-medium)" }}>{c.pct}%</span>
                                    </div>
                                    {c.items.map((item) => (
                                        <div key={item} className="flex items-center gap-2 mb-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--astra-success)" }} />
                                            <span className="text-xs" style={{ color: "var(--astra-text-secondary)" }}>{item}</span>
                                        </div>
                                    ))}
                                </Card>
                            ))}
                        </div>
                    </>)}
                </main>
            </div>
        </div>
    );
}
