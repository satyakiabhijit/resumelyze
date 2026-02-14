"use client";

import { motion } from "framer-motion";

const stages = [
  { text: "Extracting resume content...", emoji: "📄" },
  { text: "Parsing job description...", emoji: "📋" },
  { text: "Matching keywords...", emoji: "🔍" },
  { text: "Scoring sections...", emoji: "📊" },
  { text: "Computing ATS compatibility...", emoji: "🤖" },
  { text: "Generating insights...", emoji: "💡" },
  { text: "Preparing your report...", emoji: "✨" },
];

export default function LoadingAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="glass-card p-8 mb-8 text-center max-w-lg mx-auto"
    >
      {/* Animated spinner */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-brand-500 rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
      </div>

      {/* Stage text */}
      <div className="space-y-2">
        {stages.map((stage, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.8, duration: 0.4 }}
            className="text-gray-400 text-sm"
          >
            {stage.emoji} {stage.text}
          </motion.div>
        ))}
      </div>

      <p className="text-gray-500 text-xs mt-4">
        This may take 10-30 seconds depending on analysis mode
      </p>
    </motion.div>
  );
}
