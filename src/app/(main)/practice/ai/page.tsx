"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, Send, Bot, Volume2, VolumeX, Loader2, Info, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function AIPracticePage() {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "ai" }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [conversationFeedback, setConversationFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      if (!recognitionRef.current) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          // Optional: console.log("Speech recognition started");
        };
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript); // Only set input, don't send immediately
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
    // Stop speech synthesis and recognition on unmount
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Optional: console.log("Error starting recognition:", e);
      }
    }
  };

  // Send message to AI
  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    const userMessage = { text, sender: "user" as const };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map((m) => ({
        role: m.sender === "user" ? "user" : "ai",
        content: m.text,
      }));

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          history,
          user: { name: user?.name, level: user?.level || "beginner" },
        }),
      });
      const data = await res.json();
      if (data.text) {
        const aiResponse = { text: data.text, sender: "ai" as const };
        setMessages((prev) => [...prev, aiResponse]);
        if (!isMuted) speakResponse(data.text);
      } else {
        setMessages((prev) => [
          ...prev,
          { text: "Sorry, I couldn't process your request.", sender: "ai" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong.", sender: "ai" },
      ]);
    }
    setIsLoading(false);
  };

  // AI speaks its response
  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = text.split("\n\nFeedback:")[0];
      utterance.rate = 1.5;
      utterance.pitch = 2;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Show conversation feedback (calls Gemini for summary)
  const handleShowFeedback = async () => {
    setShowFeedback(true);
    setConversationFeedback("Loading...");
    try {
      const history = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "ai",
        content: m.text,
      }));
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Please give me a summary feedback for my English in this conversation. Tell me what I did well and what I should improve. Be specific and encouraging. Format the feedback as:\n\nWhat you did well:\n- ...\n\nWhat to improve:\n- ...",
          history,
        }),
      });
      const data = await res.json();
      setConversationFeedback(data.text || "Sorry, feedback could not be generated.");
    } catch {
      setConversationFeedback("Sorry, feedback could not be generated.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200/70 via-blue-100/80 to-white/90 overflow-hidden">
      {/* Decorative blurred blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600 opacity-30 rounded-full filter blur-3xl z-0" />
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-500 opacity-30 rounded-full filter blur-2xl z-0" />
      <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-yellow-400 opacity-40 rounded-full filter blur-2xl z-0" />
      {/* Main Card */}
      <div className="relative z-10 max-w-2xl w-full mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-0 md:p-9 flex flex-col border my-1 border-indigo-100">
        {/* Header */}
        <header className="flex items-center gap-3 px-6 pt-6  pb-2">
          <span className="bg-indigo-100 rounded-full p-2 shadow">
            <Bot className="w-8 h-8 text-indigo-600" />
          </span>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            AI Speaking Partner
          </h1>
          <button
            className={`ml-auto p-2 rounded-lg transition ${
              isMuted
                ? "bg-gray-300 text-gray-600"
                : "bg-blue-100 text-blue-700"
            }`}
            onClick={() => {
              setIsMuted((prev) => !prev);
              window.speechSynthesis.cancel();
            }}
            aria-label={isMuted ? "Unmute AI" : "Mute AI"}
            title={isMuted ? "Unmute AI" : "Mute AI"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </header>
        <div className="px-6 pb-2 text-gray-700 text-sm">
          <span>
            Practice your English by chatting or speaking with AI. Get instant feedback on your pronunciation, grammar, and vocabulary!
          </span>
        </div>
        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex-1 flex flex-col px-4 py-4 space-y-4"
            style={{
              maxHeight: "420px",
              minHeight: "320px",
              overflowY: "auto",
              scrollBehavior: "smooth",
            }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-in">
                <Bot className="w-12 h-12 mb-2" />
                <span>Start a conversation by typing or speaking!</span>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-xs md:max-w-md p-4 rounded-2xl shadow-lg transition-all duration-200 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-indigo-200 to-blue-100 text-indigo-900 rounded-br-3xl"
                      : "bg-white/80 text-gray-700 border border-indigo-50 rounded-bl-3xl"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text.split("\n\nFeedback:")[0]}</p>
                  {msg.sender === "ai" && msg.text.includes("Feedback:") && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-gray-700">
                      <span className="font-semibold text-yellow-700">Feedback:</span>
                      <span className="block">{msg.text.split("\n\nFeedback:")[1]}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/80 p-4 rounded-2xl w-32 flex items-center gap-2 border border-indigo-100">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>AI is typing...</span>
                </div>
              </div>
            )}
            {/* Scroll anchor */}
            <div ref={chatEndRef} />
          </div>
        </div>
        {/* Input Area */}
        <form
          className="flex gap-2 px-6 pb-6 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or speak in English..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white/90 shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 bg-gradient-to-br from-indigo-600 to-blue-500 text-white rounded-lg hover:scale-105 hover:shadow-lg transition"
            disabled={isLoading || !input.trim()}
            aria-label="Send"
          >
            <Send className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-lg transition ${
              isListening
                ? "bg-red-500 text-white scale-110"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            <Mic className="w-5 h-5" />
          </button>
        </form>
        {/* Floating Feedback Button */}
        <button
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-yellow-400 to-yellow-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all flex items-center gap-2"
          onClick={handleShowFeedback}
          style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)" }}
        >
          <Sparkles className="w-6 h-6" />
          <span className="font-semibold hidden md:inline">Show Feedback</span>
        </button>
        {/* Feedback Modal/Drawer */}
        {showFeedback && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            <div className="w-full max-w-lg mx-auto mb-8 pointer-events-auto">
              <div className="bg-white/80 backdrop-blur-xl border border-indigo-100 rounded-3xl shadow-2xl p-8 relative animate-fade-in">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-8 h-8 text-yellow-500 mr-3" />
                  <span className="font-bold text-xl text-indigo-700">Your Conversation Feedback</span>
                  <button
                    className="ml-auto text-gray-400 hover:text-gray-700 text-2xl"
                    onClick={() => setShowFeedback(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="text-gray-700 whitespace-pre-line text-base min-h-[80px]">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8">
                      <Info className="w-8 h-8 text-indigo-400" />
                      <span className="text-indigo-700 font-semibold">Chat with AI to get feedback!</span>
                      <span className="text-gray-500 text-sm">Start a conversation and your feedback will appear here.</span>
                    </div>
                  ) : conversationFeedback === "Loading..." ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Analyzing your conversation...</span>
                    </div>
                  ) : conversationFeedback ? (
                    <>
                      {/* Parse feedback into points */}
                      {(() => {
                        const wellMatch = conversationFeedback.match(/What you did well:\s*([\s\S]*?)\n\s*What to improve:/i);
                        const improveMatch = conversationFeedback.match(/What to improve:\s*([\s\S]*)/i);
                        const wellPoints = wellMatch ? wellMatch[1].split("\n").filter(line => line.trim().startsWith("-")).map(line => line.replace(/^-/, '').trim()) : [];
                        const improvePoints = improveMatch ? improveMatch[1].split("\n").filter(line => line.trim().startsWith("-")).map(line => line.replace(/^-/, '').trim()) : [];
                        return (
                          <>
                            <div className="mb-3">
                              <span className="font-semibold text-green-700">What you did well:</span>
                              <ul className="list-disc pl-6 text-green-900">
                                {wellPoints.length > 0 ? wellPoints.map((point, idx) => (
                                  <li key={idx}>{point}</li>
                                )) : <li>No highlights yet.</li>}
                              </ul>
                            </div>
                            <div>
                              <span className="font-semibold text-red-700">What to improve:</span>
                              <ul className="list-disc pl-6 text-red-900">
                                {improvePoints.length > 0 ? improvePoints.map((point, idx) => (
                                  <li key={idx}>{point}</li>
                                )) : <li>No suggestions yet.</li>}
                              </ul>
                            </div>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <span>No feedback yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Info/Help Section */}
        <div className="px-6 pb-6">
          <div className="mt-2 p-4 bg-blue-50 rounded-lg flex items-center gap-3 text-base text-blue-900 shadow">
            <Volume2 className="w-6 h-6 text-indigo-500" />
            <span>
              <span className="font-semibold">Tip:</span> You can <span className="font-semibold">type</span> or <span className="font-semibold">speak</span> to chat with the AI. The AI will reply with voice automatically!
            </span>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-sm text-yellow-900 shadow">
            <span className="font-semibold block mb-2">What feedback will you get?</span>
            <ul className="list-disc pl-6 space-y-1">
              <li className="flex items-center gap-2">
                <span role="img" aria-label="microphone">🎤</span> Pronunciation scoring
              </li>
              <li className="flex items-center gap-2">
                <span role="img" aria-label="book">📖</span> Grammar corrections
              </li>
              <li className="flex items-center gap-2">
                <span role="img" aria-label="bulb">💡</span> Vocabulary suggestions
              </li>
              <li className="flex items-center gap-2">
                <span role="img" aria-label="rocket">🚀</span> Fluency analysis
              </li>
            </ul>
            <div className="mt-2 text-xs text-yellow-700">
              <span>Try to speak naturally and ask the AI anything about English!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}