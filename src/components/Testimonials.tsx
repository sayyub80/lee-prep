
"use client";
import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  { quote: "My pronunciation improved in just 2 weeks! The AI feedback is incredibly accurate.", author: "Sarah K.", role: "Spanish Learner" },
  { quote: "The daily challenges keep me motivated. I’ve never stuck with an app this long.", author: "Raj P.", role: "French Learner" },
  { quote: "Real-time translation helped me practice Japanese conversations naturally.", author: "Emma L.", role: "Japanese Learner" },
  { quote: "The grammar correction feature is a game-changer for my writing skills.", author: "David M.", role: "German Learner" },
  { quote: "AI debates made me confident in speaking about complex topics.", author: "Priya S.", role: "English Learner" },
  { quote: "Perfect for interview preparation with industry-specific vocabulary.", author: "Alex T.", role: "Business English" },
  { quote: "The community groups are so supportive. I've made friends while practicing!", author: "Maria G.", role: "Italian Learner" },
  { quote: "I finally understand phrasal verbs thanks to the AI Coach.", author: "Chen W.", role: "Chinese Learner" },
];

const TestimonialCard = ({ quote, author, role }: { quote: string, author: string, role: string }) => (
  <Card className="w-[350px] h-full flex-shrink-0">
    <CardContent className="p-6 flex flex-col justify-between h-full">
      <p className="text-lg font-medium">"{quote}"</p>
      <div className="flex items-center gap-3 mt-4">
        <Avatar>
          <AvatarFallback>{author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Testimonials() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.setAttribute("data-animated", "true");
      const scrollerInner = scroller.querySelector('.scroller__inner');
      if (scrollerInner) {
        const scrollerContent = Array.from(scrollerInner.children);
        scrollerContent.forEach(item => {
          const duplicatedItem = item.cloneNode(true) as HTMLElement;
          duplicatedItem.setAttribute("aria-hidden", "true");
          scrollerInner.appendChild(duplicatedItem);
        });
      }
    }
  }, []);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight">Loved by Learners Worldwide</h2>
          <p className="text-lg text-muted-foreground mt-4">
            Don't just take our word for it. Here's what our community is saying about their progress.
          </p>
        </div>

        <div className="scroller" ref={scrollerRef}>
          <div className="scroller__inner flex gap-4">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}