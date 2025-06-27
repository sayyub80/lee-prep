'use client'
import { Flame, Gift, Users, Trophy, Clock, Zap, Crown, BookOpen, MessageSquare } from "lucide-react";
import Navbar from "@/components/navbar/Navbar";
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen">

        <div className="px-25 py-8 container">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  } 

  if (!user) {
    return (
      <div className="min-h-screen">
       
        <div className="px-25 py-8 container">
          <p>Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      
      
      <div className="px-30 py-8 ">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {user.name}</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Daily Streak */}
          <StatCard
            icon={<Flame className="w-6 h-6 text-orange-500" />}
            title="Current Streak"
            value={`${user.streak || 0} days`}
            description={user.streak ? `Maintain for ${7 - (user.streak % 7)} more days to earn bonus!` : 'Start your streak today!'}
            color="bg-orange-50"
          />

          {/* Rewards */}
          <StatCard
            icon={<Gift className="w-6 h-6 text-purple-500" />}
            title="Total Rewards"
            value={`${user.credits || 0} XP`}
            description="Redeem for subscription time"
            color="bg-purple-50"
          />

          {/* Referrals */}
          <StatCard
            icon={<Users className="w-6 h-6 text-green-500" />}
            title="Referrals"
            value={user.referrals?.length || 0}
            description={`Your code: ${user.referralCode}`}
            color="bg-green-50"
          />

          {/* Subscription */}
          <StatCard
            icon={<Crown className="w-6 h-6 text-amber-500" />}
            title="Subscription"
            value={user.subscription?.plan === 'pro' ? 'Pro Member' : 'Free Plan'}
            description={user.subscription?.plan === 'pro' ? 
              `Renews on ${new Date(user.subscription.endDate).toLocaleDateString()}` : 
              'Upgrade for full features'}
            color="bg-amber-50"
          />
        </div>

        {/* Progress Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Daily Goal */}
          <ProgressCard
            title="Daily Goal"
            icon={<Zap className="w-5 h-5" />}
            current={user.dailyProgress?.completed || 0}
            target={user.dailyProgress?.goal || 100}
            unit="%"
            color="bg-blue-100 text-blue-600"
          />

          {/* Speaking Time */}
          <ProgressCard
            title="Speaking Time"
            icon={<Clock className="w-5 h-5" />}
            current={formatSpeakingTime(user.speakingTimeMinutes || 0)}
            target="4h"
            color="bg-indigo-100 text-indigo-600"
          />

          {/* Accuracy */}
          <ProgressCard
            title="Accuracy"
            icon={<Trophy className="w-5 h-5" />}
            current={user.accuracy || 0}
            target={100}
            unit="%"
            color="bg-emerald-100 text-emerald-600"
          />
        </div>

        {/* Recent Achievements */}
        {user.achievements?.length > 0 && (
          <div className="bg-white border rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Recent Achievements
            </h3>
            <div className="flex flex-wrap gap-4">
              {user.achievements.slice(0, 4).map((achievement, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                >
                  🏆 {achievement}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
       <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
  <ActionButton 
    title="Invite Friends" 
    icon={<Users className="w-6 h-6" />} 
    color="bg-gradient-to-r from-purple-500 to-indigo-600" 
  />
  <ActionButton 
    title="Practice Now" 
    icon={<MessageSquare className="w-6 h-6" />} 
    color="bg-gradient-to-r from-blue-500 to-teal-400" 
  />
  <ActionButton 
    title="Today's Challenge" 
    icon={<Zap className="w-6 h-6" />} 
    color="bg-gradient-to-r from-orange-400 to-pink-500" 
  />
  <ActionButton 
    title="View Courses" 
    icon={<BookOpen className="w-6 h-6" />} 
    color="bg-gradient-to-r from-green-500 to-emerald-600" 
  />
</div>
      </div>
    </div>
  );
}

// Helper function to format speaking time
function formatSpeakingTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

// Reusable Components
function StatCard({ icon, title, value, description, color }: { icon: React.ReactNode; title: string; value: string | number; description: string; color: string }) {
  return (
    <div className={`border rounded-xl p-5 ${color}`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function ProgressCard({ title, icon, current, target, unit = "", color }: { title: string; icon: React.ReactNode; current: string | number; target: string | number; unit?: string; color: string }) {
  const percentage = typeof current === "number" && typeof target === "number" 
    ? (current / target) * 100 
    : 0;
  
  return (
    <div className="border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <p className="text-2xl font-bold">{current}{unit}</p>
        <p className="text-gray-500 text-sm">/ {target}{unit}</p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
function ActionButton({ title, icon, color }: { title: string; icon: React.ReactNode; color: string }) {
  return (
    <button
      className={`
        ${color}
        text-white
        p-4
        cursor-pointer
        rounded-2xl
        flex items-center gap-4 justify-between
        shadow-md
        hover:scale-105
        hover:shadow-lg
        transition
        w-full
      `}
      style={{ minHeight: 64 }}
    >
      <span className="flex items-center gap-3 text-lg font-semibold">
        <span className="text-2xl">{icon}</span>
        {title}
      </span>
      <span className="text-xl opacity-70">&#8594;</span>
    </button>
  );
}