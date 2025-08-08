"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Languages, Mic, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const languages = [
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'mr-IN', name: 'Marathi' },
  { code: 'bn-IN', name: 'Bengali' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'kn-IN', name: 'Kannada' },
  { code: 'ml-IN', name: 'Malayalam' },
  { code: 'pa-IN', name: 'Punjabi' },
  { code: 'ur-IN', name: 'Urdu' },
];

export default function RealTimeTranslationPage() {
  const [lang1, setLang1] = useState(languages[0]);
  const [lang2, setLang2] = useState(languages[6]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [activeLang, setActiveLang] = useState<'lang1' | 'lang2' | null>(null);
  const [error, setError] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = useCallback((text: string, langCode: string, langName: string) => {
    const voiceForLang = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (!voiceForLang) {
      setError(`No voice available for ${langName} on your system.`);
      setStatus('idle');
      return;
    }
    setStatus('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceForLang;
    utterance.lang = langCode;
    utterance.onend = () => setStatus('idle');
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const handleTranslate = useCallback(async (text: string, fromLang: 'lang1' | 'lang2') => {
    if (!text.trim()) {
        setStatus('idle');
        return;
    }
    setStatus('processing');
    setError('');
    const source = fromLang === 'lang1' ? lang1 : lang2;
    const target = fromLang === 'lang1' ? lang2 : lang1;
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang: source.name, targetLang: target.name }),
      });
      if (!response.ok) { const errData = await response.json(); throw new Error(errData.error || 'Translation API failed'); }
      const data = await response.json();
      if (data.translatedText) {
        setTranslation(data.translatedText);
        speak(data.translatedText, target.code, target.name);
      } else { throw new Error('No translated text received.'); }
    } catch (err: any) {
      setError(err.message || "Sorry, translation failed.");
      setStatus('idle');
    }
  }, [lang1, lang2, speak]);

  const handleListen = useCallback((language: 'lang1' | 'lang2') => {
    // This is the key change: If we are already listening, stop it.
    if (status === 'listening') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    
    const selectedLang = language === 'lang1' ? lang1 : lang2;
    
    const startSound = new Audio('/audio/start-sound.mp3');
    startSound.play().catch(e => console.error("Could not play audio cue:", e));
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = selectedLang.code;
    recognition.interimResults = true;
    recognition.continuous = true; // Stay listening until stopped

    setActiveLang(language);
    setStatus('listening');
    setTranscript('');
    setTranslation('');
    setError('');
    finalTranscriptRef.current = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      finalTranscriptRef.current = ''; // Reset on new result to build the final string
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') setError("I didn't hear that. Please try again.");
      else setError("Microphone error. Please check permissions.");
      setStatus('idle');
    };

    recognition.onend = () => {
      // This now correctly runs only when stop() is called
      handleTranslate(finalTranscriptRef.current, language);
      recognitionRef.current = null;
    };
    
    recognition.start();

  }, [status, lang1, lang2, handleTranslate]);
  
  const swapLanguages = () => { setLang1(lang2); setLang2(lang1); };

  const getStatusText = () => {
    if (error) return error;
    const activeLanguageName = activeLang === 'lang1' ? lang1.name : lang2.name;
    switch (status) {
      case 'listening': return `Listening in ${activeLanguageName}... (Click mic to stop)`;
      case 'processing': return `Translating...`;
      case 'speaking': return `Speaking in ${activeLang === 'lang1' ? lang2.name : lang1.name}...`;
      default: return 'Select a language and press the mic to start';
    }
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#0a092d] text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Languages className="w-8 h-8"/> Real-Time Voice Translation
        </h1>
        <p className="text-lg text-gray-400">Speak in one language, hear it in another.</p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-12">
        <select value={lang1.code} onChange={e => setLang1(languages.find(l => l.code === e.target.value)!)} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-lg hover:border-white/50 transition-colors">
          {languages.map(lang => <option key={lang.code} value={lang.code} className="text-black">{lang.name}</option>)}
        </select>
        <Button onClick={swapLanguages} variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-white/20 transition-transform hover:scale-110">
          <ArrowRightLeft className="w-6 h-6"/>
        </Button>
        <select value={lang2.code} onChange={e => setLang2(languages.find(l => l.code === e.target.value)!)} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-lg hover:border-white/50 transition-colors">
          {languages.map(lang => <option key={lang.code} value={lang.code} className="text-black">{lang.name}</option>)}
        </select>
      </div>
      
      <div className="relative w-80 h-80 flex items-center justify-center mb-8">
        <motion.div className="absolute w-full h-full bg-gradient-to-br from-purple-500 to-cyan-400 rounded-full blur-2xl" animate={{ scale: status !== 'idle' ? 1.1 : 1, opacity: status !== 'idle' ? 0.8 : 0.6 }} transition={{ type: 'spring', stiffness: 100, damping: 10, repeat: status !== 'idle' ? Infinity : 0, repeatType: 'reverse', duration: 1.5 }}/>
        <motion.div className="absolute w-[98%] h-[98%] border-2 border-cyan-300/50 rounded-full" animate={{rotate: 360}} transition={{repeat: Infinity, duration: 20, ease: 'linear'}}/>
        <motion.div className="absolute w-[95%] h-[95%] border-2 border-purple-400/50 rounded-full" animate={{rotate: -360}} transition={{repeat: Infinity, duration: 15, ease: 'linear'}}/>
        <div className="z-10 text-center px-4"><h2 className={`text-2xl font-semibold mb-2 ${error ? 'text-yellow-400' : ''}`}>{getStatusText()}</h2><p className="text-lg text-gray-300 min-h-[56px]">{transcript}</p><p className="text-xl font-bold text-cyan-300 min-h-[30px]">{translation}</p></div>
      </div>
      
      <div className="flex items-center gap-16">
        <div className="flex flex-col items-center">
            <Button onClick={() => handleListen('lang1')} disabled={status !== 'idle' && status !== 'listening'} size="lg" className={`w-24 h-24 rounded-full border border-white/30 hover:border-white transition-all duration-300 hover:scale-105 ${status === 'listening' && activeLang === 'lang1' ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-br from-white/20 to-white/5'}`}>
                <Mic className="w-10 h-10"/>
            </Button>
            <span className="mt-4 text-lg font-semibold">{lang1.name}</span>
        </div>
        <div className="flex flex-col items-center">
            <Button onClick={() => handleListen('lang2')} disabled={status !== 'idle' && status !== 'listening'} size="lg" className={`w-24 h-24 rounded-full border border-white/30 hover:border-white transition-all duration-300 hover:scale-105 ${status === 'listening' && activeLang === 'lang2' ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-br from-white/20 to-white/5'}`}>
                <Mic className="w-10 h-10"/>
            </Button>
            <span className="mt-4 text-lg font-semibold">{lang2.name}</span>
        </div>
      </div>
    </div>
  );
}