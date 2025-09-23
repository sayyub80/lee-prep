'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import io, { Socket } from 'socket.io-client';
import { Card } from '@/components/ui/card';

// --- NEW: Custom Modal Component ---
const CustomUserModal = ({ user, isOpen, onClose, onSave, isUpdating, setCredits, setRole, setStatus, credits, status }: any) => {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md m-4">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-semibold">Manage {user.name}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium">Credits (XP)</label>
                        <Input type="number" value={credits} onChange={e => setCredits(Number(e.target.value))} />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="px-6 py-4 bg-muted/50 flex justify-end gap-2 border-t">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={onSave} disabled={isUpdating}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default function ManageUsersPage() {
     const { user: loggedInAdmin } = useAuth(); // Get the currently logged-in admin
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [credits, setCredits] = useState(0);
    const [status, setStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
        socketRef.current = socket;
        return () => {
            socket.disconnect();
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleManageClick = (user: any) => {
        setSelectedUser(user);
        setCredits(user.credits);
        setStatus(user.status);
        setIsModalOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        const updatedData = { credits: Number(credits), status };
        try {
            const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (res.ok) {
                if (updatedData.status === 'suspended' && socketRef.current) {
                    socketRef.current.emit('admin:suspend-user', selectedUser._id);
                }
                setIsModalOpen(false); // Close the modal
                fetchUsers(); // Re-fetch all data to ensure consistency
            } else {
                throw new Error("Failed to update user");
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        } finally {
            setIsUpdating(false);
        }
    };
    
    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex h-64 justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">View and manage all users in the application.</p>
                </div>
                <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow >
                                <TableHead className='pl-5 '>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(user => (
                                <TableRow key={user._id}>
                                    <TableCell className="font-medium pl-5">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                    <TableCell><Badge variant={user.status === 'active' ? 'outline' : 'destructive'}>{user.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                className="h-8 w-8 p-0"
                                                disabled={user._id === loggedInAdmin?.id}
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onSelect={() => handleManageClick(user)}>Manage User</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
            
            <CustomUserModal
                isOpen={isModalOpen}
                user={selectedUser}
                onClose={() => setIsModalOpen(false)}
                onSave={handleUpdateUser}
                isUpdating={isUpdating}
                credits={credits}
                status={status}
                setCredits={setCredits}
                setStatus={setStatus}
            />
        </>
    );
}