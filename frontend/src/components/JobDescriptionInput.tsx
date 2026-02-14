"use client";

import { Briefcase } from "lucide-react";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobDescriptionInput({
  value,
  onChange,
}: JobDescriptionInputProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
        <Briefcase size={20} className="text-brand-400" />
        Job Description
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the complete job description here...

Include requirements, responsibilities, qualifications, and preferred skills for the best analysis."
        className="w-full h-72 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition"
      />
      <p className="text-gray-500 text-xs mt-2">
        {value.length > 0
          ? `${value.split(/\s+/).filter(Boolean).length} words`
          : "Paste the full job posting for the best results"}
      </p>
    </div>
  );
}
