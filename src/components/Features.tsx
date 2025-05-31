
import { 
  MessagesSquare, 
  Mic, 
  Brain, 
  Medal, 
  ArrowUpRight, 
  Globe, 
  Gamepad2,
  BookOpen,
  Speech,
  Users,
  BadgeDollarSign,
  Repeat,
  Languages
} from 'lucide-react';

const Features = () => {
  const coreFeatures = [
    {
      icon: <MessagesSquare className="h-6 w-6 text-indigo-600" />,
      title: "Live 1-on-1 Conversations",
      description: "Practice with native speakers or peers matched by AI based on interests and skill levels."
    },
    {
      icon: <Brain className="h-6 w-6 text-indigo-600" />,
      title: "AI-Powered Speaking Coach",
      description: "Get instant feedback on pronunciation, grammar, and fluency as you speak."
    },
    {
      icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
      title: "Structured Learning Paths",
      description: "Follow courses from beginner to advanced with themed lessons for different contexts."
    },
    {
      icon: <Users className="h-6 w-6 text-indigo-600" />,
      title: "Group Voice Chats",
      description: "Join topic-based discussions moderated by experts to practice in a group setting."
    }
  ];

  const innovativeFeatures = [
    {
      icon: <BadgeDollarSign className="h-6 w-6 text-indigo-600" />,
      title: '"Speak & Earn" Program', // Corrected string formatting
      description: "Earn points for daily speaking practice that can be redeemed for premium features."
    },
     {
    icon: <Languages className="w-8 h-8 text-indigo-600" />,
    title: "Real-Time Translation",
    description: "Speak in your language, get instant translations for bilingual practice.",
  },
    {
      icon: <Speech className="h-6 w-6 text-indigo-600" />,
      title: '"Role-Play" Mode', // Corrected string formatting
      description: "Simulate real-life scenarios like ordering food or job interviews with AI or peers."
    },
    {
      icon: <Medal className="h-6 w-6 text-indigo-600" />,
      title: "Daily Challenges & Streaks",
      description: "Build habits with daily speaking challenges and compete on leaderboards."
    },
    
  ];

  return (
    <section className="px-25 py-12 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Features That Make Us Different</h2>
          <p className="text-muted-foreground mt-4">
            Our platform combines practical features with innovative learning methods to help you become fluent fast.
          </p>
        </div>

        <div className="space-y-12">
          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <span className="bg-primary/10 text-primary p-1 rounded-md mr-2">
                <Mic className="h-5 w-5" />
              </span>
              Core Features
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreFeatures.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="mb-4">{feature.icon}</div>
                  <h4 className="font-medium mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6 flex items-center">
              <span className="bg-speak-purple/10 text-speak-purple p-1 rounded-md mr-2">
                <Gamepad2 className="h-5 w-5" />
              </span>
              Innovative Features
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {innovativeFeatures.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="mb-4">{feature.icon}</div>
                  <h4 className="font-medium mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        
      </div>
    </section>
  );
};

export default Features;
