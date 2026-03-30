# 🚀 Guide de Déploiement — SecuScan

Ce document détaille comment pousser le projet sur GitHub, puis le déployer sur **Vercel** (frontend) et **Railway** (scanner-worker).

---

## Prérequis

- [Node.js 18+](https://nodejs.org/) installé
- [Git](https://git-scm.com/) installé
- Un compte [GitHub](https://github.com)
- Un compte [Vercel](https://vercel.com) (gratuit)
- Un compte [Railway](https://railway.app) (gratuit avec limites)
- Un projet [Supabase](https://supabase.com) créé (gratuit)

---

## Étape 1 — Configuration de Supabase

1. Allez sur [app.supabase.com](https://app.supabase.com) et créez un nouveau projet.
2. Depuis **Settings → API**, copiez :
   - `Project URL` → c'est votre `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → c'est votre `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Collez ces valeurs dans `frontend/.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   ```
4. Dans **Authentication → Settings**, activez le provider **Email** (activé par défaut).

---

## Étape 2 — Initialiser Git et pousser sur GitHub

### Créer le dépôt GitHub

1. Allez sur [github.com/new](https://github.com/new)
2. Nommez le repo (ex: `secuscan`)
3. Laissez-le **privé** (recommandé pour un SaaS)
4. **Ne cochez aucune option** (pas de README, pas de .gitignore, pas de licence)
5. Cliquez sur **Create repository**

### Initialiser et pousser le code

Depuis le terminal, à la racine du projet (`/app`) :

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "feat: initial project setup — Next.js frontend + scanner worker"

# Définir la branche principale
git branch -M main

# Ajouter le remote (remplacez par VOTRE URL)
git remote add origin https://github.com/VOTRE_USERNAME/secuscan.git

# Pousser
git push -u origin main
```

> ⚠️ **Important** : Vérifiez que `.env.local` n'est **pas** poussé (il est dans le `.gitignore`).

---

## Étape 3 — Déployer le Frontend sur Vercel

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Cliquez sur **Import Git Repository**
3. Autorisez Vercel à accéder à votre compte GitHub si ce n'est pas déjà fait
4. Sélectionnez le repo `secuscan`
5. Vercel va détecter automatiquement le `vercel.json` et configurer le projet

### Variables d'environnement

6. Avant de cliquer **Deploy**, allez dans **Environment Variables** et ajoutez :

   | Variable | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` |

7. Cliquez sur **Deploy**
8. Attendez le build (~2-3 minutes)
9. Votre frontend sera accessible sur `https://secuscan-xxxx.vercel.app`

### Configuration du domaine (optionnel)

10. Dans **Settings → Domains**, vous pouvez ajouter un domaine personnalisé

### Redéploiements automatiques

Chaque `git push` sur la branche `main` déclenchera automatiquement un nouveau déploiement.

---

## Étape 4 — Déployer le Scanner Worker sur Railway

1. Allez sur [railway.app/new](https://railway.app/new)
2. Cliquez sur **Deploy from GitHub repo**
3. Autorisez Railway à accéder à votre compte GitHub
4. Sélectionnez le repo `secuscan`

### Configuration du service

5. Une fois le projet créé, cliquez sur le service
6. Allez dans **Settings** :
   - **Root Directory** : Tapez `scanner-worker`
   - Railway va détecter le `Dockerfile` et le `railway.toml` automatiquement

7. Allez dans **Variables** et ajoutez vos variables d'environnement si nécessaire :

   | Variable | Valeur |
   |---|---|
   | `NODE_ENV` | `production` |
   | `SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `SUPABASE_SERVICE_KEY` | Votre clé `service_role` (depuis Supabase Dashboard) |

8. Cliquez sur **Deploy**
9. Vérifiez les logs pour confirmer que le worker démarre correctement

### Redéploiements automatiques

Comme pour Vercel, chaque `git push` déclenchera un redéploiement automatique.

---

## Étape 5 — Vérifications post-déploiement

### Frontend (Vercel)

- [ ] La page d'accueil s'affiche correctement
- [ ] La page `/login` fonctionne (inscription + connexion via Supabase)
- [ ] La page `/dashboard` redirige vers `/login` si non connecté
- [ ] Le dashboard est accessible après connexion

### Scanner Worker (Railway)

- [ ] Les logs Railway montrent le démarrage du worker
- [ ] Le rapport JSON de test s'affiche dans les logs

### Supabase

- [ ] L'inscription crée un utilisateur dans **Authentication → Users**
- [ ] La connexion fonctionne avec un utilisateur existant

---

## Structure du projet

```
secuscan/
├── frontend/              # Next.js 14 — déployé sur Vercel
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Page d'accueil
│   │   │   ├── login/page.tsx     # Connexion / Inscription
│   │   │   ├── dashboard/         # Dashboard protégé
│   │   │   └── layout.tsx         # Layout principal
│   │   ├── lib/
│   │   │   ├── supabase.ts        # Client Supabase (browser)
│   │   │   └── supabase-server.ts # Client Supabase (server)
│   │   ├── middleware.ts          # Protection des routes
│   │   └── components/ui/        # Composants ShadcnUI
│   ├── .env.local                 # Variables d'environnement
│   └── package.json
│
├── scanner-worker/        # Node.js — déployé sur Railway
│   ├── index.js           # Script de scan (simulation)
│   ├── Dockerfile         # Build Docker optimisé
│   ├── railway.toml       # Config Railway
│   └── package.json
│
├── vercel.json            # Config Vercel (pointe vers /frontend)
├── .gitignore
└── DEPLOYMENT.md          # Ce fichier
```

---

## Commandes utiles

```bash
# Développement frontend
cd frontend && npm run dev

# Exécuter le scanner worker
cd scanner-worker && node index.js

# Exécuter le scanner avec une URL spécifique
cd scanner-worker && node index.js https://monsite.com

# Build frontend (vérification avant déploiement)
cd frontend && npm run build
```
