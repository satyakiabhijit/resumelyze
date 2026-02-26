"use client";

import { BrainCircuit } from "lucide-react";
import type { AnalysisMode } from "@/types";

interface ModeSelectorProps {
  modes: AnalysisMode[];
  selected: string;
  onSelect: (mode: string) => void;
}

export default function ModeSelector({ modes }: ModeSelectorProps) {
  // Only ML mode remains — show status badge instead of a selector
  const ml = modes[0];
  if (!ml) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-sm">
      <BrainCircuit size={15} className={ml.available ? "text-brand-600" : "text-gray-400"} />
      <span className={ml.available ? "text-brand-700 font-medium" : "text-gray-500"}>
        {ml.available ? "ML Model Ready" : "ML Server Offline"}
      </span>
      <span
        className={`ml-1 w-2 h-2 rounded-full ${
          ml.available ? "bg-green-500 animate-pulse" : "bg-red-400"
        }`}
      />
    </div>
  );
}
