/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface KbachFrameProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'red' | 'gold' | 'parchment';
}

export function KbachFrame({
  children,
  title,
  subtitle,
  className = '',
  variant = 'gold'
}: KbachFrameProps) {
  const bgStyles = {
    red: 'bg-khmer-red-dark text-white border-khmer-gold',
    gold: 'bg-khmer-cream-light text-khmer-red-dark border-khmer-gold',
    parchment: 'bg-khmer-cream text-khmer-red-dark border-khmer-gold-dark'
  };

  return (
    <div 
      className={`relative p-5 md:p-8 rounded-lg kbach-border-gold kbach-corner-gold shadow-xl ${bgStyles[variant]} ${className}`}
      id={`kbach-frame-${title ? title.toLowerCase().replace(/\s+/g, '-') : 'container'}`}
    >
      {/* Decorative Traditional Khmer Corner Highlights */}
      <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none flex items-start justify-start">
        <svg className="w-8 h-8 text-khmer-gold" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L50 0 C40 20, 20 40, 0 50 Z" fill="currentColor" opacity="0.8" />
          <path d="M0 0 L100 0 L100 5 L5 5 L5 100 L0 100 Z" fill="currentColor" />
          <circle cx="20" cy="20" r="4" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none flex items-start justify-end">
        <svg className="w-8 h-8 text-khmer-gold rotate-90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L50 0 C40 20, 20 40, 0 50 Z" fill="currentColor" opacity="0.8" />
          <path d="M0 0 L100 0 L100 5 L5 5 L5 100 L0 100 Z" fill="currentColor" />
          <circle cx="20" cy="20" r="4" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none flex items-end justify-start">
        <svg className="w-8 h-8 text-khmer-gold -rotate-90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L50 0 C40 20, 20 40, 0 50 Z" fill="currentColor" opacity="0.8" />
          <path d="M0 0 L100 0 L100 5 L5 5 L5 100 L0 100 Z" fill="currentColor" />
          <circle cx="20" cy="20" r="4" fill="currentColor" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none flex items-end justify-end">
        <svg className="w-8 h-8 text-khmer-gold rotate-180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0 L50 0 C40 20, 20 40, 0 50 Z" fill="currentColor" opacity="0.8" />
          <path d="M0 0 L100 0 L100 5 L5 5 L5 100 L0 100 Z" fill="currentColor" />
          <circle cx="20" cy="20" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* Frame Header with Traditional Mandala or Ornament */}
      {(title || subtitle) && (
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2 mb-1">
            {/* Left Decorative Wing */}
            <span className="hidden md:inline text-khmer-gold text-xl">⚜️</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-wider text-khmer-gold px-4">
              {title}
            </h2>
            {/* Right Decorative Wing */}
            <span className="hidden md:inline text-khmer-gold text-xl">⚜️</span>
          </div>
          {subtitle && (
            <p className="text-xs md:text-sm text-khmer-gold-dark font-medium italic mt-1 tracking-wider">
              {subtitle}
            </p>
          )}
          {/* Symmetrical divider with gold knot */}
          <div className="flex items-center justify-center w-full gap-2 mt-3">
            <div className="h-[2px] bg-gradient-to-r from-transparent to-khmer-gold w-16 md:w-24"></div>
            <svg className="w-6 h-6 text-khmer-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L15 5L12 8L9 5L12 2Z" fill="currentColor" />
              <path d="M12 16L15 19L12 22L9 19L12 16Z" fill="currentColor" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" fill="currentColor" />
            </svg>
            <div className="h-[2px] bg-gradient-to-l from-transparent to-khmer-gold w-16 md:w-24"></div>
          </div>
        </div>
      )}

      {/* Frame Body Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Decorative horizontal divider
export function KbachDivider() {
  return (
    <div className="flex items-center justify-center my-6 gap-2">
      <div className="h-[2px] bg-gradient-to-r from-transparent via-khmer-gold to-transparent w-full"></div>
      <div className="text-khmer-gold flex items-center gap-1.5 shrink-0 px-2">
        <span>✦</span>
        <span className="text-lg">⚜️</span>
        <span>✦</span>
      </div>
      <div className="h-[2px] bg-gradient-to-r from-transparent via-khmer-gold to-transparent w-full"></div>
    </div>
  );
}
