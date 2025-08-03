"use client";
import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, Phone, PhoneOff, Loader2, UserSearch, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import io, { Socket } from "socket.io-client";

type PageState = "idle" | "waiting" | "active" | "ended";
type CallStatus = "none" | "outgoing" | "incoming" | "active";
interface ChatMessage { text: string; sender: "me" | "partner"; }
interface Partner { id: string; name: string; }
interface Caller { id: string; name: string; }

export default function OneToOnePage() {
  const { user } = useAuth();
  const [pageState, setPageState] = useState<PageState>("idle");
  const [callStatus, setCallStatus] = useState<CallStatus>('none');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [caller, setCaller] = useState<Caller | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (callStatus === "active" && timeRemaining > 0) {
      timerRef.current = setInterval(() => setTimeRemaining(prev => prev > 0 ? prev - 1 : 0), 1000);
    } else if (timeRemaining <= 0 && callStatus === "active") {
      endCall("Time's up! Hope you had a great conversation.");
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus, timeRemaining]);

  const cleanupAndReset = useCallback(() => {
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    pcRef.current = null;
    localStreamRef.current = null;
    setPartner(null);
    setCaller(null);
    setMessages([]);
    setChatInput("");
    setIsMuted(false);
    setCallStatus('none');
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeRemaining(0);
  }, []);

  const createPeerConnection = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.onicecandidate = (event) => {
      if (event.candidate && partner?.id) {
        socketRef.current?.emit("ice-candidate", { to: partner.id, candidate: event.candidate });
      }
    };
    pc.ontrack = (event) => {
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
    };
    pcRef.current = pc;
    return pc;
  }, [partner]);

  useEffect(() => {
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.on("waiting", () => setPageState("waiting"));
    socket.on("matched", ({ partner, duration }) => {
      setPartner(partner);
      setTimeRemaining(duration);
      setPageState("active");
    });
    socket.on("incoming-call", ({ from, signal }) => {
        setCaller(from);
        setCallStatus('incoming');
        const pc = createPeerConnection();
        pc.setRemoteDescription(new RTCSessionDescription(signal));
    });
    socket.on("call-accepted", async ({ signal }) => {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(signal));
        setCallStatus('active');
    });
    socket.on("call-declined", () => {
        alert(`${partner?.name || 'Partner'} declined the call.`);
        setCallStatus('none');
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
    });
    socket.on("ice-candidate", (candidate) => pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)));
    socket.on('receive-chat-message', ({ message }: { message: string }) => {
      setMessages(prev => [...prev, { text: message, sender: "partner" }]);
    });
    socket.on('partner-disconnected', () => {
      alert("Your partner has disconnected.");
      cleanupAndReset();
      setPageState('ended');
    });

    return () => {
      cleanupAndReset();
      socket.disconnect();
    };
  }, [cleanupAndReset, createPeerConnection]);

  const findPartner = () => { if (user) { socketRef.current?.emit("join-chat", { name: user.name }); setPageState("waiting"); } };
  const startCall = async () => {
    if (!partner) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const pc = createPeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('outgoing-call', { to: partner.id, from: { id: user?.id, name: user?.name }, signal: offer });
      setCallStatus('outgoing');
    } catch (error) { alert("Could not access microphone."); }
  };
  const acceptCall = async () => {
    if (!caller || !pcRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach(track => pcRef.current?.addTrack(track, stream));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current?.emit('call-accepted', { to: caller.id, signal: answer });
      setCallStatus('active');
    } catch (error) { alert("Could not access microphone."); }
  };
  const declineCall = () => { if (caller?.id) { socketRef.current?.emit('call-declined', { to: caller.id }); setCallStatus('none'); setCaller(null); } };
  const endCall = (message = "You ended the call.") => {
    alert(message);
    socketRef.current?.emit('leave-session');
    cleanupAndReset();
    setPageState('ended');
  };
  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; setIsMuted(!audioTrack.enabled); }
  };
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() && partner?.id) {
        socketRef.current?.emit('send-chat-message', { to: partner.id, message: chatInput });
        setMessages(prev => [...prev, { text: chatInput, sender: "me" }]);
        setChatInput("");
    }
  };
  const formatTime = (seconds: number) => new Date(seconds * 1000).toISOString().substr(14, 5);
  
  const renderInitialView = () => {
    const stateContent: Record<PageState, { icon: React.ReactElement | null; title: string; sub: string; btn: string | null; action?: () => void; }> = {
        idle: { icon: <UserSearch size={64} className="mx-auto mb-4 text-primary"/>, title: "Practice Live", sub: "Find a partner for a voice and text chat.", btn: "Find a Partner", action: findPartner },
        waiting: { icon: <Loader2 size={48} className="animate-spin mx-auto mb-4" />, title: "Waiting for a partner...", sub: "This may take a moment.", btn: null },
        active: { icon: null, title: "", sub: "", btn: null }, // Handled by the main component render
        ended: { icon: null, title: "Session Ended", sub: "Hope you had a great conversation!", btn: "Find Another Partner", action: () => setPageState("idle") }
    };
    const current = stateContent[pageState];
    if(pageState === 'active') return null;

    return (<div className="container py-8 flex flex-col items-center justify-center min-h-[70vh]"><div className="text-center">{current.icon}<h2 className="text-2xl font-bold mb-2">{current.title}</h2><p className="text-muted-foreground mb-6">{current.sub}</p>{current.btn && <Button size="lg" onClick={current.action}>{current.btn}</Button>}</div></div>);
  };
  if (pageState !== "active") return renderInitialView();

  return (
    <div className="container py-8 relative">
      {callStatus === 'incoming' && (<div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-white animate-in fade-in-0"><Avatar className="w-24 h-24 mb-4"><AvatarFallback className="text-4xl">{caller?.name?.charAt(0)}</AvatarFallback></Avatar><h2 className="text-3xl font-bold">{caller?.name} is calling...</h2><div className="flex gap-4 mt-8"><Button size="lg" className="bg-red-600 hover:bg-red-700 rounded-full w-20 h-20" onClick={declineCall}><PhoneOff className="w-8 h-8"/></Button><Button size="lg" className="bg-green-600 hover:bg-green-700 rounded-full w-20 h-20" onClick={acceptCall}><Phone className="w-8 h-8"/></Button></div></div>)}
      <div className="max-w-3xl mx-auto border rounded-xl shadow-lg bg-card flex flex-col h-[70vh] overflow-hidden">
        { (callStatus === 'outgoing' || callStatus === 'active') ? (<div className="flex-1 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-between p-8 text-foreground"><div className="text-center mt-12"><Avatar className="w-24 h-24 mx-auto mb-4"><AvatarFallback className="text-4xl">{partner?.name?.charAt(0)}</AvatarFallback></Avatar><h2 className="text-3xl font-bold">{partner?.name}</h2><p className="text-lg text-muted-foreground">{callStatus === 'outgoing' ? 'Ringing...' : `Connected - ${formatTime(timeRemaining)}`}</p></div><div className="flex items-center gap-4"><Button variant={isMuted ? "destructive" : "secondary"} size="lg" className="rounded-full w-20 h-20" onClick={toggleMute}>{isMuted ? <MicOff className="w-8 h-8"/> : <Mic className="w-8 h-8"/>}</Button><Button variant="destructive" size="lg" className="rounded-full w-20 h-20" onClick={() => endCall()}><PhoneOff className="w-8 h-8"/></Button></div></div>) : (
          <><header className="flex items-center justify-between p-4 border-b"><div className="flex items-center gap-3"><Avatar><AvatarFallback>{partner?.name?.charAt(0)}</AvatarFallback></Avatar><div><h2 className="font-semibold">{partner?.name}</h2><p className="text-xs text-muted-foreground">Chatting</p></div></div><Button variant="secondary" size="icon" onClick={startCall}><Phone className="w-5 h-5"/></Button></header>
          <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-secondary/30">{messages.map((msg, i) => (<div key={i} className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>{msg.sender === 'partner' && <Avatar className="h-8 w-8"><AvatarFallback>{partner?.name?.charAt(0)}</AvatarFallback></Avatar>}<div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-background rounded-bl-none'}`}><p className="text-sm">{msg.text}</p></div></div>))}<div ref={chatEndRef} />
          </main><footer className="p-4 border-t"><form className="flex gap-2" onSubmit={handleSendChatMessage}><Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." autoComplete="off"/><Button type="submit" size="icon"><Send/></Button></form></footer></>)}
      </div><audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}