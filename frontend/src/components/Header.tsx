"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu, X, LogOut, User, LayoutDashboard, ChevronDown,
  BrainCircuit, Mail, Search, ClipboardList, FileDown, BookOpen,
  Shield, Sparkles, MessageSquare, FileText, Layers,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const toolsMenu = [
  { href: "/analyzer", icon: BrainCircuit, label: "Resume Analyzer", desc: "ATS scores & AI feedback" },
  { href: "/resume-checker", icon: Shield, label: "Resume Checker", desc: "Quick ATS compatibility check" },
  { href: "/summary-generator", icon: Sparkles, label: "Summary Generator", desc: "AI resume summaries" },
  { href: "/cover-letter", icon: Mail, label: "Cover Letter Generator", desc: "Job-tailored cover letters" },
  { href: "/skills", icon: Search, label: "Skills Finder", desc: "Discover in-demand skills" },
  { href: "/tracker", icon: ClipboardList, label: "Job Tracker", desc: "Manage your pipeline" },
  { href: "/resume-templates", icon: FileDown, label: "CV Builder", desc: "Build & download resumes" },
  { href: "/interview-questions", icon: MessageSquare, label: "Interview Questions", desc: "Role-specific Q&A prep" },
];

const resourcesMenu = [
  { href: "/guide", icon: BookOpen, label: "Resume Writing Guide", desc: "Expert tips & best practices" },
  { href: "/resume-examples", icon: FileText, label: "Resume Examples", desc: "Examples by job title" },
  { href: "/resume-templates", icon: Layers, label: "Resume Templates", desc: "6 ATS-friendly templates" },
];

function NavDropdown({ label, items, pathname }: {
  label: string;
  items: { href: string; icon: LucideIcon; label: string; desc: string }[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = items.some(i => pathname === i.href);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive ? "text-brand-600 bg-brand-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        {label}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50"
            style={{ minWidth: "260px" }}
          >
            <div className="p-2">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition group ${
                      active ? "bg-brand-50 text-brand-600" : "text-gray-700 hover:bg-gray-50"
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active ? "bg-brand-100" : "bg-gray-100 group-hover:bg-gray-200"
                    }`}>
                      <Icon size={14} className={active ? "text-brand-600" : "text-gray-500"} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none mb-0.5">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt="Resumelyzer" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-extrabold text-gray-900 hidden sm:inline">Resumelyzer</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          <NavDropdown label="Tools" items={toolsMenu} pathname={pathname} />
          <NavDropdown label="Resources" items={resourcesMenu} pathname={pathname} />
          <Link href="/resume-examples"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/resume-examples" ? "text-brand-600 bg-brand-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
            Examples
          </Link>
          <Link href="/resume-templates"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === "/resume-templates" ? "text-brand-600 bg-brand-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
            Templates
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {/* Dark mode toggle (temporarily hidden)
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          */}
          {!loading && (
            <>
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm text-gray-700">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <span className="max-w-[100px] truncate">{profile?.full_name || user.email}</span>
                    <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900 truncate">{profile?.full_name || "User"}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                        </div>
                        <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                          <LayoutDashboard size={14} className="text-gray-400" /> Dashboard
                        </Link>
                        <Link href="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                          <User size={14} className="text-gray-400" /> Profile
                        </Link>
                        <div className="border-t border-gray-100">
                          <button onClick={() => { setDropdownOpen(false); signOut(); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
                    Sign In
                  </Link>
                  <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition shadow-sm">
                    Get Started
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Mobile dark mode toggle (temporarily hidden)
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          */}
          {!loading && !user && (
            <Link href="/login" className="px-3 py-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition">
              Get Started
            </Link>
          )}
          {!loading && user && (
            <Link href="/dashboard" className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </Link>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-100 bg-white overflow-hidden">
            <nav className="px-4 py-3 space-y-0.5">

              {/* Tools section */}
              <button onClick={() => setMobileSection(mobileSection === "tools" ? null : "tools")}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Tools <ChevronDown size={14} className={`text-gray-400 transition-transform ${mobileSection === "tools" ? "rotate-180" : ""}`} />
              </button>
              {mobileSection === "tools" && (
                <div className="pl-4 space-y-0.5">
                  {toolsMenu.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm transition ${pathname === item.href ? "text-brand-600 bg-brand-50" : "text-gray-600 hover:bg-gray-50"}`}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Resources section */}
              <button onClick={() => setMobileSection(mobileSection === "resources" ? null : "resources")}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Resources <ChevronDown size={14} className={`text-gray-400 transition-transform ${mobileSection === "resources" ? "rotate-180" : ""}`} />
              </button>
              {mobileSection === "resources" && (
                <div className="pl-4 space-y-0.5">
                  {resourcesMenu.map((item) => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm transition ${pathname === item.href ? "text-brand-600 bg-brand-50" : "text-gray-600 hover:bg-gray-50"}`}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}

              <Link href="/resume-examples" onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${pathname === "/resume-examples" ? "text-brand-600 bg-brand-50" : "text-gray-700 hover:bg-gray-50"}`}>
                Examples
              </Link>
              <Link href="/resume-templates" onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${pathname === "/resume-templates" ? "text-brand-600 bg-brand-50" : "text-gray-700 hover:bg-gray-50"}`}>
                Templates
              </Link>

              {user ? (
                <>  
                  <div className="border-t border-gray-100 pt-2 mt-2" />
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                    <LayoutDashboard size={15} className="text-gray-400" /> Dashboard
                  </Link>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                    <User size={15} className="text-gray-400" /> Profile
                  </Link>
                  <button onClick={() => { setMobileOpen(false); signOut(); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition">
                    <LogOut size={15} /> Sign Out
                  </button>
                </>
              ) : (
                <div className="border-t border-gray-100 pt-2 mt-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50 transition">
                    Sign In
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


