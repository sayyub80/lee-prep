'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Edit } from 'lucide-react';

export default function EditGroupPage() {
    const router = useRouter();
    const params = useParams();
    const groupId = params.groupId as string;

    const [group, setGroup] = useState({ name: '', description: '', topic: '' });
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (!groupId) return;
        const fetchGroup = async () => {
            try {
                const res = await fetch(`/api/groups/${groupId}`);
                const data = await res.json();
                if (data.success) {
                    setGroup(data.data.group);
                }
            } catch (error) {
                console.error("Failed to fetch group data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGroup();
    }, [groupId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setGroup({ ...group, [e.target.name]: e.target.value });
    };

    const handleUpdateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setFeedback(null);
        try {
            const res = await fetch(`/api/admin/groups/${groupId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(group),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update group');
            
            setFeedback({ type: 'success', message: 'Group updated successfully!' });
            // Optionally redirect after a short delay
            setTimeout(() => router.push('/admin/groups'), 1000);
        } catch (error: any) {
            setFeedback({ type: 'error', message: error.message });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="flex h-64 justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Groups
            </Button>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Edit className="text-blue-500"/> Edit Group</CardTitle>
                    <CardDescription>Update the details for the "{group.name}" group.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateGroup} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Group Name</label>
                            <Input name="name" value={group.name} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea name="description" value={group.description} onChange={handleChange} required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Topic (Optional)</label>
                            <Input name="topic" value={group.topic} onChange={handleChange} />
                        </div>
                        {feedback && <div className={`p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{feedback.message}</div>}
                        <Button type="submit" disabled={isUpdating} className="w-full">
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}