// src/app/practice/translation/page.tsx
"use client";
import { useState } from 'react';
import { Languages, Mic, Swap, Volume2 } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japanese' },
];

export default function TranslationPage() {
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('es');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTranslate = () => {
    // Simulate translation (replace with actual API call)
    setOutputText(`Translated from ${languages.find(l => l.code === fromLang)?.name} to ${languages.find(l => l.code === toLang)?.name}:\n\n"${inputText}"`);
  };

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(outputText.split(':\n\n"')[1]?.replace('"', '') || '');
    setOutputText('');
  };

  const speak = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Languages className="w-8 h-8 text-indigo-600" /> Real-Time Translation
      </h1>
      
      <div className="max-w-4xl mx-auto">
        {/* Language Selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <select
            value={fromLang}
            onChange={(e) => setFromLang(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>

          <button 
            onClick={swapLanguages}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            <Swap className="w-5 h-5" />
          </button>

          <select
            value={toLang}
            onChange={(e) => setToLang(e.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Translation Boxes */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">
                {languages.find(l => l.code === fromLang)?.name}
              </span>
              <button 
                onClick={() => speak(inputText, fromLang)}
                disabled={!inputText || isSpeaking}
                className="p-1 text-gray-500 hover:text-indigo-600"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste text here"
              className="w-full h-40 p-2 border rounded-lg"
            />
          </div>

          <div className="border rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-500">
                {languages.find(l => l.code === toLang)?.name}
              </span>
              <button 
                onClick={() => speak(outputText.replace(/^Translated from .*:\n\n/, ''), toLang)}
                disabled={!outputText || isSpeaking}
                className="p-1 text-gray-500 hover:text-indigo-600"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full h-40 p-2 border rounded-lg bg-gray-50 overflow-y-auto">
              {outputText || 'Translation will appear here'}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleTranslate}
            disabled={!inputText}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Translate
          </button>
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium mb-2">How to use:</h3>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600">
            <li>Select source and target languages</li>
            <li>Type/paste text or use microphone</li>
            <li>Click "Translate"</li>
            <li>Listen to pronunciation with audio button</li>
          </ol>
        </div>
      </div>
    </div>
  );
}