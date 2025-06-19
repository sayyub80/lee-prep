"use client";
import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, Volume2 } from 'lucide-react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function AIPracticePage() {
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'ai'}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Recognition error', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    const userMessage = {text, sender: 'user' as const};
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    setTimeout(() => {
      const aiResponse = {
        text: `You said: "${text}"\n\nFeedback:\n- Pronunciation: 8/10\n- Grammar: 9/10\n- Suggestion: Try using more descriptive adjectives`,
        sender: 'ai' as const
      };
      setMessages(prev => [...prev, aiResponse]);
      speakResponse(aiResponse.text);
      setIsLoading(false);
    }, 1500);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = text.split('\n\nFeedback:')[0]; // Only speak the response part
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="px-25 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Bot className="w-8 h-8 text-indigo-600" /> AI Speaking Partner
      </h1>
      
      <div className="max-w-3xl mx-auto">
        <div className="border rounded-xl p-6 h-[500px] flex flex-col mb-6 bg-white">
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md p-4 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <p>{msg.text.split('\n\nFeedback:')[0]}</p>
                  {msg.sender === 'ai' && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                      {msg.text.split('\n\nFeedback:')[1]}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-4 rounded-lg w-32">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Speak or type in English..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            disabled={isLoading}
          >
            <Send className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleListening}
            className={`p-2 rounded-lg transition ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2">AI Feedback Includes:</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Pronunciation scoring</li>
            <li>Grammar corrections</li>
            <li>Vocabulary suggestions</li>
            <li>Fluency analysis</li>
          </ul>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Volume2 className="w-4 h-4" />
          <span>AI responds with voice automatically</span>
        </div>
      </div>
    </div>
  );
}