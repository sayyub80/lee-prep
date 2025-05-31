import React from 'react'
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown } from 'lucide-react';
function Princing() {
     const pricingPlans = [
    {
      name: "Free",
      price: "₹0",
      description: "Basic speaking practice",
      features: ["5 minutes AI coach daily", "Community forums", "Basic pronunciation feedback"],
      button: "Start Free",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "₹199",
      period: "/month",
      description: "Complete learning experience",
      features: [
        "Unlimited AI coaching",
        "1-on-1 native speaker sessions",
        "Advanced pronunciation analysis",
        "Offline mode access",
        "Progress tracking & reports",
      ],
      button: "Go Premium",
      highlighted: true,
    },
    {
      name: "Student",
      price: "₹99",
      period: "/month",
      description: "For students with valid ID",
      features: [
        "Unlimited AI coaching",
        "Group practice sessions",
        "Exam preparation materials",
        "Progress tracking",
      ],
      button: "Get Student Plan",
      highlighted: false,
    },
  ];
  return (
    <div>
       <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-3xl font-bold tracking-tight">Affordable Pricing</h2>
              <p className="text-muted-foreground mt-4">
                Choose the plan that fits your learning needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`border rounded-lg overflow-hidden ${
                    plan.highlighted
                      ? "border-primary shadow-lg relative"
                      : "border-border"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-bl">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <div
                    className={`p-6 ${
                      plan.highlighted ? "bg-primary/5" : "bg-card"
                    }`}
                  >
                    <h3 className="font-medium text-lg">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground ml-1">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">
                      {plan.description}
                    </p>
                  </div>
                  <div className="p-6 border-t border-border">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <Button
                        className={`w-full ${
                          plan.highlighted ? "" : "variant-outline"
                        }`}
                        variant={plan.highlighted ? "default" : "outline"}
                      >
                        {plan.highlighted && (
                          <Crown className="mr-2 h-4 w-4" />
                        )}
                        {plan.button}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
    </div>
  )
}

export default Princing
