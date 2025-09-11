'use client';
import { motion } from 'framer-motion';
import { AIPersona } from '@/lib/ai-personas';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { ArrowRight } from 'lucide-react';

interface AIPersonaSelectorProps {
  personas: AIPersona[];
  onSelectPersona: (persona: AIPersona) => void;
}

export const AIPersonaSelector: React.FC<AIPersonaSelectorProps> = ({ personas, onSelectPersona }) => {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full bg-secondary/30 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight">Choose Your AI Speaking Partner</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Select a scenario to start your personalized practice session.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="cursor-pointer"
              onClick={() => onSelectPersona(persona)}
            >
              <Card className="h-full group overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${persona.bgColor}/10`}>
                      <div className={persona.textColor}>{persona.avatar}</div>
                    </div>
                    <ArrowRight className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-xl mb-1">{persona.name}</CardTitle>
                  <CardDescription>{persona.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};