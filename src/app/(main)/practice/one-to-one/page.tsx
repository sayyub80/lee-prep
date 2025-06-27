"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, Copy, Send, User, MessageSquare, Phone, PhoneOff } from "lucide-react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function OneToOnePage() {
  const [messages, setMessages] = useState<
    { text: string; sender: "me" | "partner" }[]
  >([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState("");
  const [inCall, setInCall] = useState(false);
  const [modeDialogOpen, setModeDialogOpen] = useState(true);
  const [mode, setMode] = useState<"chat" | "voice" | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!mode) return;

    setIsConnecting(true);
    socket.emit("join", mode);

    socket.on("waiting", () => {
      console.log("Waiting for a partner...");
    });

    socket.on("matched", async ({ partnerId, chatSessionId }) => {
      setPartnerId(partnerId);
      setModeDialogOpen(false);
      setIsConnecting(false);
      console.log("Matched with partner:", partnerId);

      // Fetch chat history for the session
      if (chatSessionId) {
        try {
          const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
          const res = await fetch(`/api/chat/messages/${chatSessionId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const messagesData = await res.json();
            const formattedMessages = messagesData.map((msg: any) => ({
              text: msg.text,
              sender: msg.sender === partnerId ? 'partner' : 'me',
            }));
            setMessages(formattedMessages);
          }
        } catch (err) {
          console.error('Failed to fetch chat history:', err);
        }
      }

      if (mode === "voice") {
        setupCall();
      }
    });

    socket.on("signal", async ({ from, signalData }) => {
      if (!pcRef.current) return;
      if (signalData.type === "offer") {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(signalData)
        );
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("signal", { partnerId: from, signalData: answer });
      } else if (signalData.type === "answer") {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(signalData)
        );
      } else if (signalData.candidate) {
        await pcRef.current.addIceCandidate(signalData);
      }
    });

    socket.on("chat-message", ({ from, message }) => {
      setMessages((prev) => [...prev, { text: message, sender: "partner" }]);
    });

    socket.on("partner-disconnected", () => {
      alert("Your partner has disconnected.");
      endCall();
      setPartnerId(null);
      setModeDialogOpen(true);
      setMode(null);
      setMessages([]);
      setIsConnecting(false);
    });

    return () => {
      socket.off("waiting");
      socket.off("matched");
      socket.off("signal");
      socket.off("chat-message");
      socket.off("partner-disconnected");
    };
  }, [mode]);

  // Initialize WebRTC
  const setupCall = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate && partnerId) {
          socket.emit("signal", {
            partnerId,
            signalData: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      setInCall(true);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (partnerId) {
        socket.emit("signal", { partnerId, signalData: offer });
      }
    } catch (err) {
      console.error("Error setting up call:", err);
    }
  };

  const endCall = () => {
    pcRef.current?.close();
    pcRef.current = null;
    if (localAudioRef.current) localAudioRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    setInCall(false);
  };

  const handleSend = () => {
    if (input.trim() && partnerId) {
      setMessages([...messages, { text: input, sender: "me" }]);
      socket.emit("chat-message", input);
      setInput("");
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    setIsRecording(true);

    const audioChunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks);
      // In real app: Send audio to partner
      setIsRecording(false);
    };
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const getFeedback = async () => {
    const conversation = messages.map((m) => `${m.sender}: ${m.text}`).join("\n");
    setAiFeedback(
      `Feedback on your conversation:\n\n1. Vocabulary: 7/10\n2. Grammar: 6/10\n3. Fluency: 8/10\n\nFocus areas: Past tense usage, articles (a/an/the)`
    );
    setShowFeedback(true);
  };

  return (
    <div className="px-25 py-8">
      <h1 className="text-3xl font-bold mb-6">1:1 Conversation Practice</h1>

      {modeDialogOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 max-w-full shadow-lg border border-gray-300">
            <h2 className="text-xl font-semibold mb-4">Choose Conversation Mode</h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode("chat")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Chat (Text)
            </button>
            <button
              onClick={() => setMode("voice")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Voice Call
            </button>
          </div>
        </div>
      </div>
    )}
    {isConnecting && (
      <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-80 max-w-full shadow-lg border border-gray-300 text-center">
          <p className="text-lg font-medium">Connecting to partner...</p>
        </div>
      </div>
    )}

      {!modeDialogOpen && (
        <>
          {mode === "voice" && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Phone className="w-5 h-5" /> Voice Call
                </h2>
                {!inCall ? (
                  <button
                    onClick={setupCall}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Start Call
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                      <span>Connecting to partner...</span>
                    </div>
                    <button
                      onClick={endCall}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <PhoneOff className="w-5 h-5" /> End Call
                    </button>
                  </div>
                )}
              </div>

              {inCall && (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-white">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> You
                    </h3>
                    <audio ref={localAudioRef} autoPlay muted className="w-full" />
                  </div>
                  <div className="p-4 border rounded-lg bg-white">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Partner
                    </h3>
                    <audio ref={remoteAudioRef} autoPlay className="w-full" />
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === "chat" && (
            <div className="border rounded-xl p-6 h-[500px] flex flex-col bg-white">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-gray-600 italic mb-4">Connecting to partner...</div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md p-4 rounded-lg ${
                        msg.sender === "me" ? "bg-indigo-100" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium">
                          {msg.sender === "me" ? "You" : "Partner"}
                        </span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <Send className="w-5 h-5" />
                </button>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-lg transition ${
                    isRecording ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="border rounded-xl p-6 bg-white mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" /> Conversation Feedback
            </h2>

            {messages.length > 0 ? (
              <>
                <button
                  onClick={getFeedback}
                  className="mb-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <Copy className="w-4 h-4" /> Get AI Feedback
                </button>

                {showFeedback && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 whitespace-pre-line">
                    {aiFeedback}
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500 italic">Start a conversation to get feedback</div>
            )}

            <div className="mt-8">
              <h3 className="font-medium mb-2">Tips for effective practice:</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Don't worry about mistakes</li>
                <li>Try to speak in complete sentences</li>
                <li>Ask follow-up questions</li>
                <li>Use the voice call for pronunciation practice</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
