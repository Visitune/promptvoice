# PromptVoice

Dictez vos idées, obtenez des prompts parfaits.

## Installation rapide

```bash
npm install
npm run dev
```

Ouvrez http://localhost:3000 et configurez votre clé API.

## Clés API gratuites

### Groq (Recommandé - Ultra rapide)
1. Allez sur [console.groq.com/keys](https://console.groq.com/keys)
2. Créez un compte gratuit
3. Générez une clé API
4. Collez-la dans l'app

**Gratuit avec des quotas généreux** :
- Llama 3.3 70B : excellent pour les prompts complexes
- Llama 3.1 8B : le plus rapide
- Mixtral 8x7B : bon équilibre

### Google Gemini (Alternative)
1. Allez sur [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Créez un compte Google
3. Générez une clé API
4. Collez-la dans l'app

## Utilisation

1. **Cliquez sur le micro** pour enregistrer votre voix
2. **Cliquez sur l'éclair** pour améliorer avec l'IA
3. **Copiez** le prompt généré

## Déploiement

```bash
npm run build
npm run preview
```

Le dossier `dist/` peut être déployé sur n'importe quel hébergeur statique (Vercel, Netlify, GitHub Pages, etc.).