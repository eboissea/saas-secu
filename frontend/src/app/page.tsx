import Link from "next/link";
import {
  Shield,
  ArrowRight,
  Zap,
  Eye,
  TrendingUp,
  AlertTriangle,
  Globe,
  Cloud,
  FileCheck,
  GitBranch,
  ChevronRight,
  BarChart3,
  Scan,
} from "lucide-react";

const FEATURES = [
  {
    icon: Scan,
    title: "DAST Scanner",
    desc: "Scans dynamiques automatisés détectant XSS, injections SQL, CSRF et plus. Couvre le OWASP Top 10 en profondeur.",
    color: "from-indigo-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "Pentest Automatisé",
    desc: "Simulation d'attaques réalistes combinant scans automatisés et validation pour éliminer les faux positifs.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Globe,
    title: "API Security",
    desc: "Test de sécurité REST & GraphQL. Détection de failles d'authentification, injection, et exposition de données.",
    color: "from-cyan-500 to-teal-500",
  },
  {
    icon: Cloud,
    title: "Cloud Security",
    desc: "Audit des configurations AWS, GCP, Azure. Détection des IAM risks, buckets ouverts et misconfigurations.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: FileCheck,
    title: "Compliance",
    desc: "Mapping automatique OWASP, SOC 2, GDPR, ISO 27001, HIPAA. Rapports prêts pour l'audit.",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: GitBranch,
    title: "CI/CD Integration",
    desc: "Intégration native avec GitHub, GitLab, Jenkins, Slack et Jira. Scans automatiques à chaque déploiement.",
    color: "from-orange-500 to-amber-500",
  },
];

const STATS = [
  { value: "10K+", label: "Scans effectués", icon: TrendingUp },
  { value: "50K+", label: "Vulnérabilités détectées", icon: AlertTriangle },
  { value: "99.9%", label: "Uptime garanti", icon: Zap },
  { value: "<60s", label: "Temps de scan moyen", icon: BarChart3 },
];

const INTEGRATIONS = [
  "GitHub", "GitLab", "Jenkins", "Slack", "Jira", "AWS", "Docker", "Kubernetes",
];

