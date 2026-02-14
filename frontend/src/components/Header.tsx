"use client";

import { motion } from "framer-motion";
import { Activity, Wifi, WifiOff } from "lucide-react";

interface HeaderProps {
  backendStatus: "checking" | "online" | "offline";
}

export default function Header({ backendStatus }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/70 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Activity size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Resumelyze
          </span>
          <span className="hidden sm:inline text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">
            v2.0
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              backendStatus === "online"
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : backendStatus === "offline"
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
            }`}
          >
            {backendStatus === "online" ? (
              <Wifi size={12} />
            ) : backendStatus === "offline" ? (
              <WifiOff size={12} />
            ) : (
              <div className="w-3 h-3 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
            )}
            {backendStatus === "online"
              ? "API Connected"
              : backendStatus === "offline"
              ? "API Offline"
              : "Connecting..."}
          </div>
        </motion.div>
      </div>
    </header>
  );
}
