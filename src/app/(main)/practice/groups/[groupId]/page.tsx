'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import io, { Socket } from 'socket.io-client';
import { Send, ArrowLeft, Loader2, Phone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from "framer-motion";
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

// --- Type Definitions ---
interface Message {
    _id?: string;
    sender: { id: string; name: string };
    text: string;
}
interface OnlineUser {
    id: string;
    name: string;
}

// --- Main Page Component ---
export default function GroupChatPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const groupId = params.groupId as string;
    
    const [group, setGroup] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
    const [liveKitToken, setLiveKitToken] = useState("");
    
    const socketRef = useRef<Socket | null>(null);
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!groupId || !user) return;

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/groups/${groupId}`);
                const data = await res.json();
                if (data.success) {
                    setGroup(data.data.group);
                    setMessages(data.data.messages.map((msg: any) => ({ 
                        _id: msg._id,
                        sender: { id: msg.sender.toString(), name: msg.senderName }, 
                        text: msg.text 
                    })));
                }
            } catch (error) { console.error("Failed to fetch group data:", error); } 
            finally { setLoading(false); }
        };
        fetchData();

        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
        socketRef.current = socket;
        
        socket.on('connect', () => {
            socket.emit('join-group', { groupId, user: { id: user.id, name: user.name } });
        });

        socket.on('receive-group-message', (message: Message) => setMessages(prev => [...prev, message]));
        socket.on('update-online-users', (users: OnlineUser[]) => setOnlineUsers(users));
        socket.on('group-voice-chat-started', async ({ livekitRoomName }) => {
            try {
                const resp = await fetch(`/api/livekit?room=${livekitRoomName}&username=${user.name}`);
                const data = await resp.json();
                setLiveKitToken(data.token);
                setIsVoiceChatActive(true);
            } catch (e) { console.error("Failed to get LiveKit token:", e); }
        });

        return () => {
            if (socket.connected) socket.emit('leave-group', { groupId, user: { id: user.id, name: user.name } });
            socket.disconnect();
        };
    }, [groupId, user]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && user && socketRef.current) {
            const messageData = { groupId, sender: { id: user.id, name: user.name }, text: newMessage };
            socketRef.current.emit('send-group-message', messageData);
            setMessages(prev => [...prev, messageData]);
            setNewMessage("");
        }
    };

    const handleStartVoiceChat = () => {
        socketRef.current?.emit('start-group-voice-chat', { groupId });
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-primary"/></div>;
    
    if (isVoiceChatActive && liveKitToken) {
        return (
            <div data-lk-theme="default" className="w-full h-[calc(100vh-80px)]">
                 <LiveKitRoom
                    video={true}
                    audio={true}
                    token={liveKitToken}
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                    onDisconnected={() => setIsVoiceChatActive(false)}
                >
                    <VideoConference />
                </LiveKitRoom>
            </div>
        )
    }

    return (
        <div className=" py-4 px-4 h-[calc(100vh-80px)]">
            <div className="flex h-full border rounded-xl shadow-lg bg-card overflow-hidden">
                <div className="flex flex-col h-full flex-1">
                    <header className="flex items-center p-4 border-b">
                        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push('/community')}><ArrowLeft /></Button>
                        <div><h1 className="text-xl font-bold">{group?.name}</h1></div>
                        <Button className="ml-auto bg-green-600 hover:bg-green-700" size="sm" onClick={handleStartVoiceChat}>
                            <Phone className="mr-2 h-4 w-4"/> Start Voice Chat
                        </Button>
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 space-y-6">
                        {group?.currentTopic?.title && (
                            <div className="bg-background border-l-4 border-primary p-4 rounded-r-lg mb-2 self-center w-full max-w-2xl shadow-sm">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                    <div><p className="font-semibold text-sm">Today's Topic</p><p className="font-medium">{group.currentTopic.title}</p></div>
                                </div>
                            </div>
                        )}
                        
                        {/* --- FINAL, CORRECTED MESSAGE DISPLAY LOGIC --- */}
                        {messages.map((msg, index) => {
                            const isUserMessage = msg.sender.id === user?.id;
                            return (
                                <motion.div
                                    key={msg._id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`w-full flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-start gap-2 max-w-[75%] ${isUserMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{msg.sender.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <p className={`text-xs text-muted-foreground px-1 mb-1 ${isUserMessage ? 'text-right' : 'text-left'}`}>
                                                {msg.sender.name}
                                            </p>
                                            <div className={`p-3 rounded-2xl shadow-sm break-words ${isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                                <p className="text-sm">{msg.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </main>

                    <footer className="p-4 border-t bg-background">
                        <form className="flex gap-2" onSubmit={handleSendMessage}><Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." autoComplete="off" /><Button type="submit" size="icon"><Send/></Button></form>
                    </footer>
                </div>

                <aside className="w-80 border-l flex-col hidden lg:flex bg-secondary/30">
                    <div className="p-6 border-b"><h2 className="font-semibold text-lg">About this Group</h2><p className="text-sm text-muted-foreground mt-2">{group?.description}</p></div>
                    <div className="p-6 flex-1">
                        <h3 className="font-semibold mb-4 flex items-center"><span className="relative flex h-3 w-3 mr-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>Online Now ({onlineUsers.length})</h3>
                        <div className="space-y-4">
                            {onlineUsers.map(onlineUser => (<div key={onlineUser.id} className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback>{onlineUser.name.charAt(0).toUpperCase()}</AvatarFallback></Avatar><span className="font-medium">{onlineUser.name}</span></div>))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}