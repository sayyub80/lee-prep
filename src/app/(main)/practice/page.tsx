// src/app/(main)/practice/page.tsx
'use client';
import { useState, useEffect } from "react";
import { MessageSquare, Bot, Languages, Users, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const practiceModes = [
  // ... (practiceModes array remains the same)
  {
    title: "1:1 Conversation",
    desc: "Practice with a native speaker or tutor in real-time.",
    icon: <MessageSquare className="w-8 h-8 text-indigo-600" />,
    href: "/practice/one-to-one",
  },
  {
    title: "Talk with AI",
    desc: "Get instant feedback on pronunciation and grammar from AI.",
    icon: <Bot className="w-8 h-8 text-indigo-600" />,
    href: "/practice/ai",
  },
  {
    title: "Real-Time Translation",
    desc: "Speak in your language, get translated output for practice.",
    icon: <Languages className="w-8 h-8 text-indigo-600" />,
    href: "/practice/translate",
  },
  {
    title: "Group Discussions",
    desc: "Join group discussions with other learners.",
    icon: <Users className="w-8 h-8 text-indigo-600" />,
    href: "/practice/groups",
  },
];

interface Challenge {
  _id: string;
  topic: string;
  reward: number;
  timeLimit: number;
}

export default function PracticePage() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeLoading, setChallengeLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch('/api/challenges/today');
        const data = await res.json();
        if (data.success) {
          setChallenge(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch today's challenge:", error);
      } finally {
        setChallengeLoading(false);
      }
    };
    fetchChallenge();
  }, []);
  
  return (
    <div className="px-25 py-12">
      {/* Section 1: Practice Modes (no changes here) */}
      <section className="mb-20">
        <h1 className="text-4xl font-bold text-center mb-4">Practice Modes</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Choose your preferred way to practice speaking and get fluent faster.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {practiceModes.map((mode, index) => (
            <Link key={index} href={mode.href} className="border rounded-xl p-6 hover:shadow-md transition-all hover:border-indigo-300 group">
              <div className="mb-4">{mode.icon}</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-600">{mode.title}</h3>
              <p className="text-gray-600">{mode.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 2: Daily Challenge - NOW DYNAMIC */}
      <section className="bg-indigo-50 rounded-2xl p-8 md:p-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6">
            <span className="text-indigo-600 font-medium"><Zap className="w-4 h-4 inline-block mr-1"/> Daily Challenge</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Today’s Speaking Task</h2>
          
          {challengeLoading ? (
            <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary my-8"/>
          ) : challenge ? (
            <>
              <p className="text-xl text-gray-600 mb-8">
                "{challenge.topic}"
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-1">Time</h3>
                  <p className="text-2xl text-indigo-600">{new Date(challenge.timeLimit * 1000).toISOString().substr(14, 5)} min</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold mb-1">Reward</h3>
                  <p className="text-2xl text-indigo-600">{challenge.reward} XP</p>
                </div>
              </div>
              <Button size="lg" asChild className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
                  {/* UPDATE THIS HREF LATER when the challenge page is built */}
                  <Link href={`/practice/challenge/${challenge._id}`}>Start Challenge</Link>
              </Button>
            </>
          ) : (
             <p className="text-gray-500 my-8">No challenge is available today. Please check back tomorrow!</p>
          )}

        </div>
      </section>
    </div>
  );
}