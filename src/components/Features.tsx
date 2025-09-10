// src/components/Features.tsx
import { MessagesSquare, Brain, Users, Languages } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <MessagesSquare className="h-8 w-8 text-indigo-500" />,
      color: "bg-indigo-100",
      title: "1-on-1 Conversation",
      description: "Practice speaking with peers from around the world in live, guided conversations."
    },
    {
      icon: <Brain className="h-8 w-8 text-purple-500" />,
      color: "bg-purple-100",
      title: "AI-Powered Speaking Coach",
      description: "Get instant, detailed feedback on your pronunciation, grammar, and fluency from our advanced AI."
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      color: "bg-green-100",
      title: "Community Group Chats",
      description: "Join topic-based discussion groups moderated by experts to practice in a relaxed, social setting."
    },
    {
      icon: <Languages className="h-8 w-8 text-rose-500" />,
      color: "bg-rose-100",
      title: "Real-Time Voice Translation",
      description: "Build confidence by speaking in your native language and hearing the instant English translation."
    }
  ];

  return (
    <section className="py-20 px-12 md:py-28 bg-white">
      <div className=" px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">A Smarter Way to Learn</h2>
          <p className="text-lg text-gray-600 mt-4">
            Our platform is built on a foundation of proven learning techniques, delivered through modern technology.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50/50 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <div className={`flex items-center justify-center h-10 w-10 rounded-2xl ${feature.color} mb-6`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};