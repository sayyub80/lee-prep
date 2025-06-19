"use client";
import { useState, useRef, useEffect } from 'react';
import { Mic, Copy, Send, User, MessageSquare, Phone, PhoneOff } from 'lucide-react';

export default function OneToOnePage() {
  const [messages, setMessages] = useState<{text: string, sender: 'me' | 'partner'}[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [inCall, setInCall] = useState(false);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Initialize WebRTC
  const setupCall = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      pcRef.current = pc;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (localAudioRef.current) localAudioRef.current.srcObject = stream;
      
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send candidate to partner (simulated)
          console.log('ICE candidate:', event.candidate);
        }
      };
      
      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };
      
      setInCall(true);
      
      // Simulate offer/answer (in real app, use signaling server)
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          // Simulate receiving answer after 1s
          setTimeout(() => {
            const answer = {
              type: 'answer',
              sdp: '...' // Simulated SDP
            };
            pc.setRemoteDescription(new RTCSessionDescription(answer));
          }, 1000);
        });
        
    } catch (err) {
      console.error('Error setting up call:', err);
    }
  };

  const endCall = () => {
    pcRef.current?.close();
    if (localAudioRef.current) localAudioRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    setInCall(false);
  };

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, {text: input, sender: 'me'}]);
      setTimeout(() => {
        setMessages(prev => [...prev, {text: "That's interesting! Tell me more.", sender: 'partner'}]);
      }, 1000);
      setInput('');
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
    const conversation = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
    setAiFeedback(`Feedback on your conversation:\n\n1. Vocabulary: 7/10\n2. Grammar: 6/10\n3. Fluency: 8/10\n\nFocus areas: Past tense usage, articles (a/an/the)`);
    setShowFeedback(true);
  };

  return (
    <div className="px-25 py-8">
      <h1 className="text-3xl font-bold mb-6">1:1 Conversation Practice</h1>
      
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
                <span>Live Call</span>
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

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="border rounded-xl p-6 h-[500px] flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md p-4 rounded-lg ${msg.sender === 'me' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{msg.sender === 'me' ? 'You' : 'Partner'}</span>
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
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-lg transition ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="border rounded-xl p-6 bg-white">
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
            <div className="text-gray-500 italic">
              Start a conversation to get feedback
            </div>
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
      </div>
    </div>
  );
}