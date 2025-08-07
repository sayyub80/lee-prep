"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
// Corrected: Replaced Female with UserRound, which exists in the library
import { Languages, Mic, ArrowRightLeft, User, UserRound } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// --- Language Options ---
const languages = [
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
];

// --- Main Component ---
export default function RealTimeTranslationPage() {
  const [lang1, setLang1] = useState(languages[0]);
  const [lang2, setLang2] = useState(languages[1]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [activeLang, setActiveLang] = useState<'lang1' | 'lang2' | null>(null);
  
  const [preferredVoice, setPreferredVoice] = useState<'female' | 'male'>('female');
  const availableVoices = useRef<{ female: SpeechSynthesisVoice | null, male: SpeechSynthesisVoice | null }>({ female: null, male: null });

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const statusRef = useRef(status);
  statusRef.current = status;

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length === 0) return;

      const targetLangCode = activeLang === 'lang1' ? lang2.code : lang1.code;
      
      availableVoices.current.female = allVoices.find(v => 
        v.lang === targetLangCode && v.name.toLowerCase().includes('female')
      ) || allVoices.find(v => v.lang.startsWith(targetLangCode.split('-')[0]) && v.name.toLowerCase().includes('female')) || null;
      
      availableVoices.current.male = allVoices.find(v => 
        v.lang === targetLangCode && v.name.toLowerCase().includes('male')
      ) || allVoices.find(v => v.lang.startsWith(targetLangCode.split('-')[0]) && v.name.toLowerCase().includes('male')) || null;
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
        window.speechSynthesis.onvoiceschanged = null;
    };
  }, [lang1, lang2, activeLang]);


  const speak = useCallback((text: string, langCode: string) => {
    setStatus('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 1;
    utterance.pitch = 1;
    
    const voiceToUse = availableVoices.current[preferredVoice];
    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }
    
    utterance.onend = () => setStatus('idle');
    window.speechSynthesis.speak(utterance);
  }, [preferredVoice]);

  const handleTranslate = useCallback(async (text: string, fromLang: 'lang1' | 'lang2') => {
    setStatus('processing');
    const source = fromLang === 'lang1' ? lang1 : lang2;
    const target = fromLang === 'lang1' ? lang2 : lang1;
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang: source.name, targetLang: target.name }),
      });
      if (!response.ok) throw new Error('Translation API failed');
      const data = await response.json();
      if (data.translatedText) {
        setTranslation(data.translatedText);
        speak(data.translatedText, target.code);
      } else { throw new Error('No translated text received.'); }
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  }, [lang1, lang2, speak]);

  const handleListen = useCallback((language: 'lang1' | 'lang2') => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    const selectedLang = language === 'lang1' ? lang1 : lang2;
    
    recognition.lang = selectedLang.code;
    recognition.interimResults = true;
    recognition.continuous = false;

    setActiveLang(language);
    setStatus('listening');
    setTranscript('');
    setTranslation('');
    finalTranscriptRef.current = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = () => setStatus('idle');

    recognition.onend = () => {
      if (statusRef.current === 'listening') {
        if (finalTranscriptRef.current.trim()) {
            handleTranslate(finalTranscriptRef.current, language);
        } else {
            setStatus('idle'); 
        }
      }
      recognitionRef.current = null;
    };
    
    recognition.start();

  }, [lang1, lang2, handleTranslate]);
  
  const swapLanguages = () => { setLang1(lang2); setLang2(lang1); };

  const getStatusText = () => {
    const activeLanguageName = activeLang === 'lang1' ? lang1.name : lang2.name;
    switch (status) {
      case 'listening': return `Listening in ${activeLanguageName}...`;
      case 'processing': return `Translating...`;
      case 'speaking': return `Speaking in ${activeLang === 'lang1' ? lang2.name : lang1.name}...`;
      default: return 'Select a language and press the mic to start';
    }
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-[#0a092d] text-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Languages className="w-8 h-8"/> Real-Time Voice Translation
        </h1>
        <p className="text-lg text-gray-400">Speak in one language, hear it in another.</p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <select value={lang1.code} onChange={e => setLang1(languages.find(l => l.code === e.target.value)!)} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-lg">
          {languages.map(lang => <option key={lang.code} value={lang.code} className="text-black">{lang.name}</option>)}
        </select>
        <Button onClick={swapLanguages} variant="ghost" size="icon" className="w-12 h-12 rounded-full hover:bg-white/20">
          <ArrowRightLeft className="w-6 h-6"/>
        </Button>
        <select value={lang2.code} onChange={e => setLang2(languages.find(l => l.code === e.target.value)!)} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-lg">
          {languages.map(lang => <option key={lang.code} value={lang.code} className="text-black">{lang.name}</option>)}
        </select>
      </div>
      
      <div className="flex items-center gap-2 mb-8 bg-black/20 p-1 rounded-full">
        <Button onClick={() => setPreferredVoice('female')} variant="ghost" size="sm" className={`rounded-full transition-colors ${preferredVoice === 'female' ? 'bg-purple-500' : ''}`}>
            {/* Corrected: Replaced Female with UserRound */}
            <UserRound className="mr-2 w-4 h-4"/> Female Voice
        </Button>
        <Button onClick={() => setPreferredVoice('male')} variant="ghost" size="sm" className={`rounded-full transition-colors ${preferredVoice === 'male' ? 'bg-purple-500' : ''}`}>
            <User className="mr-2 w-4 h-4"/> Male Voice
        </Button>
      </div>
      
      <div className="relative w-80 h-80 flex items-center justify-center mb-8">
        <motion.div
            className="absolute w-full h-full bg-gradient-to-br from-purple-500 to-cyan-400 rounded-full blur-2xl"
            animate={{ scale: status !== 'idle' ? 1.1 : 1, opacity: status !== 'idle' ? 0.8 : 0.6 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10, repeat: status !== 'idle' ? Infinity : 0, repeatType: 'reverse', duration: 1.5 }}
        />
        <motion.div className="absolute w-[98%] h-[98%] border-2 border-cyan-300/50 rounded-full" animate={{rotate: 360}} transition={{repeat: Infinity, duration: 20, ease: 'linear'}}/>
        <motion.div className="absolute w-[95%] h-[95%] border-2 border-purple-400/50 rounded-full" animate={{rotate: -360}} transition={{repeat: Infinity, duration: 15, ease: 'linear'}}/>
        <div className="z-10 text-center px-4">
            <h2 className={`text-2xl font-semibold mb-2`}>{getStatusText()}</h2>
            <p className="text-lg text-gray-300 min-h-[56px]">{transcript}</p>
            <p className="text-xl font-bold text-cyan-300 min-h-[30px]">{translation}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
            <Button onClick={() => handleListen('lang1')} size="lg" className={`w-24 h-24 rounded-full border border-white/30 hover:border-white disabled:opacity-50 transition-all duration-300 ${status === 'listening' && activeLang === 'lang1' ? 'bg-red-500' : 'bg-gradient-to-br from-white/20 to-white/5'}`}>
                <Mic className="w-10 h-10"/>
            </Button>
            <span className="mt-4 text-lg font-semibold">{lang1.name}</span>
        </div>
        <div className="flex flex-col items-center">
            <Button onClick={() => handleListen('lang2')} size="lg" className={`w-24 h-24 rounded-full border border-white/30 hover:border-white disabled:opacity-50 transition-all duration-300 ${status === 'listening' && activeLang === 'lang2' ? 'bg-red-500' : 'bg-gradient-to-br from-white/20 to-white/5'}`}>
                <Mic className="w-10 h-10"/>
            </Button>
            <span className="mt-4 text-lg font-semibold">{lang2.name}</span>
        </div>
      </div>
    </div>
  );
}