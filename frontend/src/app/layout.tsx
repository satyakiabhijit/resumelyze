import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resumelyze — AI-Powered Resume Analyzer",
  description:
    "Analyze your resume against job descriptions with AI + NLP. Get ATS scores, keyword analysis, section feedback, and actionable improvement suggestions.",
  keywords: ["resume analyzer", "ATS checker", "resume score", "job match", "AI resume"],
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
        {children}
      </body>
    </html>
  );
}
