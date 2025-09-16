
'use client';
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const pricingPlans = [
    {
      name: "Free",
      price: "₹0",
      description: "Get a feel for our platform with basic access.",
      features: [
        "5 minutes of AI coaching daily", 
        "Access to public community forums", 
        "Basic pronunciation feedback"
    ],
      buttonText: "Start for Free",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "₹199",
      period: "/month",
      description: "The complete, unlimited learning experience.",
      features: [
        "Unlimited AI coaching",
        "Unlimited 1-on-1 conversations",
        "Advanced pronunciation analysis",
        "Join all community voice chats",
        "Full course access & progress tracking",
      ],
      buttonText: "Go Premium",
      highlighted: true,
    },
    {
      name: "Student",
      price: "₹99",
      period: "/month",
      description: "A special plan for verified students.",
      features: [
        "All Premium features",
        "Access to exam preparation materials",
        "Student-only community groups",
      ],
      buttonText: "Get Student Plan",
      highlighted: false,
    },
];

export default function Princing() {
  return (
    <section className="py-20  md:py-28 bg-white">
      <div className=" px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            Unlock your full potential with a plan that fits your learning style.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`border rounded-2xl overflow-hidden shadow-lg flex flex-col ${
                plan.highlighted ? "border-primary ring-2 ring-primary" : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="bg-primary text-center py-2 text-sm font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <div className="p-8 flex-grow">
                <h3 className="font-bold text-2xl">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-1">
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mt-2 h-10">
                  {plan.description}
                </p>
                <ul className="space-y-4 mt-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 mt-auto">
                  <Button
                    size="lg"
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.highlighted && (
                      <Crown className="mr-2 h-4 w-4" />
                    )}
                    {plan.buttonText}
                  </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}