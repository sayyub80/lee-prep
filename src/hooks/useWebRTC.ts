// src/hooks/useWebRTC.ts
import { useState, useRef, useEffect, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

// --- Type Definitions ---
type PageState = "idle" | "waiting" | "active" | "ended";
type CallStatus = "none" | "outgoing" | "incoming" | "active";
interface ChatMessage { text: string; sender: "me" | "partner"; }
interface Partner { id: string; name: string; }
interface Caller { id: string; name: string; }

const SOCKET_SERVER_URL = "http://localhost:4000";

export const useWebRTC = () => {
  const { user } = useAuth();
  const [pageState, setPageState] = useState<PageState>("idle");
  const [callStatus, setCallStatus] = useState<CallStatus>('none');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [callTime, setCallTime] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanupAndReset = useCallback(() => {
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(track => track.stop()); localStreamRef.current = null; }
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    
    setPartner(null);
    setMessages([]);
    setIsMuted(false);
    setCallStatus('none');
    setSessionTime(0);
    setCallTime(0);
  }, []);

  const createPeerConnection = useCallback((partnerId: string) => {
    if (pcRef.current) pcRef.current.close();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    
    pc.onicecandidate = (event) => { if (event.candidate) socketRef.current?.emit("ice-candidate", { to: partnerId, candidate: event.candidate }); };
    pc.ontrack = (event) => { if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0]; };
    
    pcRef.current = pc;
    return pc;
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_SERVER_URL);
    socketRef.current = socket;

    socket.on("matched", ({ partner, duration }) => { setPartner(partner); setSessionTime(duration); setPageState("active"); });
    socket.on("incoming-call", ({ from, signal }) => {
      createPeerConnection(from.id);
      pcRef.current?.setRemoteDescription(new RTCSessionDescription(signal));
      setCallStatus('incoming');
      setPartner(from); // The caller is now our partner for this interaction
    });
    socket.on("call-accepted", async ({ signal }) => {
      if (pcRef.current) await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      setCallStatus('active');
    });
    socket.on("call-declined", () => {
      alert(`${partner?.name || 'Partner'} declined the call.`);
      setCallStatus('none');
      if(localStreamRef.current) { localStreamRef.current.getTracks().forEach(track => track.stop()); localStreamRef.current = null; }
    });
    socket.on("ice-candidate", (candidate) => pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)));
    socket.on('receive-chat-message', ({ message }) => setMessages(prev => [...prev, { text: message, sender: "partner" }]));
    socket.on('partner-disconnected', () => { alert("Your partner has disconnected."); cleanupAndReset(); setPageState('ended'); });

    return () => { cleanupAndReset(); socket.disconnect(); };
  }, [user, cleanupAndReset, createPeerConnection]);

  useEffect(() => {
    if (pageState === "active" && sessionTime > 0) {
      sessionTimerRef.current = setInterval(() => setSessionTime(prev => prev > 0 ? prev - 1 : 0), 1000);
    } else if (sessionTime <= 0 && pageState === "active") {
      endCall("Session time is up!");
    }
    return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
  }, [pageState, sessionTime]);

  useEffect(() => {
    if (callStatus === "active") {
      callTimerRef.current = setInterval(() => setCallTime(prev => prev + 1), 1000);
    } else {
      if(callTimerRef.current) clearInterval(callTimerRef.current);
      setCallTime(0);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callStatus]);

  const findPartner = () => { if (user) { cleanupAndReset(); setPageState('waiting'); socketRef.current?.emit("join-chat", { name: user.name }); } };
  const startCall = async () => {
    if (!partner) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const pc = createPeerConnection(partner.id);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('outgoing-call', { to: partner.id, from: { id: user?.id, name: user?.name }, signal: offer });
      setCallStatus('outgoing');
    } catch (error) { alert("Could not access microphone."); }
  };
  const acceptCall = async () => {
    if (!partner || !pcRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach(track => pcRef.current?.addTrack(track, stream));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current?.emit('call-accepted', { to: partner.id, signal: answer });
      setCallStatus('active');
    } catch (error) { alert("Could not access microphone."); }
  };
  const declineCall = () => { if (partner?.id) { socketRef.current?.emit('call-declined', { to: partner.id }); setCallStatus('none'); } };
  const endCall = (message = "You ended the call.") => { alert(message); socketRef.current?.emit('leave-session'); cleanupAndReset(); setPageState('ended'); };
  const toggleMute = () => { const track = localStreamRef.current?.getAudioTracks()[0]; if (track) { track.enabled = !track.enabled; setIsMuted(!track.enabled); } };
  const sendMessage = (chatInput: string) => {
    if (chatInput.trim() && partner?.id) {
        socketRef.current?.emit('send-chat-message', { to: partner.id, message: chatInput });
        setMessages(prev => [...prev, { text: chatInput, sender: "me" }]);
    }
  };

  return { pageState, callStatus, partner, messages, isMuted, sessionTime, callTime, remoteAudioRef, findPartner, startCall, acceptCall, declineCall, endCall, toggleMute, sendMessage };
};