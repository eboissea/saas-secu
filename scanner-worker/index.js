/**
 * SecuScan — Scanner Worker
 *
 * Ce script simule un worker de scan de sécurité.
 * Il reçoit une URL, attend 5 secondes (simulation d'analyse),
 * et retourne un faux rapport JSON de vulnérabilités.
 *
 * En production, ce worker sera déclenché via une file d'attente
 * (ex: Redis/BullMQ) ou une API HTTP.
 */

const TARGET_URL = process.argv[2] || "https://exemple.com";

/**
 * Génère un faux rapport de vulnérabilités
 */
function generateReport(url) {
    return {
        scan_id: `scan_${Date.now()}`,
        target_url: url,
        timestamp: new Date().toISOString(),
        duration_ms: 5000,
        status: "completed",
        summary: {
            risk_level: "Moyen",
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
                    "Un paramètre de requête est reflété dans la page sans échappement approprié, permettant l'injection de scripts malveillants.",
                affected_url: `${url}/search?q=<script>alert(1)</script>`,
                remediation:
                    "Échapper toutes les entrées utilisateur avant de les inclure dans le DOM. Utiliser Content-Security-Policy.",
            },
            {
                id: "VULN-002",
                name: "En-têtes de sécurité manquants",
                severity: "medium",
                cvss_score: 5.3,
                category: "OWASP A05:2021 — Mauvaise configuration de sécurité",
                description:
                    "Les en-têtes X-Frame-Options, X-Content-Type-Options et Strict-Transport-Security sont absents.",
                affected_url: url,
                remediation:
                    "Ajouter les en-têtes de sécurité recommandés dans la configuration du serveur web.",
            },
            {
                id: "VULN-003",
                name: "Cookie de session sans flag Secure",
                severity: "medium",
                cvss_score: 4.8,
                category: "OWASP A07:2021 — Échecs d'authentification",
                description:
                    "Le cookie de session 'session_id' est transmis sans le flag Secure, exposant les données à une interception sur HTTP.",
                affected_url: url,
                remediation:
                    "Configurer tous les cookies de session avec les flags Secure, HttpOnly et SameSite=Strict.",
            },
            {
                id: "VULN-004",
                name: "Fichier robots.txt expose des chemins sensibles",
                severity: "low",
                cvss_score: 3.1,
                category: "OWASP A01:2021 — Contrôle d'accès défaillant",
                description:
                    "Le fichier robots.txt contient des entrées Disallow pointant vers /admin et /api/internal.",
                affected_url: `${url}/robots.txt`,
                remediation:
                    "Ne pas lister les chemins sensibles dans robots.txt. Protéger ces routes par authentification.",
            },
            {
                id: "VULN-005",
                name: "Version du serveur exposée",
                severity: "info",
                cvss_score: 0.0,
                category: "OWASP A05:2021 — Mauvaise configuration de sécurité",
                description:
                    "L'en-tête HTTP 'Server: nginx/1.21.3' révèle la version exacte du serveur web.",
                affected_url: url,
                remediation:
                    "Masquer la version du serveur dans la configuration (server_tokens off pour nginx).",
            },
        ],
    };
}

/**
 * Fonction principale — simule le processus de scan
 */
async function main() {
    console.log("╔══════════════════════════════════════════╗");
    console.log("║       SecuScan — Scanner Worker          ║");
    console.log("╚══════════════════════════════════════════╝");
    console.log();
    console.log(`🎯 Cible : ${TARGET_URL}`);
    console.log("⏳ Analyse en cours...");
    console.log();

    // Simulation du temps d'analyse (5 secondes)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const report = generateReport(TARGET_URL);

    console.log("✅ Scan terminé !");
    console.log();
    console.log("📋 Rapport de vulnérabilités :");
    console.log("─".repeat(50));
    console.log(JSON.stringify(report, null, 2));
    console.log("─".repeat(50));
    console.log();
    console.log(
        `📊 Résumé : ${report.summary.total_vulnerabilities} vulnérabilités trouvées`
    );
    console.log(
        `   🔴 Critiques: ${report.summary.critical} | 🟠 Élevées: ${report.summary.high} | 🟡 Moyennes: ${report.summary.medium} | 🟢 Faibles: ${report.summary.low} | ℹ️  Info: ${report.summary.info}`
    );

    return report;
}

main().catch(console.error);
