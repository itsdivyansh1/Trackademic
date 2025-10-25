"use client"

import type React from "react"

export function TrackademicLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        className="h-7 w-7"
        aria-hidden
      >
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="48" height="48" rx="12" fill="url(#grad)" opacity="0.15" />
        <path
          d="M14 40c10-2 14-12 18-22 4 10 8 20 18 22"
          fill="none"
          stroke="url(#grad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="20" r="3" fill="url(#grad)" />
        <circle cx="20" cy="44" r="3" fill="url(#grad)" />
        <circle cx="44" cy="44" r="3" fill="url(#grad)" />
      </svg>
      <span className="text-lg font-semibold">Trackademic</span>
    </div>
  )
}

export default TrackademicLogo


