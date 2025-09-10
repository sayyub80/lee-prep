// src/app/(main)/admin/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield, Loader2, MessageSquare, PenSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // You may need to add this: npx shadcn-ui@latest add select

interface Group { _id: string; name: string; }

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  // State for creating groups
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupTopic, setGroupTopic] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createFeedback, setCreateFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // State for setting topics
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [isSettingTopic, setIsSettingTopic] = useState(false);
  const [topicFeedback, setTopicFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Fetch all groups to populate the dropdown
    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/groups');
            const data = await res.json();
            if(data.success) setAllGroups(data.data);
        } catch (error) {
            console.error("Failed to fetch groups for admin panel", error);
        }
    }
    if(user?.role === 'admin') fetchGroups();
  }, [user]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateFeedback(null);
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, description: groupDesc, topic: groupTopic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create group');
      setCreateFeedback({ type: 'success', message: `Successfully created: "${data.data.name}"` });
      setGroupName(''); setGroupDesc(''); setGroupTopic('');
      setAllGroups(prev => [...prev, data.data]); // Add new group to dropdown
    } catch (error: any) {
      setCreateFeedback({ type: 'error', message: error.message });
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleSetTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedGroupId || !newTopic) return;
    setIsSettingTopic(true);
    setTopicFeedback(null);
    try {
        const res = await fetch(`/api/admin/groups/${selectedGroupId}/topic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTopic }),
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.error || 'Failed to set topic');
        setTopicFeedback({ type: 'success', message: 'Topic updated successfully!'});
        setNewTopic('');
    } catch (error: any) {
        setTopicFeedback({ type: 'error', message: error.message });
    } finally {
        setIsSettingTopic(false);
    }
  };

  if (authLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-primary"/></div>;
  if (user?.role !== 'admin') return <div className="container py-12 text-center"><h1 className="text-3xl font-bold text-destructive">Access Denied</h1><p className="text-muted-foreground mt-2">You do not have permission to view this page.</p></div>;

  return (
    <div className="px-8 py-8">
      <header className="mb-8"><h1 className="text-3xl font-bold tracking-tight flex items-center gap-3"><Shield /> Admin Panel</h1><p className="text-muted-foreground mt-1">Manage application content and features.</p></header>
      <main className="grid md:grid-cols-2 gap-8">
        {/* Create Group Card */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><PenSquare/> Create New Group</CardTitle><CardDescription>This group will be visible to all users on the community page.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div className="space-y-2"><label htmlFor="groupName" className="font-medium">Group Name</label><Input id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} required /></div>
              <div className="space-y-2"><label htmlFor="groupDesc" className="font-medium">Description</label><Textarea id="groupDesc" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} required /></div>
              <div className="space-y-2"><label htmlFor="groupTopic" className="font-medium">Topic</label><Input id="groupTopic" value={groupTopic} onChange={(e) => setGroupTopic(e.target.value)} /></div>
              {createFeedback && <div className={`p-3 rounded-md text-sm ${createFeedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{createFeedback.message}</div>}
              <Button type="submit" disabled={isCreating} className="w-full">{isCreating ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Create Group'}</Button>
            </form>
          </CardContent>
        </Card>
        {/* Set Topic Card */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare/> Set Group Topic</CardTitle><CardDescription>Set the daily or weekly discussion topic for a group.</CardDescription></CardHeader>
          <CardContent>
             <form onSubmit={handleSetTopic} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="groupSelect" className="font-medium">Select Group</label>
                    <Select onValueChange={setSelectedGroupId} value={selectedGroupId}>
                        <SelectTrigger><SelectValue placeholder="Choose a group..." /></SelectTrigger>
                        <SelectContent>{allGroups.map(g => <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label htmlFor="newTopic" className="font-medium">New Topic Title</label>
                    <Input id="newTopic" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} placeholder="e.g., 'Discuss the movie Inception'" required />
                </div>
                {topicFeedback && <div className={`p-3 rounded-md text-sm ${topicFeedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{topicFeedback.message}</div>}
                <Button type="submit" disabled={isSettingTopic || !selectedGroupId} className="w-full">{isSettingTopic ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Set Topic'}</Button>
             </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}