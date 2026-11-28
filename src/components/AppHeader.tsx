'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  Maximize2,
  MessageSquare,
  Globe,
  Sun,
  Bell,
  ChevronDown,
  Clock,
} from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between text-white border-b border-purple-700/40 shrink-0">
      {/* Left: Institute Emblem & Brand Title */}
      <div className="flex items-center gap-3">
        <Link href="/" className="p-1.5 hover:bg-white/10 rounded-lg transition" aria-label="Toggle menu" title="Toggle Sidebar">
          <Menu className="h-5 w-5" />
        </Link>

        <Link href="/" className="flex items-center gap-3 group" title="Click to go to Dashboard">
          {/* Logo Badge */}
          <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center p-1 shadow group-hover:scale-105 transition">
            <svg viewBox="0 0 100 100" className="h-8 w-8">
              <circle cx="50" cy="50" r="45" fill="#facc15" opacity="0.2" />
              <path
                d="M50 15L53 25L50 22L47 25Z M30 22L38 29L35 27L33 30Z M70 22L67 30L65 27L62 29Z M20 37L29 41L27 39L26 43Z M80 37L74 43L73 39L71 41Z"
                fill="#facc15"
              />
              <circle cx="50" cy="52" r="18" fill="#f59e0b" />
              <path
                d="M32 60C38 52 46 56 50 62C54 56 62 52 68 60C62 66 54 66 50 64C46 66 38 66 32 60Z"
                fill="#38bdf8"
              />
              <path
                d="M40 64C45 58 50 60 50 64C50 60 55 58 60 64C55 68 50 68 50 66C50 68 45 68 40 64Z"
                fill="#0284c7"
              />
            </svg>
          </div>

          <span className="font-bold tracking-wide text-sm md:text-base drop-shadow-sm uppercase group-hover:text-amber-200 transition">
            ELECTRO INSTITUTE OF NURSING AND PARAMEDICAL SCIENCES
          </span>
        </Link>
      </div>

      {/* Right Action Icons & User Control */}
      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-1.5 hover:bg-white/10 rounded-lg transition text-white/90">
          <Search className="h-4 w-4" />
        </button>

        {/* Academic Year Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/20 border border-white/25 rounded-md text-xs font-semibold tracking-wide cursor-pointer shadow-sm">
          <Clock className="h-3.5 w-3.5 text-white/90" />
          <span>2025-26</span>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => {
            if (typeof document !== 'undefined') {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }
          }}
          className="p-1.5 hover:bg-white/10 rounded-lg transition text-white/90"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Messages Icon with Badge */}
        <div className="relative cursor-pointer p-1.5 hover:bg-white/10 rounded-lg transition">
          <MessageSquare className="h-4 w-4 text-white/90" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold flex items-center justify-center text-white ring-1 ring-white">
            0
          </span>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-white/10 rounded cursor-pointer">
          <Globe className="h-3.5 w-3.5 text-white/90" />
          <span className="font-semibold">EN</span>
          <ChevronDown className="h-3 w-3 opacity-75" />
        </div>

        {/* Sun / Theme Icon */}
        <button className="p-1.5 hover:bg-white/10 rounded-lg transition text-amber-300">
          <Sun className="h-4 w-4 fill-amber-300" />
        </button>

        {/* Super Admin User Profile Pill */}
        <div className="flex items-center gap-2 bg-white/15 border border-white/20 hover:bg-white/25 px-2.5 py-1 rounded-full cursor-pointer transition">
          <div className="h-6 w-6 rounded-full bg-emerald-700 border border-white flex items-center justify-center text-[10px] font-bold">
            👨‍💼
          </div>
          <span className="text-xs font-semibold">Super Admin</span>
        </div>

        {/* Notification Bell */}
        <button className="p-1.5 hover:bg-white/10 rounded-lg transition text-white/90">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
