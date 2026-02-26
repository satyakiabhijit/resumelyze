"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Save,
  UserCheck,
  FileDown,
  History,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

const BENEFITS = [
  {
    icon: Save,
    color: "text-brand-400",
    bg: "bg-brand-500/10",
    title: "Auto-fill your profile",
    desc: "We extract your skills, experience & education automatically.",
  },
  {
    icon: History,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    title: "Save analysis history",
    desc: "Access all your past analyses and scores anytime.",
  },
  {
    icon: FileDown,
    color: "text-green-400",
    bg: "bg-green-500/10",
    title: "Generate custom CVs",
    desc: "Build and download beautiful CVs from 4 templates.",
  },
  {
    icon: UserCheck,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    title: "Smarter cover letters",
    desc: "Cover letters pre-filled with your real experience.",
  },
];

export default function SignInModal({ open, onClose }: SignInModalProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-brand-50 via-purple-50 to-transparent px-6 pt-6 pb-5">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-900 transition rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Analysis Complete!</h2>
                    <p className="text-sm text-brand-600">Sign in to unlock the full experience</p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="px-6 py-4 grid grid-cols-2 gap-3">
                {BENEFITS.map(({ icon: Icon, color, bg, title, desc }) => (
                  <div key={title} className={`${bg} rounded-xl p-3 border border-gray-200`}>
                    <Icon size={18} className={`${color} mb-1.5`} />
                    <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex flex-col gap-2">
                <button
                  onClick={() => router.push("/login?mode=signup")}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all"
                >
                  <UserPlus size={16} />
                  Create Free Account
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-xl transition"
                >
                  <LogIn size={15} />
                  Already have an account? Sign In
                </button>
                <button
                  onClick={onClose}
                  className="text-xs text-gray-500 hover:text-gray-400 text-center mt-1 transition"
                >
                  Continue without account
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
