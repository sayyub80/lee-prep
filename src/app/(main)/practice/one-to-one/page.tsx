"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, UserSearch, WifiOff, PartyPopper } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import io, { Socket } from "socket.io-client";
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { motion, AnimatePresence } from "framer-motion";

// --- Type Definitions ---
type PageState = "idle" | "waiting" | "active" | "ended";
interface Partner { id: string; name: string; }

// --- Helper Functions ---
const formatTime = (seconds: number) => new Date(seconds * 1000).toISOString().substr(14, 5);

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

    // This function now correctly handles all session cleanup logic
    const handleLeave = useCallback((message = "You left the session.") => {
        if (socketRef.current) {
            socketRef.current.emit('leave-session'); // Notify server
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
            const socket = io("http://localhost:4000");
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
    if (pageState !== 'active' || !liveKitToken) {
        return (
            <div className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center p-4 relative">
                <AnimatePresence>
                    {pageState === 'ended' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute z-10 bg-card border rounded-xl shadow-2xl p-8"
                        >
                            <PartyPopper size={48} className="mx-auto mb-4 text-primary"/>
                            <h2 className="text-2xl font-bold mb-2">Session Ended</h2>
                            <p className="text-muted-foreground mb-6">{endMessage}</p>
                            <Button size="lg" onClick={handleFindPartner}>Find Another Partner</Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {pageState === 'idle' && (
                     <>
                        <UserSearch size={64} className="mx-auto mb-4 text-primary"/>
                        <h2 className="text-2xl font-bold mb-2">Practice Live Conversation</h2>
                        <p className="text-muted-foreground mb-6">Find a partner to start a video and chat session.</p>
                        <Button size="lg" onClick={handleFindPartner}>Find a Partner</Button>
                    </>
                )}
                 {pageState === 'waiting' && (
                    <>
                        <div className="relative w-48 h-48 flex items-center justify-center"><div className="absolute inset-0 border-4 border-dashed border-gray-300 rounded-full animate-spin-slow"></div><Loader2 className="w-12 h-12 animate-spin"/></div>
                        <h2 className="text-xl font-semibold mt-8">Finding a partner...</h2>
                        <p className="text-muted-foreground">Please wait, this may take a moment.</p>
                    </>
                )}
            </div>
        );
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