export default function HomePage() {
  return (
    <div
      className="min-h-screen text-white overflow-hidden"
      style={{ background: "var(--astra-bg)" }}
    >
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{
            background: "radial-gradient(circle, var(--astra-primary), transparent 70%)",
            top: "-10%",
            right: "-10%",
            animation: "floatOrb 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-15"
          style={{
            background: "radial-gradient(circle, var(--astra-blue), transparent 70%)",
            bottom: "10%",
            left: "-10%",
            animation: "floatOrb 25s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Navigation */}
      <nav
        className="relative z-50 backdrop-blur-xl border-b"
        style={{
          background: "rgba(10, 14, 26, 0.8)",
          borderColor: "var(--astra-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
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
            <div className="hidden md:flex items-center gap-6">
              {["Produit", "Fonctionnalités", "Tarifs", "Documentation"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm transition-colors"
                  style={{ color: "var(--astra-text-secondary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--astra-text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--astra-text-secondary)")}
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg transition-all"
              style={{ color: "var(--astra-text-secondary)" }}
            >
              Connexion
            </Link>
            <Link
              href="/login?mode=signup"
              className="text-sm px-5 py-2 rounded-lg font-semibold text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))",
              }}
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{
              background: "var(--astra-primary-muted)",
              color: "var(--astra-primary-hover)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--astra-primary)" }}
            />
            Plateforme de sécurité tout-en-un
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
            <span style={{ color: "var(--astra-text)" }}>Sécurisez vos </span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))",
              }}
            >
              applications
            </span>
            <br />
            <span style={{ color: "var(--astra-text)" }}>avant qu&apos;il ne soit trop tard.</span>
          </h1>

          <p
            className="text-lg md:text-xl leading-relaxed max-w-2xl mb-10"
            style={{ color: "var(--astra-text-secondary)" }}
          >
            Scanner de vulnérabilités automatisé, tests de pénétration, mapping de compliance
            et recommandations de remédiation — le tout dans un dashboard unifié.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/login?mode=signup"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-white text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/25"
              style={{
                background: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))",
              }}
            >
              Lancer un scan gratuit
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm transition-all"
              style={{
                border: "1px solid var(--astra-border-hover)",
                color: "var(--astra-text-secondary)",
              }}
            >
              <Eye className="h-4 w-4" />
              Voir une démo
            </Link>
          </div>
        </div>

        {/* Dashboard preview */}
        <div
          className="mt-16 rounded-xl overflow-hidden animate-fade-in"
          style={{
            background: "var(--astra-surface)",
            border: "1px solid var(--astra-border)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px -20px rgba(99, 102, 241, 0.15)",
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-2.5 px-4 py-3 border-b"
            style={{ borderColor: "var(--astra-border)" }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div
              className="flex-1 max-w-xs mx-auto h-6 rounded-md flex items-center justify-center text-xs"
              style={{
                background: "var(--astra-surface-2)",
                color: "var(--astra-text-muted)",
              }}
            >
              app.secuscan.io/dashboard
            </div>
          </div>
          {/* Dashboard mockup content */}
          <div className="p-6 grid grid-cols-4 gap-4">
            {[
              { label: "Security Score", value: "87/100", color: "var(--astra-success)" },
              { label: "Vulnérabilités", value: "12", color: "var(--astra-high)" },
              { label: "Corrigées", value: "38", color: "var(--astra-primary)" },
              { label: "Compliance", value: "94%", color: "var(--astra-blue)" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg p-4"
                style={{ background: "var(--astra-surface-2)" }}
              >
                <p className="text-xs mb-1.5" style={{ color: "var(--astra-text-muted)" }}>
                  {item.label}
                </p>
                <p className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </p>
              </div>
            ))}
            {/* Severity bars */}
            <div
              className="col-span-2 rounded-lg p-4"
              style={{ background: "var(--astra-surface-2)" }}
            >
              <p className="text-xs mb-3" style={{ color: "var(--astra-text-muted)" }}>
                Répartition par sévérité
              </p>
              {[
                { label: "Critical", width: "15%", color: "var(--astra-critical)" },
                { label: "High", width: "35%", color: "var(--astra-high)" },
                { label: "Medium", width: "60%", color: "var(--astra-medium)" },
                { label: "Low", width: "80%", color: "var(--astra-low)" },
              ].map((bar) => (
                <div key={bar.label} className="flex items-center gap-3 mb-2 last:mb-0">
                  <span className="text-xs w-14" style={{ color: "var(--astra-text-muted)" }}>
                    {bar.label}
                  </span>
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--astra-surface-3)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: bar.width, background: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Recent vulns */}
            <div
              className="col-span-2 rounded-lg p-4"
              style={{ background: "var(--astra-surface-2)" }}
            >
              <p className="text-xs mb-3" style={{ color: "var(--astra-text-muted)" }}>
                Dernières vulnérabilités
              </p>
              {[
                { sev: "HIGH", name: "XSS Reflected", color: "var(--astra-high)" },
                { sev: "MED", name: "Missing Headers", color: "var(--astra-medium)" },
                { sev: "LOW", name: "Server Version", color: "var(--astra-low)" },
              ].map((v) => (
                <div
                  key={v.name}
                  className="flex items-center gap-2 mb-2 last:mb-0 text-xs"
                >
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: `${v.color}22`, color: v.color }}
                  >
                    {v.sev}
                  </span>
                  <span style={{ color: "var(--astra-text-secondary)" }}>{v.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section
        className="relative z-10 border-y"
        style={{
          borderColor: "var(--astra-border)",
          background: "rgba(17, 24, 39, 0.5)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon
                  className="h-5 w-5 mx-auto mb-3"
                  style={{ color: "var(--astra-primary)" }}
                />
                <p className="text-3xl font-extrabold mb-1" style={{ color: "var(--astra-text)" }}>
                  {s.value}
                </p>
                <p className="text-sm" style={{ color: "var(--astra-text-muted)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold tracking-wider uppercase mb-3"
              style={{ color: "var(--astra-primary)" }}
            >
              Fonctionnalités
            </p>
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
              style={{ color: "var(--astra-text)" }}
            >
              Tout ce qu&apos;il faut pour sécuriser vos apps
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: "var(--astra-text-secondary)" }}
            >
              Une plateforme complète alliant scan automatisé, pentest,
              compliance et remédiation dans une interface unique.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "var(--astra-surface)",
                  border: "1px solid var(--astra-border)",
                  animationDelay: `${i * 100}ms`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.3)";
                  e.currentTarget.style.boxShadow = "0 8px 30px -10px rgba(99, 102, 241, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--astra-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br ${f.color}`}
                  style={{ opacity: 0.9 }}
                >
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: "var(--astra-text)" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--astra-text-secondary)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section
        className="relative z-10 py-20 px-6 border-t"
        style={{ borderColor: "var(--astra-border)" }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p
            className="text-sm font-semibold tracking-wider uppercase mb-3"
            style={{ color: "var(--astra-primary)" }}
          >
            Intégrations
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
            style={{ color: "var(--astra-text)" }}
          >
            S&apos;intègre à votre stack existant
          </h2>
          <p
            className="text-lg max-w-xl mx-auto mb-12"
            style={{ color: "var(--astra-text-secondary)" }}
          >
            Connectez SecuScan à vos outils CI/CD, ticketing et communication favoris.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {INTEGRATIONS.map((name) => (
              <div
                key={name}
                className="px-6 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: "var(--astra-surface)",
                  border: "1px solid var(--astra-border)",
                  color: "var(--astra-text-secondary)",
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="rounded-2xl p-12 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(59,130,246,0.08))",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            {/* Glow orb */}
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20"
              style={{ background: "var(--astra-primary)" }}
            />
            <div className="relative z-10">
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
                style={{ color: "var(--astra-text)" }}
              >
                Prêt à sécuriser votre application ?
              </h2>
              <p
                className="text-lg mb-8 max-w-lg mx-auto"
                style={{ color: "var(--astra-text-secondary)" }}
              >
                Lancez votre premier scan gratuitement. Aucune carte de crédit requise.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/login?mode=signup"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/25"
                  style={{
                    background: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))",
                  }}
                >
                  Commencer gratuitement
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold transition-all"
                  style={{
                    border: "1px solid var(--astra-border-hover)",
                    color: "var(--astra-text-secondary)",
                  }}
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 border-t py-8 px-6"
        style={{ borderColor: "var(--astra-border)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--astra-primary), var(--astra-blue))",
              }}
            >
              <Shield className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--astra-text-muted)" }}>
              SecuScan
            </span>
          </div>
          <div
            className="flex items-center gap-6 text-xs"
            style={{ color: "var(--astra-text-muted)" }}
          >
            <span>© {new Date().getFullYear()} SecuScan</span>
            <span>AES-256 Encrypted</span>
            <span>SOC 2 Compliant</span>
            <span>GDPR Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
