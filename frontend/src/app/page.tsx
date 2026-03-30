import Link from "next/link";
import { ArrowRight, Shield, Zap, Eye, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050a0e] text-white font-mono overflow-hidden">
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.1) 2px, rgba(0,255,136,0.1) 4px)",
        }}
      />

      {/* Animated hex grid background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='52' viewBox='0 0 60 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 17.3V34.7L30 52L0 34.7V17.3L30 0Z' fill='none' stroke='%2300ff88' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 52px",
            animation: "pulse 8s ease-in-out infinite",
          }}
        />
        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0066ff]/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 border-b border-[#00ff88]/10 bg-[#050a0e]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-[#00ff88] flex items-center justify-center">
              <Shield className="h-4 w-4 text-[#00ff88]" />
            </div>
            <div>
              <span className="text-[#00ff88] font-bold tracking-widest text-sm">
                SECU
              </span>
              <span className="text-white font-bold tracking-widest text-sm">
                SCAN
              </span>
            </div>
            <span className="text-[#00ff88]/40 text-xs ml-2">&#47;&#47; v1.0.0</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#00ff88]/40 hidden sm:inline">
              [ SYSTEM_STATUS: ONLINE ]
            </span>
            <Link
              href="/login"
              className="px-4 py-2 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 hover:border-[#00ff88] transition-all"
            >
              CONNECT_
            </Link>
            <Link
              href="/login?mode=signup"
              className="px-4 py-2 bg-[#00ff88] text-black font-bold hover:bg-[#00ff88]/90 transition-all"
            >
              REGISTER_
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 pt-24 pb-20">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 border border-[#00ff88]/30 bg-[#00ff88]/5">
          <div className="w-2 h-2 bg-[#00ff88] rounded-full animate-pulse" />
          <span className="text-[#00ff88] text-xs tracking-widest">
            THREAT_DETECTION_ACTIVE
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-2">
          <span className="text-white">AUDIT YOUR</span>
          <br />
          <span
            className="text-[#00ff88]"
            style={{ textShadow: "0 0 40px rgba(0,255,136,0.4)" }}
          >
            ATTACK SURFACE
          </span>
        </h1>
        <p className="text-[#00ff88]/30 text-2xl md:text-4xl font-black tracking-tight mb-8">
          BEFORE THEY DO.
        </p>

        <p className="text-[#8899aa] max-w-xl text-sm leading-relaxed mb-10">
          SecuScan scanne vos applications en profondeur — XSS, injections SQL,
          mauvaises configurations, CVE exposées. Recevez un rapport structuré
          OWASP Top 10 en moins de 60 secondes.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/login?mode=signup"
            className="group inline-flex items-center gap-3 px-6 py-3 bg-[#00ff88] text-black font-bold text-sm hover:bg-white transition-all"
          >
            LAUNCH_SCAN
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#ffffff]/10 text-[#8899aa] text-sm hover:border-[#00ff88]/40 hover:text-white transition-all"
          >
            <Lock className="h-4 w-4" />
            CONNECT_
          </Link>
        </div>

        {/* Terminal preview */}
        <div className="mt-20 border border-[#00ff88]/20 bg-black/40 backdrop-blur">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#00ff88]/10 bg-[#00ff88]/5">
            <div className="w-2 h-2 rounded-full bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 rounded-full bg-[#00ff88]/60" />
            <span className="text-[#00ff88]/40 text-xs ml-2">
              secuscan@terminal ~ scan --target
            </span>
          </div>
          <div className="p-6 text-xs leading-relaxed space-y-1">
            <p>
              <span className="text-[#00ff88]">$</span>{" "}
              <span className="text-white">
                secuscan --target https://api.target.com --depth full
              </span>
            </p>
            <p className="text-[#8899aa]">
              [*] Initializing scan engine...
            </p>
            <p className="text-[#8899aa]">
              [*] Probing attack surface: 47 endpoints detected
            </p>
            <p className="text-yellow-400">
              [!] VULN-001 HIGH — XSS Reflected @ /search?q=
            </p>
            <p className="text-yellow-400/70">
              [!] VULN-002 MED — Missing security headers
            </p>
            <p className="text-blue-400">
              [i] VULN-003 INFO — Server version exposed (nginx/1.21)
            </p>
            <p className="text-[#8899aa]">
              [*] Generating OWASP report...
            </p>
            <p>
              <span className="text-[#00ff88]">[✓]</span>{" "}
              <span className="text-white">
                Scan complete — 5 vulnerabilities found (1 HIGH, 2 MED, 1 LOW, 1 INFO)
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-20 border-t border-[#00ff88]/10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#00ff88]/50 text-xs tracking-widest mb-8">
            {"// CAPABILITIES"}
          </p>
          <div className="grid md:grid-cols-3 gap-px bg-[#00ff88]/10">
            {[
              {
                icon: Eye,
                id: "01",
                title: "RECONNAISSANCE",
                desc: "Détection automatique de la surface d'attaque, endpoints exposés, technologies utilisées.",
              },
              {
                icon: Zap,
                id: "02",
                title: "EXPLOITATION_SIM",
                desc: "Simulation passive des vecteurs d'attaque OWASP Top 10, CVE et misconfiguration.",
              },
              {
                icon: Shield,
                id: "03",
                title: "REPORT_&_FIX",
                desc: "Rapport structuré avec score CVSS, POC et recommandations de remédiation priorisées.",
              },
            ].map((f) => (
              <div
                key={f.id}
                className="bg-[#050a0e] p-8 hover:bg-[#00ff88]/5 transition-colors group"
              >
                <div className="flex items-start justify-between mb-6">
                  <f.icon className="h-6 w-6 text-[#00ff88] group-hover:scale-110 transition-transform" />
                  <span className="text-[#00ff88]/20 text-xs font-black">
                    {f.id}
                  </span>
                </div>
                <h3 className="text-white font-black text-sm tracking-widest mb-3">
                  {f.title}
                </h3>
                <p className="text-[#8899aa] text-xs leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-[#00ff88]/10 py-6 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#8899aa]/50">
          <span>{"// SECUSCAN"} © {new Date().getFullYear()}</span>
          <span>AES-256 ENCRYPTED | GDPR COMPLIANT</span>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
