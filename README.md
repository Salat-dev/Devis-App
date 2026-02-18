# 📄 Devis App — Documentation

Application de facturation et devis professionnels, construite avec HTML/CSS/JS vanilla et Supabase.

---

## 🗂️ Structure du projet

```
devis-pro/
├── index.html          ← Landing page (point d'entrée)
├── vercel.json         ← Configuration Vercel (headers, rewrites)
├── .gitignore
├── public/
│   └── img/            ← Screenshots et images de la landing page
│       ├── im1.png
│       ├── im2.png
│       └── im3.png
└── app/                ← Application (pages connectées à Supabase)
    ├── shared.css      ← Styles communs (responsive, composants)
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── quotes.html
    ├── create-quote.html
    ├── edit-quote.html
    ├── view-quote.html
    ├── clients.html
    └── settings.html
```

---

## 🚀 Déploiement sur Vercel (Aujourd'hui)

### Prérequis
- Compte GitHub (gratuit)
- Compte Vercel (gratuit)
- Git installé sur votre machine

### Étape 1 — Initialiser Git

```bash
# Ouvrir un terminal dans le dossier devis-pro/
cd devis-pro

git init
git add .
git commit -m "🚀 Initial commit — Devis App MVP"
```

### Étape 2 — Pousser sur GitHub

```bash
# Créer un repo sur github.com, puis :
git remote add origin https://github.com/VOTRE_USERNAME/devis-app.git
git branch -M main
git push -u origin main
```

### Étape 3 — Déployer sur Vercel

**Option A — Via l'interface Vercel (recommandé)**
1. Aller sur [vercel.com](https://vercel.com) → "Add New Project"
2. Connecter votre repo GitHub `devis-app`
3. Laisser tous les paramètres par défaut (Framework: Other)
4. Cliquer **Deploy** ✅

**Option B — Via CLI Vercel**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Ou en production directe :
vercel --prod
```

### Étape 4 — Vérifier le déploiement

Une fois déployé, votre app sera accessible sur :
- Landing page : `https://devis-app-xxx.vercel.app/`
- Login : `https://devis-app-xxx.vercel.app/app/login.html`
- Dashboard : `https://devis-app-xxx.vercel.app/app/dashboard.html`

---

## 🔄 Workflow pour les mises à jour futures

```bash
# Après chaque modification :
git add .
git commit -m "✨ Description des changements"
git push

# Vercel re-déploie automatiquement en quelques secondes ✅
```

---

## 🛠️ Stack technique

| Technologie | Rôle |
|-------------|------|
| HTML/CSS/JS | Frontend 100% vanilla |
| Supabase | Base de données & authentification |
| Vercel | Hébergement statique (CDN mondial) |
| Lucide Icons | Icônes |
| Google Fonts (Syne + DM Sans) | Typographies |

---

## 📱 Compatibilité responsive

L'application est optimisée pour :
- 📺 4K / 2K (2560px+)
- 💻 Desktop (1280px+)
- 💻 Laptop (1024px)
- 📱 Tablette (768px)
- 📱 Mobile (480px)
- 📱 Petit mobile (380px)
- ⌚ Montres connectées (< 200px)

---

## 🔐 Sécurité

- Headers de sécurité configurés dans `vercel.json`
- Authentification gérée par Supabase (JWT)
- Aucune donnée sensible dans le code source

---

## 📧 Support

Pour toute question, ouvrir une issue sur GitHub.
# Devis-App
