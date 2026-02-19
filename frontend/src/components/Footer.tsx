"use client";

import { Heart } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800/50 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Tools</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/analyzer" className="hover:text-brand-400 transition">Resume Analyzer</Link></li>
              <li><Link href="/cover-letter" className="hover:text-brand-400 transition">Cover Letter Generator</Link></li>
              <li><Link href="/skills" className="hover:text-brand-400 transition">AI Skills Finder</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/guide" className="hover:text-brand-400 transition">Resume Writing Guide</Link></li>
              <li><Link href="/tracker" className="hover:text-brand-400 transition">Job Tracker</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Resumelyzer</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI-powered resume intelligence platform. Analyze, optimize, and
              supercharge your job applications.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p className="flex items-center gap-1">
            Resumelyzer — Built with
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
