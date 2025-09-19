'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Crown, MessageSquare, Trophy, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStats {
  totalUsers: number;
  subscribedUsers: number;
  totalGroups: number;
  totalSubmissions: number;
}

// --- MODIFIED StatCard component to accept colors ---
const StatCard = ({ title, value, icon: Icon, iconColor, bgColor }: { title: string; value: string | number; icon: React.ElementType, iconColor: string, bgColor: string }) => (
  <Card className={cn("transition-transform hover:scale-[1.02] hover:shadow-md", bgColor)}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-800">{title}</CardTitle>
      <Icon className={cn("h-5 w-5", iconColor)} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </CardContent>
  </Card>
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">An overview of your application's activity and growth.</p>
      
      {/* --- UPDATED StatCard calls with color props --- */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers ?? 0} 
          icon={Users}
          iconColor="text-blue-600"
          bgColor="bg-gradient-to-br from-blue-100 to-blue-50"
        />
        <StatCard 
          title="Subscribed Users" 
          value={stats?.subscribedUsers ?? 0} 
          icon={Crown}
          iconColor="text-amber-600"
          bgColor="bg-gradient-to-br from-amber-100 to-amber-50"
        />
        <StatCard 
          title="Total Groups" 
          value={stats?.totalGroups ?? 0} 
          icon={MessageSquare}
          iconColor="text-indigo-600"
          bgColor="bg-gradient-to-br from-indigo-100 to-indigo-50"
        />
        <StatCard 
          title="Challenge Submissions" 
          value={stats?.totalSubmissions ?? 0} 
          icon={Trophy}
          iconColor="text-green-600"
          bgColor="bg-gradient-to-br from-green-100 to-green-50"
        />
      </div>
      
      {/* You can add charts or recent activity here in the future */}
    </div>
  );
}