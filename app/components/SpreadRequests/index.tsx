'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getBrowserId } from '@/lib/utils/storage';
import { getCurrentWeekId } from '@/lib/utils/dates';
import { UI } from '@/lib/constants/config';

interface SpreadRequest {
  id: string;
  spread_name: string;
  upvote_count: number;
  user_has_upvoted: boolean;
}

export default function SpreadRequests() {
  const [spreads, setSpreads] = useState<SpreadRequest[]>([]);
  const [newSpread, setNewSpread] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browserId, setBrowserId] = useState<string>('');

  const fetchSpreads = useCallback(async () => {
    if (!browserId) return;

    try {
      const weekId = getCurrentWeekId();
      const response = await fetch(
        `/api/spreads?week_id=${weekId}&browser_id=${browserId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch spreads');
      }

      const data = await response.json();
      setSpreads(data.spreads || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching spreads:', err);
      setError('Failed to load spread requests');
    } finally {
      setIsLoading(false);
    }
  }, [browserId]);

  // Get browser ID on mount
  useEffect(() => {
    setBrowserId(getBrowserId());
  }, []);

  // Initial fetch when browser ID is available
  useEffect(() => {
    if (browserId) {
      fetchSpreads();
    }
  }, [browserId, fetchSpreads]);

  // Set up real-time subscription
  useEffect(() => {
    if (!browserId) return;

    const supabase = createClient();
    const weekId = getCurrentWeekId();

    const channel = supabase
      .channel('spread_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'spread_requests',
          filter: `week_id=eq.${weekId}`,
        },
        () => fetchSpreads()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'spread_upvotes',
        },
        () => fetchSpreads()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [browserId, fetchSpreads]);

  const handleSubmitSpread = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSpread.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/spreads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          browser_id: browserId,
          spread_name: newSpread.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit spread request');
      }

      setNewSpread('');
      fetchSpreads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (spreadId: string) => {
    try {
      const response = await fetch(`/api/spreads/${spreadId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browser_id: browserId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle upvote');
      }

      // Optimistic update
      setSpreads((prev) =>
        prev.map((spread) =>
          spread.id === spreadId
            ? {
                ...spread,
                upvote_count: spread.user_has_upvoted
                  ? spread.upvote_count - 1
                  : spread.upvote_count + 1,
                user_has_upvoted: !spread.user_has_upvoted,
              }
            : spread
        ).sort((a, b) => b.upvote_count - a.upvote_count)
      );
    } catch (err) {
      console.error('Upvote error:', err);
      fetchSpreads(); // Refresh on error
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <p className="text-sm text-gray">
        Spread requests will be considered but are not guaranteed.
      </p>

      {/* New spread request form */}
      <form onSubmit={handleSubmitSpread} className="flex gap-3">
        <input
          type="text"
          value={newSpread}
          onChange={(e) => setNewSpread(e.target.value.slice(0, UI.SPREAD_NAME_MAX_LENGTH))}
          placeholder="Request a spread (e.g., Scallion cream cheese)"
          maxLength={UI.SPREAD_NAME_MAX_LENGTH}
          className="flex-1 rounded-xl border-2 border-gray-light/30 bg-gray-light/5 px-4 py-3 font-medium text-foreground placeholder:text-gray-light/70 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
        <button
          type="submit"
          disabled={!newSpread.trim() || isSubmitting}
          className={`rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
            newSpread.trim() && !isSubmitting
              ? 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25'
              : 'cursor-not-allowed bg-gray-light/30 text-gray'
          }`}
        >
          {isSubmitting ? '...' : 'Add'}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Spread requests list */}
      {spreads.length === 0 ? (
        <p className="py-6 text-center font-medium text-gray">
          No spread requests yet. Be the first to suggest one!
        </p>
      ) : (
        <ul className="space-y-2">
          {spreads.map((spread) => (
            <li
              key={spread.id}
              className="flex items-center justify-between rounded-xl border border-gray-light/20 bg-gray-light/5 px-4 py-3.5"
            >
              <span className="font-semibold text-foreground">
                {spread.spread_name}
              </span>
              <button
                onClick={() => handleUpvote(spread.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  spread.user_has_upvoted
                    ? 'bg-red/10 text-red'
                    : 'bg-gray-light/20 text-foreground hover:bg-gray-light/30'
                }`}
              >
                <svg
                  className={`h-4 w-4 ${spread.user_has_upvoted ? 'fill-red' : 'fill-none stroke-current'}`}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {spread.upvote_count}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
