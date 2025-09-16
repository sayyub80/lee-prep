'use client';
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import io, { Socket } from 'socket.io-client';
import { Users, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- NEW COMPONENT TO HANDLE IMAGE ERRORS ---
const UserAvatar = ({ src, name, className }: { src?: string, name?: string, className?: string }) => {
  const [hasError, setHasError] = useState(false);

  const fallbackChar = name?.trim().charAt(0).toUpperCase() || '?';

  useEffect(() => {
    setHasError(false); // Reset error state when src changes
  }, [src]);

  return (
    <Avatar className={className}>
      {src && !hasError ? (
        <AvatarImage 
          src={src} 
          alt={name || 'User Avatar'} 
          onError={() => setHasError(true)}
        />
      ) : null}
      <AvatarFallback>{fallbackChar}</AvatarFallback>
    </Avatar>
  );
};


interface Group {
    _id: string;
    name: string;
    description: string;
    topic: string;
    members: any[];
    onlineCount: number;
    onlineUsers: { id: string, name: string, avatar?: string }[];
}

export default function GroupsLobbyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  // ... (rest of the component logic remains the same) ...
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/groups');
        const data = await res.json();
        if (data.success) {
          const initialGroups = data.data.map((g: Group) => ({ ...g, onlineCount: 0, onlineUsers: [] }));
          setGroups(initialGroups);

          const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
          socketRef.current = socket;

          socket.on('update-all-group-counts', (allGroupCounts: { groupId: string, onlineCount: number, onlineUsers: any[] }[]) => {
            setGroups(currentGroups => {
              if (currentGroups.length === 0) return [];
              const updates = new Map(allGroupCounts.map(c => [c.groupId, c]));
              return currentGroups.map(group => {
                const update = updates.get(group._id);
                return update 
                  ? { ...group, onlineCount: update.onlineCount, onlineUsers: update.onlineUsers } 
                  : { ...group, onlineCount: 0, onlineUsers: [] };
              });
            });
          });
        }
      } catch (error) { 
        console.error("Failed to fetch groups:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleJoinGroup = async (groupId: string) => {
    if (!user) { router.push('/login'); return; }
    setJoiningGroupId(groupId);
    try {
        await fetch(`/api/groups/${groupId}/join`, { method: 'POST' });
        router.push(`/practice/groups/${groupId}`);
    } catch (error) {
        alert("There was an error joining the group.");
    } finally {
        setJoiningGroupId(null);
    }
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserMember = (group: Group) => user ? group.members.some(m => m._id === user.id) : false;

  const SkeletonCard = () => (
    <Card className="flex flex-col bg-card">
        <CardHeader>
            <div className="h-6 bg-secondary rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-secondary rounded w-full mt-2 animate-pulse"></div>
        </CardHeader>
        <CardContent className="flex-grow">
            <div className="h-4 bg-secondary rounded w-1/4 mb-2 animate-pulse"></div>
            <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-secondary animate-pulse border-2 border-card"></div>
                <div className="w-8 h-8 rounded-full bg-secondary animate-pulse border-2 border-card"></div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
             <div className="h-4 bg-secondary rounded w-1/3 animate-pulse"></div>
             <div className="h-10 bg-secondary rounded w-24 animate-pulse"></div>
        </CardFooter>
    </Card>
  );

  return (
    <div className="bg-secondary/30 min-h-[calc(100vh-80px)]">
        <div className="container py-8">
            <header className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><Users/> Group Discussions</h1>
                    <p className="text-muted-foreground mt-1">Join a group to practice your English skills with other learners.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Search groups..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </header>
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* --- RENDER LOGIC --- */}
              {loading ? (
                  <>
                      <SkeletonCard /><SkeletonCard /><SkeletonCard />
                  </>
              ) : (
                <>
                {filteredGroups.length > 0 ? filteredGroups.map((group) => (
                    <Card key={group._id} className="hover:shadow-xl transition-shadow flex flex-col bg-card">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                {group.onlineCount > 0 && (
                                    <div className="flex items-center text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                        <span className="relative flex h-2 w-2 mr-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                                        {group.onlineCount} Online
                                    </div>
                                )}
                            </div>
                            <CardDescription className="pt-2">{group.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">ONLINE NOW</p>
                            <div className="flex -space-x-2 overflow-hidden h-8">
                                {(group.onlineUsers && group.onlineUsers.length > 0) ? group.onlineUsers.slice(0, 5).map((onlineUser) => (
                                  // --- USE THE NEW COMPONENT HERE ---
                                  <UserAvatar 
                                    key={onlineUser.id}
                                    src={onlineUser.avatar} 
                                    name={onlineUser.name} 
                                    className="w-8 h-8 border-2 border-background"
                                  />
                                )) : <span className="text-xs text-muted-foreground italic">No one online right now.</span>}
                                {group.onlineUsers && group.onlineUsers.length > 5 && (
                                    <Avatar className="w-8 h-8 border-2 border-background">
                                        <AvatarFallback>+{group.onlineUsers.length - 5}</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">{group.members.length} total members</span>
                            <Button onClick={() => handleJoinGroup(group._id)} disabled={joiningGroupId === group._id} variant={isUserMember(group) ? "secondary" : "default"}>
                                {joiningGroupId === group._id ? <Loader2 className="w-4 h-4 animate-spin"/> : (isUserMember(group) ? "Enter Chat" : "Join Group")}
                            </Button>
                        </CardFooter>
                    </Card>
                )) : (
                    <div className="col-span-full text-center py-16">
                        <h2 className="text-xl font-semibold">No Groups Found</h2>
                        <p className="text-muted-foreground mt-2">Try adjusting your search term or check back later!</p>
                    </div>
                )}
                </>
              )}
            </main>
        </div>
    </div>
  );
};