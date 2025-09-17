'use client';
import { Flame, Gift, Users, Trophy, Clock, Zap, Crown, BookOpen, MessageSquare, ArrowRight } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Loader2 } from "lucide-react";
import { CircularProgress } from "./ui/CircularProgress";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const handleInvite = () => {
    if (navigator.share && user) {
        navigator.share({
            title: 'Join me on Lee Prep!',
            text: `I'm learning English on Lee Prep. Join me with my referral code to get bonus points: ${user.referralCode}`,
            url: window.location.origin,
        })
        .catch((error) => console.log('Error sharing', error));
    } else {
        if(user) {
            navigator.clipboard.writeText(`I'm learning English on Lee Prep. Join me with my referral code to get bonus points: ${user.referralCode}. Sign up at: ${window.location.origin}`);
            alert("Referral link copied to clipboard!");
        }
    }
  };


  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center h-[calc(100vh-80px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary"/>
      </div>
    );
  } 

  if (!user) {
    return (
      <div className="container py-8">
        <p>Please log in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <main className="px-25  py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Welcome back, {user.name}</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            title="Current Streak"
            value={`${user.streak || 0} days`}
            description={user.streak ? `Keep it going!` : 'Start your streak today!'}
            color="from-orange-100 to-orange-50"
          />
          <StatCard
            icon={<Gift className="w-5 h-5 text-purple-500" />}
            title="Total Rewards"
            value={`${user.credits || 0} XP`}
            description="Redeem for subscription time"
            color="from-purple-100 to-purple-50"
          />
           <StatCard
            icon={<Users className="w-5 h-5 text-green-500" />}
            title="Referrals"
            value={user.referrals?.length || 0}
            description={`Your code: ${user.referralCode}`}
            color="from-green-100 to-green-50"
          />
          <StatCard
            icon={<Crown className="w-5 h-5 text-amber-500" />}
            title="Subscription"
            value={user.subscription?.plan === 'pro' ? 'Pro Member' : 'Free Plan'}
            description={user.subscription?.plan === 'pro' && user.subscription.endDate ? `Renews on ${new Date(user.subscription.endDate).toLocaleDateString()}` : 'Upgrade for full features'}
            color="from-amber-100 to-amber-50"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-lg flex flex-col md:flex-row items-center gap-6 p-6">
              <div className="flex-shrink-0">
                  <CircularProgress value={user.dailyProgress?.completed || 0} />
              </div>
              <div className="flex-grow text-center md:text-left">
                  <CardTitle className="text-2xl mb-1">Your Daily Goal</CardTitle>
                  <CardDescription className="mb-4">Complete your daily goal to maintain your streak and earn rewards.</CardDescription>
                  <Button size="lg" asChild>
                    <Link href="/practice">
                        Practice Now <ArrowRight className="ml-2 h-4 w-4"/>
                    </Link>
                  </Button>
              </div>
          </Card>

          <div className="space-y-6 flex flex-col">
            <Card className="flex flex-col bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg flex-grow">
              <CardHeader>
                  <div className="bg-white/20 p-2 rounded-full w-fit mb-3"><Zap className="w-5 h-5"/></div>
                  <CardTitle className="text-xl">Today's Challenge</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                  <p>"Describe your dream vacation in 1 minute."</p>
              </CardContent>
              <CardFooter>
                  <Button variant="secondary" className="w-full bg-white/90 text-black hover:bg-white">Start Challenge</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* --- SMALLER, REFINED INVITE FRIENDS CARD --- */}
        <div className="mt-8 grid sm:grid-cols-2 gap-6">
            <SecondaryActionCard 
                title="View Courses"
                description="Explore structured learning paths from beginner to advanced."
                icon={<BookOpen/>}
                href="/courses"
            />
             <div onClick={handleInvite} className="cursor-pointer">
                <SecondaryActionCard 
                    title="Invite Friends & Earn"
                    description="Earn 500 points for each friend you invite."
                    icon={<Gift/>} // Reward Icon Added
                    href="#"
                />
            </div>
        </div>
      </main>
    </div>
  );
}

// Reusable Components
function StatCard({ icon, title, value, description, color }: { icon: React.ReactNode; title: string; value: string | number; description: string; color: string }) {
  return (
    <div className={`border rounded-xl p-4 bg-gradient-to-br ${color} transition-transform hover:scale-[1.02] hover:shadow-md`}>
      <div className="flex items-center gap-2 mb-2">{icon}<h3 className="font-medium text-sm text-gray-700">{title}</h3></div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-600 mt-1">{description}</p>
    </div>
  );
}

function SecondaryActionCard({ title, description, icon, href }: { title: string; description:string; icon: React.ReactNode; href: string; }) {
    return (
        <Link href={href} className="group flex items-start h-full gap-4 rounded-xl border bg-card p-5 shadow-sm hover:bg-secondary/60 transition-colors">
            <div className="bg-primary/10 p-3 rounded-full text-primary mt-1">
                {icon}
            </div>
            <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto text-muted-foreground transition-transform group-hover:translate-x-1 flex-shrink-0"/>
        </Link>
    )
}