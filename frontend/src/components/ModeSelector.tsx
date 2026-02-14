"use client";

import { Cpu, BrainCircuit, Layers } from "lucide-react";
import type { AnalysisMode } from "@/types";

interface ModeSelectorProps {
  modes: AnalysisMode[];
  selected: string;
  onSelect: (mode: string) => void;
}

const modeIcons: Record<string, typeof Cpu> = {
  local: Cpu,
  ai: BrainCircuit,
  hybrid: Layers,
};

export default function ModeSelector({
  modes,
  selected,
  onSelect,
}: ModeSelectorProps) {
  if (modes.length === 0) return null;

  return (
    <div className="flex items-center gap-2 bg-gray-800/80 rounded-xl p-1.5 border border-gray-700">
      {modes.map((mode) => {
        const Icon = modeIcons[mode.id] || Cpu;
        return (
          <button
            key={mode.id}
            onClick={() => mode.available && onSelect(mode.id)}
            disabled={!mode.available}
            title={mode.description}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selected === mode.id
                ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                : mode.available
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-600 cursor-not-allowed"
            }`}
          >
            <Icon size={15} />
            {mode.name}
          </button>
        );
      })}
    </div>
  );
}
