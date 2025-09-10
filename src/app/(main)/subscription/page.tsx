// src/app/(main)/subscription/page.tsx
'use client';
import Princing from '@/components/Princing';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; 

const faqItems = [
    {
        question: "Can I cancel my subscription at any time?",
        answer: "Yes, you can cancel your subscription at any time from your profile settings. Your access will continue until the end of the current billing period."
    },
    {
        question: "How does the \"Student Plan\" verification work?",
        answer: "During checkout for the Student Plan, you will be asked to verify your status using your student email address or by uploading a valid student ID."
    },
    {
        question: "What happens if I use all my earned points?",
        answer: "You can always earn more points by completing challenges and participating in the community, or you can upgrade to a Premium plan for unlimited access."
    },
    {
        question: "Which features are included in the Premium plan?",
        answer: "The Premium plan includes unlimited access to all features, including the AI Speaking Coach, 1-on-1 conversations, all community groups, and advanced progress analytics."
    }
];

export default function SubscriptionPage() {
  return (
    <div className="bg-white">
      <Princing />

      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold text-sm mb-4">
                    <HelpCircle className="w-5 h-5"/> Got Questions?
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Frequently Asked Questions</h2>
                <p className="text-lg text-muted-foreground mt-3">
                    Everything you need to know about our plans, features, and policies.
                </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index + 1}`}>
                        <AccordionTrigger className="text-lg text-left hover:no-underline">
                            {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </section>
    </div>
  );
}