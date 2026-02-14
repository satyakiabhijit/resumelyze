"use client";

import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p className="flex items-center gap-1">
            Resumelyze v2.0 — Built with
            <Heart size={14} className="text-red-500 fill-red-500" />
            by Satyaki Abhijit
          </p>
          <p>
            Powered by Google Gemini AI + Local NLP · © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
