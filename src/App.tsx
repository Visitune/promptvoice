/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Square, Copy, Check, RotateCcw, Sparkles, Loader2, Info, Settings, Key, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';

const GROQ_MODELS = [
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (560 tok/s - ultra rapide)", speed: 560 },
  { id: "openai/gpt-oss-20b", name: "GPT OSS 20B (1000 tok/s - le plus rapide)", speed: 1000 },
  { id: "openai/gpt-oss-120b", name: "GPT OSS 120B (500 tok/s)", speed: 500 },
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (280 tok/s - plus puissant)", speed: 280 },
];

const PROVIDERS = [
  { id: "groq", name: "Groq", color: "from-red-500 to-orange-500", models: GROQ_MODELS, icon: "⚡", website: "https://console.groq.com/keys" },
  { id: "gemini", name: "Google Gemini", color: "from-blue-500 to-purple-500", models: [{ id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" }, { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" }], icon: "🔮", website: "https://aistudio.google.com/app/apikey" },
];

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinedOutput, setRefinedOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('llm_api_key') || '');
  const [provider, setProvider] = useState(() => localStorage.getItem('llm_provider') || 'groq');
  const [model, setModel] = useState(() => localStorage.getItem('llm_model') || 'llama-3.3-70b-versatile');
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const currentProvider = PROVIDERS.find(p => p.id === provider)!;
  const currentModels = currentProvider.models;

  const saveSettings = (newProvider: string, newModel: string, newKey: string) => {
    localStorage.setItem('llm_provider', newProvider);
    localStorage.setItem('llm_model', newModel);
    localStorage.setItem('llm_api_key', newKey);
    setProvider(newProvider);
    setModel(newModel);
    setApiKey(newKey);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR'; // Default to French as requested

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Permission micro refusée. Veuillez autoriser l\'accès au microphone.');
        } else {
          setError(`Erreur: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError('Désolé, votre navigateur ne supporte pas la reconnaissance vocale.');
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setRefinedOutput('');
      setError(null);
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleRefine = async () => {
    if (!transcript.trim()) return;

    if (!apiKey) {
      setError("Veuillez configurer votre clé API dans les paramètres.");
      setShowSettings(true);
      return;
    }

    setIsRefining(true);
    setRefinedOutput('');
    setError(null);

    try {
      const systemPrompt = `Tu es un assistant expert en rédaction de prompts pour LLM. 
Ta tâche est de transformer une transcription vocale (qui peut contenir des erreurs phonétiques ou des répétitions) en une instruction détaillée, structurée et parfaitement intelligible.

RÈGLES :
1. Corrige les fautes de frappe et les erreurs de transcription vocale.
2. Structure le contenu avec des titres, des listes à puces ou des blocs de code si nécessaire.
3. Garde l'intention originale de l'utilisateur mais rends-la plus précise.
4. Le résultat doit être en Markdown, prêt à être copié-collé comme prompt final pour une autre IA.`;

      let result = '';

      if (provider === 'groq') {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Transcription brute : "${transcript}"` }
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error?.message || 'Erreur API Groq');
        }

        const data = await response.json();
        result = data.choices[0].message.content;
      } else {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: model,
          contents: `${systemPrompt}\n\nTranscription brute : "${transcript}"`,
        });
        result = response.text || '';
      }

      setRefinedOutput(result);
    } catch (err) {
      console.error(err);
      setError(`Erreur: ${err instanceof Error ? err.message : "Erreur lors de l'affinage par l'IA."}`);
    } finally {
      setIsRefining(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = refinedOutput || transcript;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setTranscript('');
    setRefinedOutput('');
    setError(null);
    setIsRecording(false);
    recognitionRef.current?.abort();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-2xl mb-12 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-2"
        >
          <div className="bg-[#5A5A40] p-2 rounded-xl text-white shadow-lg shadow-[#5A5A40]/20">
            <Mic size={24} />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">PromptVoice</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="ml-4 p-2 rounded-lg hover:bg-[#5A5A40]/10 transition-colors text-[#5A5A40]/60 hover:text-[#5A5A40]"
            title="Paramètres"
          >
            <Settings size={20} />
          </button>
        </motion.div>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mt-4 bg-white rounded-2xl border border-[#E6E6E1] p-6 shadow-sm"
            >
              <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
                <Key size={18} className="text-[#5A5A40]" />
                Configuration LLM
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5A5A40] mb-2">Fournisseur</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROVIDERS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          const newProvider = p;
                          saveSettings(p.id, p.models[0].id, apiKey);
                        }}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-left",
                          provider === p.id
                            ? "border-[#5A5A40] bg-[#5A5A40]/5"
                            : "border-[#E6E6E1] hover:border-[#5A5A40]/30"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{p.icon}</span>
                          <span className="font-medium text-sm">{p.name}</span>
                        </div>
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#8E9289] hover:text-[#5A5A40] underline"
                          onClick={e => e.stopPropagation()}
                        >
                          Obtenir une clé gratuite →
                        </a>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5A5A40] mb-2">Modèle</label>
                  <div className="relative">
                    <select
                      value={model}
                      onChange={e => saveSettings(provider, e.target.value, apiKey)}
                      className="w-full p-3 rounded-xl border border-[#E6E6E1] bg-white appearance-none cursor-pointer pr-10"
                    >
                      {currentModels.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E9289] pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5A5A40] mb-2">Clé API</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => saveSettings(provider, model, e.target.value)}
                    placeholder="gsk_xxxxxxxxxxxx"
                    className="w-full p-3 rounded-xl border border-[#E6E6E1] bg-white font-mono text-sm"
                  />
                </div>

                {provider === 'groq' && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm">
                    <p className="text-green-700 font-medium mb-1">⚡ Groq est ultra rapide et gratuit</p>
                    <p className="text-green-600">Gratuit avec des quotas généreux. Llama 3.3 70B est excellent pour les prompts complexes.</p>
                  </div>
                )}

                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full p-3 bg-[#5A5A40] text-white rounded-xl font-medium hover:bg-[#4A4A30] transition-colors"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-[#5A5A40] font-medium italic opacity-80">
          Dictez vos idées, obtenez des prompts parfaits.
        </p>
      </header>

      <main className="w-full max-w-2xl flex flex-col gap-8 flex-1">
        {/* Record Section */}
        <section className={cn(
          "bg-white rounded-[32px] p-8 shadow-sm border border-[#E6E6E1] relative overflow-hidden transition-all duration-500",
          isRecording && "ring-2 ring-red-500/20 border-red-200"
        )}>
          {/* Status Label */}
          <div className="flex items-center gap-2 mb-6">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isRecording ? "bg-red-500 animate-pulse" : "bg-[#5A5A40]/30"
            )} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E9289]">
              {isRecording ? "Enregistrement en cours..." : "Prêt à enregistrer"}
            </span>
          </div>

          {/* Transcript Area */}
          <div className="min-h-[120px] mb-8">
            <AnimatePresence mode="wait">
              {transcript ? (
                <motion.p 
                  key="transcript"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg leading-relaxed font-serif text-[#1A1A1A]"
                >
                  {transcript}
                </motion.p>
              ) : (
                <motion.p 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  className="text-lg italic font-serif"
                >
                  "Crée un script Python pour analyser ces données..."
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm"
            >
              <Info className="shrink-0 mt-0.5" size={16} />
              <p>{error}</p>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={reset}
              className="p-4 rounded-full border border-[#E6E6E1] text-[#5A5A40] hover:bg-[#F5F5F0] transition-colors"
              title="Réinitialiser"
            >
              <RotateCcw size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleRecording}
              className={cn(
                "relative group flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-2xl",
                isRecording 
                  ? "bg-red-500 text-white shadow-red-500/40" 
                  : "bg-[#1A1A1A] text-white shadow-black/40"
              )}
            >
              {isRecording ? (
                <Square size={28} fill="currentColor" />
              ) : (
                <Mic size={28} />
              )}
              
              {/* Outer pulse */}
              {isRecording && (
                <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-25" />
              )}
            </motion.button>

            <motion.button
              disabled={!transcript || isRecording}
              whileTap={{ scale: 0.9 }}
              onClick={handleRefine}
              className={cn(
                "p-4 rounded-full border border-[#E6E6E1] text-[#5A5A40] transition-all",
                (!transcript || isRecording) ? "opacity-30 cursor-not-allowed" : "hover:bg-[#F5F5F0] text-purple-600 border-purple-100 bg-purple-50"
              )}
              title="Améliorer avec l'IA"
            >
              {isRefining ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Sparkles size={20} />
              )}
            </motion.button>
          </div>
        </section>

        {/* Output Section */}
        {(refinedOutput || (transcript && !isRecording)) && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[32px] p-8 shadow-sm border border-[#E6E6E1] relative"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  refinedOutput ? "bg-purple-100 text-purple-600" : "bg-[#F5F5F0] text-[#5A5A40]"
                )}>
                  {refinedOutput ? <Sparkles size={14} /> : <Mic size={14} />}
                </div>
                <h2 className="font-serif font-bold text-lg">
                  {refinedOutput ? "Prompt optimisé" : "Transcription brute"}
                </h2>
              </div>

              <button
                onClick={copyToClipboard}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium",
                  copied 
                    ? "bg-green-50 text-green-600 border border-green-100" 
                    : "bg-[#1A1A1A] text-white hover:bg-black/80"
                )}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>

            <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-p:font-serif text-[#4A4A4A]">
              {refinedOutput ? (
                <div className="markdown-body">
                  <ReactMarkdown>
                    {refinedOutput}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="font-serif">{transcript}</p>
              )}
            </div>
          </motion.section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 flex flex-col items-center gap-4">
        <p className="text-[#8E9289] text-[10px] uppercase tracking-widest">
          Propulsé par {currentProvider?.icon} {currentProvider?.name} • {new Date().getFullYear()} PromptVoice
        </p>
        <div className="flex items-center gap-2 bg-[#5A5A40]/5 px-3 py-1 rounded-full border border-[#5A5A40]/10">
          <Info size={12} className="text-[#5A5A40]" />
          <p className="text-[10px] text-[#5A5A40]">
            Conseil : Installez cette application via votre navigateur pour l'utiliser hors-ligne.
          </p>
        </div>
      </footer>
    </div>
  );
}
