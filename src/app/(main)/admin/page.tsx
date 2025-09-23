'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Crown, MessageSquare, Trophy, Loader2, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminStats {
  totalUsers: number;
  subscribedUsers: number;
  totalGroups: number;
  totalSubmissions: number;
}

interface SignupData {
  date: string;
  count: number;
}

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
  const [signupData, setSignupData] = useState<SignupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, signupsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/analytics/user-signups')
        ]);
        const statsData = await statsRes.json();
        const signupsData = await signupsRes.json();
        if (statsData.success) setStats(statsData.data);
        if (signupsData.success) setSignupData(signupsData.data);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of your application's activity and growth.</p>
      </div>
      
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
      
      {/* --- NEW USER SIGNUPS CHART --- */}
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart className="text-blue-500" /> User Signups</CardTitle>
            <CardDescription>New users who have joined in the last few days.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={signupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="New Users" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
      </Card>
    </div>
  );
}