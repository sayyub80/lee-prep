"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, UserSearch, WifiOff, PartyPopper, Users, Bot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import io, { Socket } from "socket.io-client";
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// --- Type Definitions ---
type PageState = "idle" | "waiting" | "active" | "ended";
interface Partner { id: string; name: string; }

// --- Helper Functions ---
const formatTime = (seconds: number) => new Date(seconds * 1000).toISOString().substr(14, 5);


// --- Waiting Animation Component ---
const WaitingAnimation = () => (
    <div className="relative flex flex-col items-center justify-center gap-8">
      <motion.div
        className="relative flex items-center justify-center w-64 h-64"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border-2 border-blue-500/50 rounded-full"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{
              width: "100%",
              height: "100%",
              opacity: 0,
            }}
            transition={{
              duration: 2.5,
              ease: "easeInOut",
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
        <div className="w-24 h-24 rounded-full bg-blue-600/20 backdrop-blur-md flex items-center justify-center shadow-lg">
            <Users className="w-12 h-12 text-white/90 animate-pulse" />
        </div>
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white tracking-wider">Finding a Partner...</h2>
        <p className="text-blue-200/80 text-center mt-2">Connecting you with another learner.</p>
      </motion.div>
    </div>
  );


// --- Main Component ---
export default function OneToOnePage() {
    const { user } = useAuth();
    const [pageState, setPageState] = useState<PageState>("idle");
    const [partner, setPartner] = useState<Partner | null>(null);
    const [roomName, setRoomName] = useState<string>("");
    const [liveKitToken, setLiveKitToken] = useState<string>("");
    const [sessionTime, setSessionTime] = useState(0);
    const [endMessage, setEndMessage] = useState("");
    
    const socketRef = useRef<Socket | null>(null);
    const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

    // --- Handler Functions ---
    const handleFindPartner = () => {
        setEndMessage("");
        setPageState('waiting');
    };

    const handleLeave = useCallback((message = "You left the session.") => {
        if (socketRef.current) {
            socketRef.current.emit('leave-session');
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setPageState('ended');
        setEndMessage(message);
        setLiveKitToken("");
        setRoomName("");
        setPartner(null);
        if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    }, []);

    // --- Core Logic Hooks ---
    useEffect(() => {
        if (pageState === 'waiting' && user) {
            const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
            socketRef.current = socket;
            
            socket.on('connect', () => {
                socket.emit("join-chat", { name: user.name });
            });

            socket.on("matched", ({ partner, roomName, duration }) => {
                setPartner(partner);
                setRoomName(roomName);
                setSessionTime(duration);
            });

            socket.on("partner-disconnected", () => {
                handleLeave("Your partner has disconnected.");
            });
            
            return () => {
                socket.off('matched');
                socket.off('partner-disconnected');
                if (socket.connected) {
                    socket.disconnect();
                }
            };
        }
    }, [pageState, user, handleLeave]);
    
    useEffect(() => {
        if (roomName && user?.name) {
            (async () => {
                try {
                    const resp = await fetch(`/api/livekit?room=${roomName}&username=${user.name}`);
                    const data = await resp.json();
                    if (data.token) {
                        setLiveKitToken(data.token);
                        setPageState('active');
                    } else {
                        throw new Error("Failed to get a valid token.");
                    }
                } catch (e) {
                    console.error("Error fetching LiveKit token:", e);
                    handleLeave("Could not connect to the session.");
                }
            })();
        }
    }, [roomName, user?.name, handleLeave]);

    // --- Timer Effect ---
    useEffect(() => {
        if (pageState === "active" && sessionTime > 0) {
            sessionTimerRef.current = setInterval(() => {
                setSessionTime(prev => prev > 0 ? prev - 1 : 0);
            }, 1000);
        } else if (sessionTime <= 0 && pageState === "active") {
            handleLeave("Session time is up!");
        }
        return () => { if (sessionTimerRef.current) clearInterval(sessionTimerRef.current); };
    }, [pageState, sessionTime, handleLeave]);

    // --- Render Logic ---
    const renderIdleOrWaiting = () => (
      <div className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center p-4 relative overflow-hidden bg-[#0a092d]">
          {/* Animated background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-50px] left-[-50px] w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
            <div className="absolute top-[-50px] right-[-50px] w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-50px] left-1/2 w-72 h-72 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
          </div>
  
          <AnimatePresence>
            {pageState === 'ended' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-white w-full max-w-md"
              >
                <PartyPopper size={48} className="mx-auto mb-4 text-yellow-300" />
                <h2 className="text-2xl font-bold mb-2">Session Ended</h2>
                <p className="text-white/80 mb-6">{endMessage}</p>
                <Button size="lg" onClick={handleFindPartner} className="bg-white text-black hover:bg-gray-200 w-full">Find Another Partner</Button>
              </motion.div>
            )}
          </AnimatePresence>
  
          <div className="relative z-10">
            {pageState === 'idle' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                   <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-lg">
                      <UserSearch size={48} className="text-white/90"/>
                   </div>
                   <h2 className="text-4xl font-bold text-white mb-3">Practice Live Conversation</h2>
                   <p className="text-lg text-white/80 mb-8 max-w-lg">Sharpen your speaking skills by connecting with a random partner for a timed, real-world conversation.</p>
                   <Button size="lg" onClick={handleFindPartner} className="px-8 py-6 text-lg bg-white text-black hover:bg-gray-200 shadow-xl transition-transform hover:scale-105">Find a Partner</Button>
               </motion.div>
            )}
            {pageState === 'waiting' && <WaitingAnimation />}
          </div>
      </div>
  );

    if (pageState !== 'active' || !liveKitToken) {
        return renderIdleOrWaiting();
    }

    return (
        <div data-lk-theme="default" className="w-full h-[calc(100vh-80px)] relative">
            <LiveKitRoom
                video={false}
                audio={true}
                token={liveKitToken}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                onDisconnected={() => handleLeave()}
            >
                <VideoConference />
                <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg font-mono text-base text-white shadow-lg">
                    <span>Session Ends In: {formatTime(sessionTime)}</span>
                </div>
            </LiveKitRoom>
        </div>
    );
}