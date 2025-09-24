'use client';
import { useState, useRef, useEffect } from "react";
import { Mic, Send, Volume2, VolumeX, Loader2, Info, Sparkles, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AIPersona } from "@/lib/ai-personas";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

interface AIChatInterfaceProps {
    persona: AIPersona;
    onGoBack: () => void;
}

export const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ persona, onGoBack }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai" }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [conversationFeedback, setConversationFeedback] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
            if (!recognitionRef.current) {
                const recognition = new window.webkitSpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = "en-US";
                recognition.onstart = () => setIsListening(true);
                recognition.onresult = (event: any) => handleSend(event.results[0][0].transcript);
                recognition.onerror = () => setIsListening(false);
                recognition.onend = () => setIsListening(false);
                recognitionRef.current = recognition;
            }
        }
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
            if(audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
    };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    const userMessage = { text, sender: "user" as const };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsAiSpeaking(true); // Set speaking status immediately

    // Clean up any previous audio that might be playing
    if (audioSourceRef.current) audioSourceRef.current.stop();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();

    try {
        const history = [...messages, userMessage].map((m) => ({ role: m.sender === "user" ? "user" : "ai", content: m.text }));
        
        // --- SINGLE, OPTIMIZED API CALL ---
        const response = await fetch("/api/ai-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, history, user, personaPrompt: persona.prompt }),
        });

        if (!response.ok) throw new Error("API request failed");

        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('audio/mpeg')) {
            // --- Success: Received audio stream ---
            const aiText = decodeURIComponent(response.headers.get('X-AI-Response-Text') || 'Sorry, I had trouble speaking.');
            const aiResponse = { text: aiText, sender: "ai" as const };
            
            // Display text and play audio simultaneously
            setMessages((prev) => [...prev, aiResponse]);
            
            if (!isMuted) {
                const audioData = await response.arrayBuffer();
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContextRef.current.createBufferSource();
                audioSourceRef.current = source;
                source.buffer = await audioContextRef.current.decodeAudioData(audioData);
                source.connect(audioContextRef.current.destination);
                source.start(0);
                source.onended = () => setIsAiSpeaking(false);
            } else {
                setIsAiSpeaking(false);
            }

        } else {
            
            const data = await response.json();
            const aiResponse = { text: data.text || "Sorry, I couldn't process that.", sender: "ai" as const };
            setMessages((prev) => [...prev, aiResponse]);
            setIsAiSpeaking(false);
        }
        
    } catch (err) {
        console.error("Error in handleSend:", err);
        setMessages((prev) => [...prev, { text: "Sorry, something went wrong.", sender: "ai" as const }]);
        setIsAiSpeaking(false);
    } finally {
        setIsLoading(false);
    }
};
    const speakResponse = async (text: string) => {
        if (!text || isMuted) return;

        setIsAiSpeaking(true);

        if (audioSourceRef.current) {
           audioSourceRef.current.stop();
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
           audioContextRef.current.close();
        }

        try {
            // --- THIS IS THE ONLY LINE THAT CHANGES ---
            const response = await fetch('/api/tts/elevenlabs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.split("\n\nFeedback:")[0] }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`Failed to fetch audio: ${response.statusText}`);
            }

            const audioData = await response.arrayBuffer();
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContextRef.current.createBufferSource();
            audioSourceRef.current = source;
            source.buffer = await audioContextRef.current.decodeAudioData(audioData);
            source.connect(audioContextRef.current.destination);
            source.start(0);

            source.onended = () => {
                setIsAiSpeaking(false);
            };

        } catch (error) {
            console.error("Error playing ElevenLabs audio:", error);
            setIsAiSpeaking(false);
        }
    };
    
    const handleShowFeedback = async () => {
        setShowFeedback(true);
        setConversationFeedback("Loading...");
        try {
            const history = messages.map((m) => ({ role: m.sender === "user" ? "user" : "ai", content: m.text }));
            const res = await fetch("/api/ai-chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: "Please give me a summary feedback for my English in this conversation. Tell me what I did well and what I should improve. Be specific and encouraging. Format the feedback as:\n\nWhat you did well:\n- ...\n\nWhat to improve:\n- ...",
                history,
                personaPrompt: "You are a helpful feedback assistant, summarizing a student's performance."
              }),
            });
            const data = await res.json();
            setConversationFeedback(data.text || "Sorry, feedback could not be generated.");
        } catch {
          setConversationFeedback("Sorry, feedback could not be generated.");
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-white overflow-hidden">
            <div className="relative z-10 max-w-2xl w-full mx-auto bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-0 md:p-6 flex flex-col border border-indigo-100 my-4">
                <header className="flex items-center gap-4 px-6 pt-6 pb-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10" onClick={onGoBack}>
                        <ArrowLeft className="w-5 h-5"/>
                    </Button>
                    <span className={`p-2 rounded-lg ${persona.bgColor}/10`}>
                        <div className={`w-8 h-8 ${persona.textColor}`}>{persona.avatar}</div>
                    </span>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                            {persona.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">{persona.description}</p>
                    </div>
                    <button
                        className={`ml-auto p-2 rounded-lg transition ${isMuted ? "bg-gray-300 text-gray-600" : "bg-blue-100 text-blue-700"}`}
                        onClick={() => {
                            setIsMuted((prev) => !prev);
                            if (!isMuted && audioSourceRef.current) {
                                audioSourceRef.current.stop();
                            }
                        }}
                        title={isMuted ? "Unmute AI" : "Mute AI"}
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </header>

                <div ref={chatContainerRef} className="flex-1 flex flex-col overflow-hidden px-4 py-4 space-y-4" style={{ maxHeight: "450px", minHeight: "400px", overflowY: "auto" }}>
                     {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in">
                            <div className="w-12 h-12 mb-2">{persona.avatar}</div>
                            <span>Say hello to start chatting with {persona.name}!</span>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-md ${msg.sender === "user" ? "bg-indigo-500 text-white" : "bg-white text-gray-800"}`}>
                        <p className="whitespace-pre-line">{msg.text.split("\n\nFeedback:")[0]}</p>
                        </div>
                    </div>
                    ))}
                    {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl w-32 flex items-center gap-2 border border-indigo-100">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        <span className="text-sm text-gray-500">Typing...</span>
                        </div>
                    </div>
                    )}
                </div>

                 <div className="px-6 pb-6 pt-2">
                   <div className="h-8 flex items-center justify-center text-sm text-gray-500">
                        {isListening ? ( <div className="flex items-center gap-2 text-red-500"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span>Listening...</span></div> ) 
                        : isLoading ? ( <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-indigo-400" /><span>AI is thinking...</span></div> ) 
                        : isAiSpeaking ? ( <div className="flex items-center gap-2 text-blue-500"><Volume2 className="w-4 h-4" /><span>AI is speaking...</span></div> ) 
                        : ( <span>Press the mic to speak</span> )}
                    </div>
                    <form className="flex-1 flex gap-2 mt-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
                        <Input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type in English..." className="flex-1" disabled={isLoading || isListening} />
                        <Button type="submit" className="bg-indigo-600" disabled={isLoading || isListening || !input.trim()}><Send className="w-5 h-5" /></Button>
                        <Button type="button" onClick={toggleListening} className={`transition-all ${isListening ? "bg-red-500" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}><Mic className="w-5 h-5" /></Button>
                    </form>
                    <div className="px-6 pt-4 flex justify-center">
                        <Button onClick={handleShowFeedback} variant="outline"><Sparkles className="w-4 h-4 mr-2" />Show Conversation Feedback</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}