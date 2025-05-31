// src/components/Testimonials.tsx
"use client"; // Required for interactivity

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote: "My pronunciation improved in just 2 weeks! The AI feedback is incredibly accurate.",
    author: "Sarah K.",
    role: "Spanish Learner",
    avatar: "/avatars/1.jpg", // Add your avatar images
  },
  {
    id: 2,
    quote: "The daily challenges keep me motivated. I’ve never stuck with an app this long.",
    author: "Raj P.",
    role: "French Learner",
    avatar: "/avatars/2.jpg",
  },
  {
    id: 3,
    quote: "Real-time translation helped me practice Japanese conversations naturally.",
    author: "Emma L.",
    role: "Japanese Learner",
    avatar: "/avatars/3.jpg",
  },
  {
    id: 4,
    quote: "The grammar correction feature is a game-changer for my writing skills.",
    author: "David M.",
    role: "German Learner",
    avatar: "/avatars/4.jpg",
  },
  {
    id: 5,
    quote: "AI debates made me confident in speaking about complex topics.",
    author: "Priya S.",
    role: "English Learner",
    avatar: "/avatars/5.jpg",
  },
  {
    id: 6,
    quote: "Perfect for interview preparation with industry-specific vocabulary.",
    author: "Alex T.",
    role: "Business English",
    avatar: "/avatars/6.jpg",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    setDirection("right");
    setCurrentIndex((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrev = () => {
    setDirection("left");
    setCurrentIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  // Animation variants
  const variants = {
    enter: (direction: string) => ({
      x: direction === "right" ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: string) => ({
      x: direction === "right" ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <section className="py-10 bg-gray-100">
      <div className="">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        
        <div className="relative h-96 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={testimonials[currentIndex].id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-6"
            >
              <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <img 
                  src={testimonials[currentIndex].avatar} 
                  alt={testimonials[currentIndex].author}
                  className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                />
                <p className="text-lg italic text-gray-600 mb-6">
                  "{testimonials[currentIndex].quote}"
                </p>
                <div>
                  <p className="font-semibold">{testimonials[currentIndex].author}</p>
                  <p className="text-sm text-gray-500">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${currentIndex === index ? "bg-indigo-600" : "bg-gray-300"}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}