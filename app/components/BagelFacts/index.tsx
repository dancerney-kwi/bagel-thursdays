'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BAGEL_FACTS, getFactByIndex } from '@/lib/constants/facts';
import { UI } from '@/lib/constants/config';

interface BagelFactsProps {
  /** Custom rotation interval in milliseconds (default: 12000) */
  rotationInterval?: number;
  /** Custom facts array (for testing) */
  facts?: string[];
}

export default function BagelFacts({
  rotationInterval = UI.FACT_ROTATION_INTERVAL,
  facts = BAGEL_FACTS,
}: BagelFactsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current fact
  const currentFact = facts.length > 0 ? facts[currentIndex % facts.length] : '';

  // Rotate to next fact with fade transition
  const rotateToNext = useCallback(() => {
    if (facts.length <= 1) return;

    setIsFading(true);

    // After fade out, change fact
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % facts.length);
      setIsFading(false);
    }, 300); // 300ms fade duration
  }, [facts.length]);

  // Handle visibility change (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Set up rotation interval
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only rotate if visible and has multiple facts
    if (isVisible && facts.length > 1) {
      intervalRef.current = setInterval(rotateToNext, rotationInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, rotationInterval, rotateToNext, facts.length]);

  // Don't render if no facts
  if (facts.length === 0) {
    return null;
  }

  return (
    <div
      className="relative mx-auto max-w-2xl"
      role="region"
      aria-label="Bagel facts"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="rounded-2xl border border-gray-light/20 bg-white px-6 py-4 shadow-lg shadow-black/5">
        <div className="flex items-center gap-3">
          {/* Bagel emoji indicator */}
          <span
            className="flex-shrink-0 text-xl"
            role="img"
            aria-hidden="true"
          >
            🥯
          </span>

          {/* Fact text with fade transition */}
          <p
            className={`
              text-sm font-medium leading-relaxed text-foreground transition-opacity duration-300
              ${isFading ? 'opacity-0' : 'opacity-100'}
            `}
          >
            {currentFact}
          </p>
        </div>
      </div>

      {/* Decorative "speech bubble" tail */}
      <div
        className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b border-r border-gray-light/20 bg-white"
        aria-hidden="true"
      />
    </div>
  );
}
