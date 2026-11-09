'use client';

import React from 'react';
import { LogoMark } from '@/components/landing/BrandLogos';

export interface LogoLoaderProps {
  variant?: 'fullscreen' | 'section' | 'mini';
  text?: string;
  subtext?: string;
  className?: string;
}

export function LogoLoader({
  variant = 'section',
  text,
  subtext,
  className = '',
}: LogoLoaderProps) {
  if (variant === 'mini') {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <span className="relative flex h-5 w-5 items-center justify-center">
          {/* Subtle spinning accent orbit */}
          <span className="absolute inset-0 rounded-lg border border-emerald-400/50 border-t-emerald-500 animate-spin" />
          <LogoMark className="h-4 w-4" animated={false} />
        </span>
        {text && <span className="text-xs font-semibold">{text}</span>}
      </span>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md px-4 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="relative flex flex-col items-center text-center max-w-sm">
          {/* Multi-layered Radar Pulse & Orbital Ring */}
          <div className="relative flex items-center justify-center mb-6">
            {/* Outer radar ripples */}
            <span className="absolute h-28 w-28 rounded-full bg-emerald-400/10 animate-radar-ripple" />
            <span
              className="absolute h-36 w-36 rounded-full bg-blue-500/5 animate-radar-ripple"
              style={{ animationDelay: '0.8s' }}
            />

            {/* Rotating dashed orbital tracker */}
            <div className="absolute h-24 w-24 rounded-full border border-dashed border-emerald-400/40 animate-spin" style={{ animationDuration: '6s' }} />

            {/* Glowing aura behind logo */}
            <div className="absolute h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 blur-xl" />

            {/* Central Animated LogoMark */}
            <div className="relative shadow-xl rounded-[16px] ring-4 ring-slate-100">
              <LogoMark className="h-14 w-14 rounded-[16px]" animated={true} />
            </div>
          </div>

          {/* Brand & Loading Label */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-display font-bold text-lg text-slate-900 tracking-tight">
              AEO Checker
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Scanner
            </span>
          </div>

          <h3 className="text-sm font-semibold text-slate-800 animate-pulse">
            {text || 'Analyzing AI Search Visibility...'}
          </h3>

          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {subtext || 'Auditing real-time answers across ChatGPT, Perplexity, Gemini & Claude'}
          </p>

          {/* Minimalist animated progress bar */}
          <div className="w-48 h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 rounded-full shimmer" />
          </div>
        </div>
      </div>
    );
  }

  // Default: 'section'
  return (
    <div
      className={`min-h-[260px] flex flex-col items-center justify-center p-6 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center mb-5">
        {/* Radar concentric pulse */}
        <span className="absolute h-20 w-20 rounded-full bg-emerald-400/15 animate-radar-ripple" />
        <span
          className="absolute h-24 w-24 rounded-full bg-blue-500/10 animate-radar-ripple"
          style={{ animationDelay: '0.6s' }}
        />

        {/* Orbit tracker */}
        <div className="absolute h-18 w-18 rounded-full border border-dashed border-emerald-400/30 animate-spin" style={{ animationDuration: '5s' }} />

        {/* Glowing backdrop */}
        <div className="absolute h-12 w-12 rounded-xl bg-emerald-500/20 blur-lg" />

        {/* LogoMark */}
        <div className="relative shadow-md rounded-[13px] ring-2 ring-slate-100">
          <LogoMark className="h-11 w-11 rounded-[13px]" animated={true} />
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-800">
        {text || 'Loading AEO Intelligence...'}
      </p>
      {subtext && (
        <p className="text-xs text-slate-500 mt-1 max-w-xs">{subtext}</p>
      )}

      {/* Progress line */}
      <div className="w-36 h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full shimmer" />
      </div>
    </div>
  );
}
