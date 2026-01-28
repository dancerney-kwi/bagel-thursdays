'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Countdown from '@/app/components/Countdown';
import BagelSelector from '@/app/components/BagelSelector';
import BagelFacts from '@/app/components/BagelFacts';
import TallyBoard from '@/app/components/TallyBoard';
import SpreadRequests from '@/app/components/SpreadRequests';
import {
  getBrowserId,
  hasSubmittedThisWeek,
  markAsSubmitted,
  getStoredSubmission,
  getStoredUserName,
  setStoredUserName,
  normalizeUserName,
} from '@/lib/utils/storage';
import { getCurrentWeekId, isBeforeCutoff } from '@/lib/utils/dates';
import { getCurrentTime } from '@/lib/utils/debug';
import { getBagelName } from '@/lib/constants/bagels';
import { UI } from '@/lib/constants/config';
import type { BagelTypeId } from '@/lib/types';

export default function Home() {
  const [userName, setUserName] = useState('');
  const [selectedBagel, setSelectedBagel] = useState<BagelTypeId | null>(null);
  const [customBagel, setCustomBagel] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isOrderingOpen, setIsOrderingOpen] = useState(true);

  // Check for existing submission and load stored data on mount
  useEffect(() => {
    setIsClient(true);

    // Load stored user name
    const storedName = getStoredUserName();
    if (storedName) {
      setUserName(storedName);
    }

    // Check for existing submission
    const weekId = getCurrentWeekId();
    if (hasSubmittedThisWeek(weekId)) {
      setHasSubmitted(true);
      const stored = getStoredSubmission(weekId);
      if (stored) {
        setSelectedBagel(stored.bagelType);
        if (stored.customBagel) {
          setCustomBagel(stored.customBagel);
        }
      }
    }

    // Check if ordering is open
    setIsOrderingOpen(isBeforeCutoff(getCurrentTime()));

    // Re-check every minute in case cutoff passes while page is open
    const intervalId = setInterval(() => {
      setIsOrderingOpen(isBeforeCutoff(getCurrentTime()));
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, UI.USER_NAME_MAX_LENGTH);
    setUserName(value);
  };

  const handleSubmit = async () => {
    if (!selectedBagel || !userName.trim() || isSubmitting) return;

    // Validate custom bagel if "other" selected
    if (selectedBagel === 'other' && !customBagel.trim()) {
      setSubmitError('Please enter your bagel preference');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const browserId = getBrowserId();
      const normalizedName = normalizeUserName(userName);

      const response = await fetch('/api/bagels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          browser_id: browserId,
          user_name: normalizedName,
          bagel_type: selectedBagel,
          custom_bagel: selectedBagel === 'other' ? customBagel : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit order');
      }

      // Save user name and mark as submitted in local storage
      setStoredUserName(normalizedName);
      setUserName(normalizedName);
      const weekId = getCurrentWeekId();
      markAsSubmitted(weekId, selectedBagel, selectedBagel === 'other' ? customBagel : undefined);
      setHasSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get display name for submitted bagel
  const getSubmittedBagelDisplay = () => {
    if (!selectedBagel) return '';
    if (selectedBagel === 'other') return customBagel;
    return getBagelName(selectedBagel);
  };

  // Check if form is valid for submission
  const canSubmit = userName.trim().length > 0 && selectedBagel && !hasSubmitted && !isSubmitting && isOrderingOpen;
  const isFormDisabled = hasSubmitted || !isOrderingOpen;

  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <header className="mb-10 text-center">
        <div className="mb-4">
          <Image
            src="/images/kwi-logo.png"
            alt="KWI"
            width={320}
            height={100}
            priority
            className="mx-auto"
          />
        </div>
        <h1 className="mb-2 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Bagel <span className="text-primary">Thursdays</span>
        </h1>
        <p className="text-lg font-medium text-foreground">
          Submit your weekly bagel preference
        </p>
      </header>

      <main className="flex w-full max-w-4xl flex-col gap-8">
        {/* Countdown Timer */}
        <Countdown />

        {/* Bagel Facts Carousel */}
        <BagelFacts />

        {/* Order Form */}
        <section className="rounded-2xl border border-gray-light/20 bg-white p-6 shadow-lg shadow-black/5 sm:p-8">
          {/* Name Input */}
          <div className="mb-6">
            <label
              htmlFor="user-name"
              className="mb-3 block text-xl font-black tracking-tight text-foreground sm:text-2xl"
            >
              Your <span className="text-primary">Name</span>
            </label>
            <input
              type="text"
              id="user-name"
              value={userName}
              onChange={handleNameChange}
              disabled={isFormDisabled}
              placeholder="First Name Last Initial (e.g., John D)"
              maxLength={UI.USER_NAME_MAX_LENGTH}
              className={`
                w-full rounded-xl border-2 border-gray-light/30 bg-gray-light/5 px-4 py-3.5 text-lg font-medium text-foreground
                placeholder:text-gray-light/70
                focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10
                disabled:cursor-not-allowed disabled:opacity-50
              `}
            />
            <p className="mt-2 text-xs text-gray">
              Please use the same name spelling each week for order history tracking. Your name will not be displayed publicly.
            </p>
          </div>

          {/* Bagel Selector */}
          <div className="border-t border-gray-light/20 pt-6">
            <h2 className="mb-4 text-xl font-black tracking-tight text-foreground sm:text-2xl">
              Select Your <span className="text-primary">Bagel</span>
            </h2>
            <BagelSelector
              selectedBagel={selectedBagel}
              customBagel={customBagel}
              onBagelSelect={setSelectedBagel}
              onCustomBagelChange={setCustomBagel}
              disabled={isFormDisabled}
            />
          </div>

          {/* Error message */}
          {submitError && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              {submitError}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`
                flex w-full items-center justify-center gap-2.5 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-wider transition-all
                ${canSubmit
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  : 'cursor-not-allowed bg-gray-light/30 text-gray'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : hasSubmitted ? (
                'Order Submitted!'
              ) : !isOrderingOpen ? (
                'Orders Closed'
              ) : (
                <>
                  Submit Order
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Submission confirmation */}
          {hasSubmitted && selectedBagel && (
            <div className="mt-4 rounded-xl bg-primary/10 p-4 text-center">
              <p className="font-medium text-primary">
                {userName}'s order: {getSubmittedBagelDisplay()}
              </p>
              <p className="mt-1 text-sm text-gray">
                Thank you! Your bagel preference has been recorded.
              </p>
            </div>
          )}

          {/* Orders closed message */}
          {!isOrderingOpen && !hasSubmitted && (
            <div className="mt-4 rounded-xl bg-gray-light/10 p-4 text-center">
              <p className="font-medium text-foreground">
                Orders for this week are closed
              </p>
              <p className="mt-1 text-sm text-gray">
                New orders open Friday at midnight EST
              </p>
            </div>
          )}
        </section>

        {/* Tally Board */}
        <section className="rounded-2xl border border-gray-light/20 bg-white p-6 shadow-lg shadow-black/5 sm:p-8">
          <h2 className="mb-4 text-xl font-black tracking-tight text-foreground sm:text-2xl">
            Current <span className="text-primary">Tally</span>
          </h2>
          {isClient && <TallyBoard />}
        </section>

        {/* Spread Requests */}
        <section className="rounded-2xl border border-gray-light/20 bg-white p-6 shadow-lg shadow-black/5 sm:p-8">
          <h2 className="mb-4 text-xl font-black tracking-tight text-foreground sm:text-2xl">
            Spread <span className="text-primary">Requests</span>
          </h2>
          {isClient && <SpreadRequests />}
        </section>
      </main>

    </div>
  );
}
