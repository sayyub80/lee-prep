
import { ArrowRight, Mic, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Hero() {
  const benefits = [
    { text: 'Practice 1-on-1 with Peers' },
    { text: 'Get Instant AI Feedback' },
    { text: 'Join Live Group Discussions' },
  ];

  return (
    <section className="py-20 md:py-32  bg-white">
      <div className=" px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900">
            The Most Effective Way to Achieve English Fluency
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Stop just learning rules. Start speaking from day one. Lee Prep combines cutting-edge AI with a global community to provide the most immersive and practical path to confident, real-world English.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="shadow-lg">
              <Link href="/practice">
                Start Practicing Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
                <Link href="/practice/ai">
                    <Mic className="mr-2 h-5 w-5" />
                    Try AI Coach Demo
                </Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 pt-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-500">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};