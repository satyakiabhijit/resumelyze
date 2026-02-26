import Image from "next/image";
import Link from "next/link";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="Resumelyzer" width={32} height={32} className="rounded-lg" />
              <span className="text-lg font-extrabold text-gray-900">Resumelyzer</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">
              AI-powered resume intelligence for the modern job seeker.
            </p>
            <div className="mt-4 flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ))}
              <span className="text-xs text-gray-500 ml-1">Excellent</span>
            </div>
          </div>

          {/* Resume */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Resume</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/analyzer" className="hover:text-brand-600 transition">Resume Analyzer</Link></li>
              <li><Link href="/resume-checker" className="hover:text-brand-600 transition">Resume Checker</Link></li>
              <li><Link href="/resume-templates" className="hover:text-brand-600 transition">CV Builder</Link></li>
              <li><Link href="/resume-examples" className="hover:text-brand-600 transition">Resume Examples</Link></li>
              <li><Link href="/resume-templates" className="hover:text-brand-600 transition">Resume Templates</Link></li>
            </ul>
          </div>

          {/* Cover Letter */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Cover Letter</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/cover-letter" className="hover:text-brand-600 transition">Cover Letter Generator</Link></li>
              <li><Link href="/cover-letter" className="hover:text-brand-600 transition">Cover Letter Templates</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/summary-generator" className="hover:text-brand-600 transition">Summary Generator</Link></li>
              <li><Link href="/interview-questions" className="hover:text-brand-600 transition">Interview Questions</Link></li>
              <li><Link href="/skills" className="hover:text-brand-600 transition">AI Skills Finder</Link></li>
              <li><Link href="/tracker" className="hover:text-brand-600 transition">Job Tracker</Link></li>
              <li><Link href="/guide" className="hover:text-brand-600 transition">Resume Guide</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/login" className="hover:text-brand-600 transition">Sign In</Link></li>
              <li><Link href="/login" className="hover:text-brand-600 transition">Create Account</Link></li>
              <li><Link href="/dashboard" className="hover:text-brand-600 transition">Dashboard</Link></li>
              <li><Link href="/profile" className="hover:text-brand-600 transition">Profile</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Stay Updated</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Resume tips, feature updates &amp; career advice — no spam.
            </p>
            <NewsletterSignup />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Resumelyzer. All rights reserved.</p>
          <p className="text-sm text-gray-400">Created by Satyaki Abhijit</p>
        </div>
      </div>
    </footer>
  );
}
