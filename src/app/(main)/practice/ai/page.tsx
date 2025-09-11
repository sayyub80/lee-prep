"use client";
import { useState } from "react";
import { AIPersona, personas } from "@/lib/ai-personas";
import { AIPersonaSelector } from "@/components/AIPersonaSelector";
import { AIChatInterface } from "@/components/AIChatInterface";

export default function AIPracticePage() {
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null);

  const handleSelectPersona = (persona: AIPersona) => {
    setSelectedPersona(persona);
  };

  const handleGoBack = () => {
    setSelectedPersona(null);
  };

  if (!selectedPersona) {
    return <AIPersonaSelector personas={personas} onSelectPersona={handleSelectPersona} />;
  }

  return <AIChatInterface persona={selectedPersona} onGoBack={handleGoBack} />;
}