'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, UserPlus } from 'lucide-react';

export default function AddAdminPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setFeedback(null);
        try {
            // --- FIX: Remove manual token handling ---
            // The browser automatically sends the HttpOnly cookie.
            const res = await fetch('/api/admin/create-admin', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create admin');
            
            setFeedback({ type: 'success', message: `Admin "${name}" created successfully!` });
            setName('');
            setEmail('');
            setPassword('');
        } catch (error: any) {
            setFeedback({ type: 'error', message: error.message });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Add New Admin</h1>
            <Card className="max-w-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserPlus className="text-red-500"/> Create Admin Account</CardTitle>
                    <CardDescription>This will create a new user with full administrator privileges.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Full Name</label>
                            <Input value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                        </div>
                        
                        {feedback && (
                            <div className={`p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {feedback.message}
                            </div>
                        )}
                        
                        <Button type="submit" disabled={isCreating} className="w-full">
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Admin
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}