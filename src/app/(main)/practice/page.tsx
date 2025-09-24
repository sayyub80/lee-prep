'use client';
import { useState } from "react";
import { 
    MessageSquare, Bot, Languages, Users, Zap, Loader2, Clock, 
    Trophy, ArrowRight, Sparkles, Mic, RefreshCw 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useChallenge } from "@/context/ChallangeContext"; // Import the context hook

const practiceModes = [
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

export default function PracticePage() {
  // Use the global state from our new context
  const { dailyChallenge, isLoadingChallenge } = useChallenge();
  
  // State for AI-generated topics remains local to this page
  const [practiceTopic, setPracticeTopic] = useState<string | null>(null);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);

  // The local useEffect for fetching data is no longer needed and has been removed.

  const handleGeneratePracticeTopic = async () => {
    setIsGeneratingTopic(true);
    try {
        const res = await fetch('/api/challenges/practice-topic');
        const data = await res.json();
        if (data.success) {
            setPracticeTopic(data.topic);
        }
    } catch (error) {
        console.error("Failed to generate practice topic:", error);
    } finally {
        setIsGeneratingTopic(false);
    }
  };
  
  const renderChallengeSection = () => {
    // Use the loading state from the context
    if (isLoadingChallenge) {
      return (
        <section className="bg-gray-100 rounded-2xl p-8 md:p-12 flex justify-center items-center h-72">
            <Loader2 className="w-8 h-8 animate-spin text-primary"/>
        </section>
      );
    }

    // Use the challenge data from the context
    if (dailyChallenge) {
      return (
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-500 text-white rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
                    <Zap className="w-4 h-4"/><span className="font-medium">Daily Challenge</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Today’s Speaking Task</h2>
                <p className="text-2xl font-light text-indigo-100 mb-8 max-w-2xl mx-auto">"{dailyChallenge.topic}"</p>
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mb-10 text-indigo-200">
                    <div className="flex items-center gap-2"><Clock className="w-5 h-5"/><span className="font-medium">{new Date(dailyChallenge.timeLimit * 1000).toISOString().substr(14, 5)} minutes</span></div>
                    <div className="flex items-center gap-2"><Trophy className="w-5 h-5"/><span className="font-medium">{dailyChallenge.reward} XP Reward</span></div>
                </div>
                <Button size="lg" asChild className="bg-white text-indigo-600 hover:bg-gray-200 shadow-lg transition-transform hover:scale-105 px-10 py-6 text-base font-semibold">
                    <Link href={`/practice/challenge/${dailyChallenge._id}`}>Take the Challenge<ArrowRight className="ml-2 w-5 h-5"/></Link>
                </Button>
            </div>
        </section>
      );
    }

    if (practiceTopic) {
      return (
        <motion.section 
            key={practiceTopic}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-100 text-gray-800 rounded-2xl p-8 md:p-12 shadow-lg border"
        >
            <div className="relative z-10 max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6 shadow-sm border">
                    <Sparkles className="w-5 h-5 text-purple-500"/>
                    <span className="font-medium text-purple-600">AI Generated Topic</span>
                </div>
                <h2 className="text-3xl font-bold mb-6">Your Practice Topic</h2>
                <blockquote className="text-2xl font-medium text-indigo-900 bg-white/60 p-6 rounded-lg shadow-inner mb-10">
                    "{practiceTopic}"
                </blockquote>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button size="lg" asChild className="bg-indigo-600 hover:bg-indigo-700 shadow-lg transition-transform hover:scale-105 px-10 py-6 text-base font-semibold w-full sm:w-auto">
                        <Link href={`/practice/speak?topic=${encodeURIComponent(practiceTopic)}`}>
                            <Mic className="mr-2 w-5 h-5"/>Speak Now
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" onClick={handleGeneratePracticeTopic} disabled={isGeneratingTopic} className="w-full sm:w-auto">
                        {isGeneratingTopic ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="mr-2 w-5 h-5" />}
                        New Topic
                    </Button>
                </div>
            </div>
        </motion.section>
      )
    }

    return (
        <section className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 md:p-12 text-center">
            <div className="max-w-xl mx-auto">
                <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4"/>
                <h2 className="text-2xl font-bold text-gray-800">No Official Challenge Today</h2>
                <p className="text-gray-600 mt-2 mb-6">
                    But that shouldn't stop you! Spark your creativity with a unique topic generated by our AI.
                </p>
                <Button size="lg" onClick={handleGeneratePracticeTopic} disabled={isGeneratingTopic} className="shadow-lg transition-transform hover:scale-105">
                    {isGeneratingTopic ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generate a Practice Topic
                </Button>
            </div>
        </section>
    );
  };
  
  return (
    <div className="px-25 py-12">
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

      {renderChallengeSection()}
    </div>
  );
}