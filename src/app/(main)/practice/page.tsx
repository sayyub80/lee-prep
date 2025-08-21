// src/app/practice/page.tsx
import { MessageSquare, Bot, Languages, Users } from "lucide-react";
import Link from "next/link";

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
  return (
    <div className="px-25  py-12">
      {/* Section 1: Practice Modes */}
      <section className="mb-20">
        <h1 className="text-4xl font-bold text-center mb-4">Practice Modes</h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Choose your preferred way to practice speaking and get fluent faster.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {practiceModes.map((mode, index) => (
            <Link
              key={index}
              href={mode.href}
              className="border rounded-xl p-6 hover:shadow-md transition-all hover:border-indigo-300 group"
            >
              <div className="mb-4">{mode.icon}</div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-600">
                {mode.title}
              </h3>
              <p className="text-gray-600">{mode.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 2: Daily Challenge */}
       <section className="bg-indigo-50 rounded-2xl p-8 md:p-12">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6">
          <span className="text-indigo-600 font-medium">🔥 Daily Challenge</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">Today’s Speaking Task</h2>
        <p className="text-xl text-gray-600 mb-8">
          "Describe your dream vacation in 1 minute. Focus on fluency and vocabulary!"
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-1">Time</h3>
            <p className="text-2xl text-indigo-600">1:00 min</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-1">Reward</h3>
            <p className="text-2xl text-indigo-600">50 XP</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold mb-1">Participants</h3>
            <p className="text-2xl text-indigo-600">1,248</p>
          </div>
        </div>

        <button className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
          Start Challenge
        </button>

        {/* Leaderboard Preview (Top 3) */}
        <div className="mt-12">
          <h3 className="font-semibold mb-4">Today’s Top Performers</h3>
          <div className="flex justify-center gap-6">
            {[
              { name: "Alex", score: "98%" },
              { name: "Priya", score: "95%" },
              { name: "Sam", score: "93%" },
            ].map((user, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${index === 0 ? "bg-amber-100" : "bg-gray-100"}`}>
                  <span className="font-medium">{index + 1}</span>
                </div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.score}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}