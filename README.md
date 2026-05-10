# 🎙️ PromptVoice

**Dictez vos idées, obtenez des prompts parfaits.**

Transformez votre voix en prompts structurés et prêts à l'emploi pour vos LLM préférés. PromptVoice enregistre votre discours, le transcrit, et l'affine via une IA pour produire un prompt clair, organisé et professionnel.

---

## ✨ Fonctionnalités

- **Reconnaissance vocale** — Dictez naturellement, l'app transcrit en temps réel
- **Affinage intelligent** — Correction des erreurs, structuration, mise en forme Markdown
- **Multi-providers** — Groq (ultra rapide, gratuit) ou Google Gemini
- **PWA prête à l'emploi** — Installez l'app sur votre bureau ou téléphone
- **Mode hors-ligne** — Fonctionne sans connexion après installation
- **Copie en un clic** — Résultat prêt à coller dans ChatGPT, Claude, etc.

---

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) 18+
- Un navigateur moderne (Chrome, Edge)

### 1. Cloner et installer

```bash
git clone https://github.com/Visitune/promptvoice.git
cd promptvoice
npm install
```

### 2. Lancer l'application

```bash
npm run dev
```

Ouvrez **http://localhost:3000**

### 3. Configurer une clé API

Cliquez sur l'icône ⚙️ dans l'application et choisissez votre fournisseur :

#### ⚡ Groq (recommandé — gratuit)

1. Allez sur [console.groq.com/keys](https://console.groq.com/keys)
2. Créez un compte (gratuit, sans carte bancaire)
3. Générez une clé API
4. Collez-la dans l'application

| Modèle | Vitesse | Usage |
|--------|---------|-------|
| Llama 3.3 70B | 280 tok/s | Le plus puissant |
| GPT OSS 20B | 1000 tok/s | Le plus rapide |
| Llama 3.1 8B | 560 tok/s | Bon équilibre |
| GPT OSS 120B | 500 tok/s | Polyvalent |

#### 🔮 Google Gemini (alternative)

1. Allez sur [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Générez une clé API (offert avec quota gratuit)
4. Collez-la dans l'application

---

## 📱 Installer l'application (PWA)

PromptVoice est une **Progressive Web App** — vous pouvez l'installer comme une vraie application.

### Depuis le serveur de développement

```bash
npm run dev
# ou
npm run build && npm run preview
```

Puis dans Chrome/Edge :
1. Ouvrez l'URL affichée
2. Cliquez sur l'icône 📥 dans la barre d'adresse
3. Cliquez sur **Installer**

L'application sera disponible :
- Dans votre menu Démarrer / Applications
- Hors-ligne (après première visite)
- En mode fenêtré (standalone)

---

## 🎯 Utilisation

1. **Cliquez sur le micro** 🎤 pour commencer l'enregistrement
2. **Dictez votre idée** — Phrase naturelle, mots-clés, tout fonctionne
3. **Cliquez sur ✨** pour affiner avec l'IA
4. **Copiez le prompt** 📋 obtenu, prêt à être utilisé

### Exemple

```
🎤 "jvé cré un script python ki lit un fichier CSV et qu'il affiche les stats
de basse comme la moyenne ékart type et tout"

✨ Résultat :
```

```markdown
Crée un script Python complet pour analyser un fichier CSV avec les fonctionnalités suivantes :

1. Lecture automatique du fichier CSV (avec détection du séparateur)
2. Affichage des statistiques descriptives :
   - Moyenne
   - Écart-type
   - Minimum et maximum
   - Médiane et quartiles
3. Gestion des colonnes numériques et catégorielles

Le script doit être robuste, avec gestion d'erreurs et affichage formaté des résultats.
```

---

## 🛠️ Commandes

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement (port 3000) |
| `npm run build` | Génère les icônes + build de production |
| `npm run preview` | Prévisualise le build de production |
| `npm run icons` | Génère les icônes PWA uniquement |
| `npm run lint` | Vérifie le code TypeScript |

---

## 🏗️ Déploiement

```bash
npm run build
```

Le dossier `dist/` peut être déployé sur n'importe quel hébergeur :

- **Vercel** : `npx vercel --prod`
- **Netlify** : Drag & drop du dossier `dist/`
- **GitHub Pages** : via `gh-pages`

---

## 🧰 Stack technique

| Technologie | Usage |
|-------------|-------|
| React 19 | UI |
| TypeScript | Typage |
| Vite 6 | Bundler / Dev server |
| Tailwind CSS 4 | Styles |
| vite-plugin-pwa | PWA + Service Worker |
| Groq API | LLM (gratuit) |
| Google Gen AI | LLM (alternative) |
| Web Speech API | Reconnaissance vocale |
| Lucide React | Icônes |
| Motion (Framer Motion) | Animations |
| React Markdown | Rendu Markdown |

---

## 📄 Licence

Apache 2.0 — voir [LICENSE](LICENSE)

---

<div align="center">
  <p>
    <a href="https://github.com/Visitune/promptvoice/issues">Signaler un bug</a>
    ·
    <a href="https://github.com/Visitune/promptvoice/issues">Proposer une idée</a>
  </p>
</div>
