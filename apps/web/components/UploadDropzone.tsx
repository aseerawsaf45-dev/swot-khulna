"use client";

import React, { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";

export function UploadDropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const uploadFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setStatus("error");
      setMessage("Only CSV files are supported");
      return;
    }

    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/v1/data/upload/csv", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }
      
      setStatus("success");
      setMessage(data.message || "File uploaded successfully");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "An error occurred");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging ? "border-primary bg-primary/5" : "border-border bg-white/5 hover:bg-white/10"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground mb-2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-sm font-medium">
          {status === "uploading" ? "Uploading..." : "Drop CSV file here"}
        </span>
        <span className="text-xs text-muted-foreground mt-1">
          {status === "uploading" ? "Please wait" : "or click to browse"}
        </span>
        <input 
          type="file" 
          accept=".csv" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleChange} 
        />
      </div>

      {status === "success" && (
        <div className="p-3 text-sm rounded-md bg-success/10 text-success border border-success/20">
          {message}
        </div>
      )}
      {status === "error" && (
        <div className="p-3 text-sm rounded-md bg-destructive/10 text-destructive border border-destructive/20">
          {message}
        </div>
      )}
    </div>
  );
}
