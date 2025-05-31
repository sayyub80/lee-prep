
import { ArrowRight, Mic, CheckCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const Hero = () => {
  const benefits = [
    { text: 'Practice with native speakers', icon: <CheckCircle className="h-4 w-4 text-primary" /> },
    { text: 'AI pronunciation feedback', icon: <CheckCircle className="h-4 w-4 text-primary" /> },
    { text: 'Earn rewards while you learn', icon: <CheckCircle className="h-4 w-4 text-primary" /> },
  ];

  return (
    <section className="px-12 py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <div className="inline-block rounded-full bg-purple-100 px-3 py-1 text-sm text-primary">
              <span className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5" />
                <span>Speak & Earn Program</span>
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              Master English by <span className="gradient-text">Speaking</span> Daily
            </h1>
            <p className="text-muted-foreground md:text-xl">
              Practice conversations with peers, get AI feedback on pronunciation,
              and earn rewards while improving your English fluency.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button size="lg" asChild>
                <Link href="/practice">
                  Start Speaking <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                <Mic className="mr-2 h-4 w-4" />
                Try Demo
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  {benefit.icon}
                  <span className="text-sm text-muted-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/60 to-purple-400/60 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-card p-6 rounded-lg border shadow-lg">
              <div className="flex items-center mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                    <Mic className="w-6 h-6" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">Live Practice Session</h3>
                  <p className="text-sm text-muted-foreground">5 users speaking now</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-secondary rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Topic:</span> Discussing favorite hobbies in English
                  </p>
                </div>
                <div className="flex -space-x-2 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} 
                      className={`w-8 h-8 rounded-full border-2 border-background bg-speak-${i % 2 ? 'lavender' : 'purple'} flex items-center justify-center text-xs font-medium text-white`}>
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium">+2</div>
                </div>
                <Button className="w-full justify-between">
                  Join Conversation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
