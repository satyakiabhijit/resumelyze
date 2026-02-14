"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileCheck, X } from "lucide-react";

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function FileUpload({ file, onFileChange }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileChange(acceptedFiles[0]);
      }
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  if (file) {
    return (
      <div className="border-2 border-green-500/30 bg-green-500/5 rounded-xl p-6 text-center">
        <FileCheck size={48} className="mx-auto text-green-400 mb-3" />
        <p className="text-green-300 font-medium text-lg">{file.name}</p>
        <p className="text-gray-500 text-sm mt-1">
          {(file.size / 1024).toFixed(1)} KB • Ready for analysis
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFileChange(null);
          }}
          className="mt-3 flex items-center gap-1 mx-auto text-sm text-red-400 hover:text-red-300 transition"
        >
          <X size={14} />
          Remove file
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? "border-brand-500 bg-brand-500/10 scale-[1.02]"
          : "border-gray-700 hover:border-brand-500/50 hover:bg-gray-800/30"
      }`}
    >
      <input {...getInputProps()} />
      <Upload
        size={48}
        className={`mx-auto mb-4 ${
          isDragActive ? "text-brand-400" : "text-gray-500"
        }`}
      />
      <p className="text-gray-300 font-medium">
        {isDragActive
          ? "Drop your resume here..."
          : "Drag & drop your resume, or click to browse"}
      </p>
      <p className="text-gray-500 text-sm mt-2">
        Supports PDF, DOCX, TXT • Max 10MB
      </p>
    </div>
  );
}
