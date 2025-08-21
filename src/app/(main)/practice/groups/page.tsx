'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Loader2, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface Group {
    _id: string;
    name: string;
    description: string;
    topic: string;
    members: any[];
}

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth(); // Use the auth loading state
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Only fetch groups once the initial authentication check is complete
    if (authLoading) {
      return;
    }

    const fetchGroups = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/groups');
        const data = await res.json();
        if (data.success) {
          setGroups(data.data);
        } else {
            throw new Error("Failed to load community groups.");
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch groups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [authLoading]); // Re-run this effect only when auth loading state changes

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
        router.push('/login?from=/practice/groups');
        return;
    }
    setJoiningGroupId(groupId);
    try {
        const res = await fetch(`/api/groups/${groupId}/join`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to join group');
        router.push(`/practice/groups/${groupId}`);
    } catch (error) {
        alert("There was an error joining the group.");
    } finally {
        setJoiningGroupId(null);
    }
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const isUserMember = (group: Group) => user ? group.members.some(m => m._id === user.id) : false;

  const renderContent = () => {
    if (loading || authLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }
    if (error) {
        return <div className="flex flex-col items-center justify-center h-64 text-center"><Frown className="w-12 h-12 text-destructive mb-4"/><h3 className="text-xl font-semibold">Something went wrong</h3><p className="text-muted-foreground">{error}</p></div>;
    }
    if (filteredGroups.length === 0) {
        return <div className="text-center h-64 flex flex-col items-center justify-center"><h3 className="text-xl font-semibold">No Groups Found</h3><p className="text-muted-foreground">It looks like there are no groups yet. Admins can create new groups from the admin panel.</p></div>
    }
    return (
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-">
            {filteredGroups.map((group) => (
                <Card key={group._id} className="hover:shadow-xl transition-shadow flex flex-col bg-card">
                    <CardHeader>
                        <div className="flex justify-between items-start"><CardTitle className="text-lg">{group.name}</CardTitle><span className="text-xs font-semibold uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">{group.topic}</span></div>
                        <CardDescription className="pt-2">{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex -space-x-2 overflow-hidden">
                            {group.members.slice(0, 5).map((member, index) => (<div key={index} className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-xs font-medium">{member.name.charAt(0).toUpperCase()}</div>))}
                            {group.members.length > 5 && (<div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium">+{group.members.length - 5}</div>)}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{group.members.length} members</span>
                        <Button onClick={() => handleJoinGroup(group._id)} disabled={joiningGroupId === group._id} variant={isUserMember(group) ? "outline" : "default"}>
                            {joiningGroupId === group._id ? <Loader2 className="w-4 h-4 animate-spin"/> : (isUserMember(group) ? "Enter Chat" : "Join Group")}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </main>
    )
  }

  return (
    <div className="bg-secondary/30 min-h-[calc(100vh-80px)]">
        <div className="container px-10 py-10">
            <header className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><Users/> Community Practice</h1>
                <p className="text-muted-foreground mt-1">Join discussion groups to practice your English skills with other learners.</p>
                </div>
                <div className="relative w-full md:w-64"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="search" placeholder="Search groups..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
            </header>
            {renderContent()}
        </div>
    </div>
  );
};