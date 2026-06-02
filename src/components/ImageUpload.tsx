import React, { ReactNode, useState, useRef, MouseEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'motion/react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
  children?: ReactNode;
  className?: string;
}

export function ImageUpload({ onImageSelect, isLoading, children, className = '' }: ImageUploadProps) {
  const [isHovered, setIsHovered] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    disabled: isLoading,
    noClick: false,
    maxFiles: 1
  } as any);

  return (
    <div
      {...getRootProps({
        onMouseMove: (e: any) => {
          if (!spotlightRef.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          spotlightRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, var(--spotlight-color), transparent 50%)`;
        },
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false)
      })}
      className={`relative h-full w-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group overflow-hidden ${
        isDragActive ? 'bg-[var(--surface-raised)] border-2 border-[var(--accent-primary)] border-dashed' : ''
      } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(255,255,255,0.03)] dark:hover:shadow-[0_0_40px_rgba(255,255,255,0.08)]'} ${className}`}
    >
      <input {...getInputProps()} />
      
      {/* Spotlight Effect */}
      <div 
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered && !isDragActive ? 1 : 0,
        }}
      />
      
      {!children && (
        <div className="absolute inset-0 pointer-events-none mix-blend-screen overflow-hidden z-0">
          <motion.div 
            animate={{ 
              y: [0, -40, 0],
              x: [0, 30, 0],
              scale: [1, 1.3, 1],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-48 h-48 bg-white dark:bg-white rounded-full blur-[70px]"
          />
          <motion.div 
            animate={{ 
              y: [0, 50, 0],
              x: [0, -40, 0],
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-white dark:bg-[#e0e0e0] rounded-full blur-[80px]"
          />
        </div>
      )}

      {typeof children === 'function' ? children({ open }) : children ? <div className="z-10 w-full h-full">{children}</div> : (
        <div className="relative z-10 bg-[var(--surface-card)] bg-opacity-70 backdrop-blur-md border border-[var(--border-subtle)] text-body text-[var(--text-primary)] text-center px-8 py-4 font-medium rounded-2xl shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-[var(--surface-raised)] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] cursor-pointer group-hover:border-[var(--border-hover)]">
           {isDragActive ? 'Drop image to analyze' : 'Drop food image'}
        </div>
      )}
      {isDragActive && (!!children || typeof children === 'function') && (
        <div className="absolute inset-0 z-50 bg-[var(--surface-bg)] bg-opacity-90 flex items-center justify-center rounded-inherit">
            <span className="text-subheading text-[var(--accent-primary)] font-medium">Drop to replace and analyze</span>
        </div>
      )}
    </div>
  );
}
