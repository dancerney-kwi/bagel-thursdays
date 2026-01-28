'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentCycleState,
  getNextCutoffTime,
  getNextResetTime,
  getCountdownValues,
} from '@/lib/utils/dates';
import type { CycleState, CountdownValues } from '@/lib/types';

interface CountdownUnitProps {
  value: number;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-black tracking-tight text-primary sm:text-5xl md:text-6xl">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray sm:text-sm">{label}</span>
    </div>
  );
}

function Separator() {
  return (
    <span className="text-3xl font-black text-gray-light sm:text-4xl md:text-5xl">:</span>
  );
}

interface CountdownMessageProps {
  state: CycleState;
}

function CountdownMessage({ state }: CountdownMessageProps) {
  const messages: Record<CycleState, string> = {
    collecting: 'Time remaining to submit your order',
    closed: 'Orders closed! Bagels arriving Thursday morning',
    'reset-pending': 'New week starting Friday at midnight!',
  };

  return (
    <div className="mt-4 text-center">
      <p className="text-sm font-medium text-foreground sm:text-base">
        {messages[state]}
      </p>
      <p className="mt-1 text-xs text-gray">
        Orders close Wednesday at 12:00 PM EST
      </p>
    </div>
  );
}

export default function Countdown() {
  const [cycleState, setCycleState] = useState<CycleState>('collecting');
  const [countdown, setCountdown] = useState<CountdownValues>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const updateCountdown = useCallback(() => {
    const now = new Date();
    const state = getCurrentCycleState(now);
    setCycleState(state);

    // Determine target time based on state
    let targetTime: Date;
    if (state === 'collecting') {
      targetTime = getNextCutoffTime(now);
    } else {
      // When closed, count down to reset
      targetTime = getNextResetTime(now);
    }

    const values = getCountdownValues(targetTime, now);
    setCountdown(values);
  }, []);

  useEffect(() => {
    // Initial update
    updateCountdown();

    // Update every second
    const intervalId = setInterval(updateCountdown, 1000);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [updateCountdown]);

  return (
    <div className="rounded-2xl border border-gray-light/20 bg-white p-6 text-center shadow-lg shadow-black/5 sm:p-8">
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <CountdownUnit value={countdown.days} label="Days" />
        <Separator />
        <CountdownUnit value={countdown.hours} label="Hours" />
        <Separator />
        <CountdownUnit value={countdown.minutes} label="Minutes" />
        <Separator />
        <CountdownUnit value={countdown.seconds} label="Seconds" />
      </div>
      <CountdownMessage state={cycleState} />
    </div>
  );
}
