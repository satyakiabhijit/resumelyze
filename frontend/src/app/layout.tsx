import type { Metadata } from "next";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resumelyzer — AI-Powered Resume Intelligence Platform",
  description:
    "Analyze your resume against job descriptions with AI + NLP. Get ATS scores, keyword analysis, section feedback, cover letter generation, skills finder, job tracking, and actionable improvement suggestions.",
  keywords: [
    "resume analyzer",
    "ATS checker",
    "resume score",
    "job match",
    "AI resume",
    "cover letter generator",
    "skills finder",
    "job tracker",
    "resume checker",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-brand-950 text-white antialiased">
        <Toaster position="top-right" richColors />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
