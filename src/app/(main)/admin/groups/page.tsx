'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// --- NEW: Skeleton component for the shimmer effect ---
const SkeletonRow = () => (
    <TableRow>
        <TableCell><div className="h-5 bg-secondary rounded animate-pulse w-3/4"></div></TableCell>
        <TableCell><div className="h-5 bg-secondary rounded animate-pulse w-full"></div></TableCell>
        <TableCell><div className="h-5 bg-secondary rounded animate-pulse w-1/2"></div></TableCell>
        <TableCell className="text-right"><div className="h-8 w-8 bg-secondary rounded-md animate-pulse ml-auto"></div></TableCell>
    </TableRow>
);


export default function ManageGroupsPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/groups');
            const data = await res.json();
            if (data.success) setGroups(data.data);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleDelete = async (groupId: string) => {
        try {
            await fetch(`/api/admin/groups/${groupId}`, { method: 'DELETE' });
            fetchGroups(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete group:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Manage Groups</h1>
                    <p className="text-muted-foreground">Create, edit, and delete user groups.</p>
                </div>
                <Button onClick={() => router.push('/admin/groups/create')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Group
                </Button>
            </div>
            <Card className='p-3'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* --- MODIFICATION: Show skeleton rows while loading --- */}
                        {loading ? (
                            <>
                                <SkeletonRow />
                                <SkeletonRow />
                                <SkeletonRow />
                            </>
                        ) : (
                            groups.map((group) => (
                                <TableRow key={group._id}>
                                    <TableCell className="font-medium">{group.name}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-sm truncate">{group.description}</TableCell>
                                    <TableCell>{group.members.length}</TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onSelect={() => router.push(`/admin/groups/edit/${group._id}`)}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the "{group.name}" group and remove it from all users.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(group._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}