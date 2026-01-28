'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { BAGEL_TYPES, getBagelById } from '@/lib/constants/bagels';
import { getCurrentWeekId } from '@/lib/utils/dates';
import { UI } from '@/lib/constants/config';

interface BagelTally {
  bagel_type: string;
  count: number;
}

interface TallyBoardProps {
  /** Callback when tallies are updated */
  onTalliesUpdate?: (total: number) => void;
}

export default function TallyBoard({ onTalliesUpdate }: TallyBoardProps) {
  const [tallies, setTallies] = useState<BagelTally[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTallies = useCallback(async () => {
    try {
      const response = await fetch(`/api/bagels?week_id=${getCurrentWeekId()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tallies');
      }
      const data = await response.json();
      setTallies(data.tallies || []);
      setError(null);

      // Notify parent of total count
      const total = (data.tallies || []).reduce(
        (sum: number, t: BagelTally) => sum + t.count,
        0
      );
      onTalliesUpdate?.(total);
    } catch (err) {
      console.error('Error fetching tallies:', err);
      setError('Failed to load tallies');
    } finally {
      setIsLoading(false);
    }
  }, [onTalliesUpdate]);

  // Initial fetch
  useEffect(() => {
    fetchTallies();
  }, [fetchTallies]);

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createClient();
    const weekId = getCurrentWeekId();

    const channel = supabase
      .channel('bagel_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bagel_submissions',
          filter: `week_id=eq.${weekId}`,
        },
        () => {
          // Refetch tallies when any change occurs
          fetchTallies();
        }
      )
      .subscribe();

    // Also poll periodically as a backup
    const pollInterval = setInterval(fetchTallies, UI.POLLING_INTERVAL);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [fetchTallies]);

  // Calculate total for display
  const totalOrders = tallies.reduce((sum, t) => sum + t.count, 0);

  // Get max count for progress bar scaling
  const maxCount = Math.max(...tallies.map((t) => t.count), 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
        {error}
        <button
          onClick={fetchTallies}
          className="ml-2 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (tallies.length === 0) {
    return (
      <div className="py-8 text-center text-gray">
        No orders yet this week. Be the first!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total counter */}
      <div className="mb-6 text-center">
        <span className="text-4xl font-extrabold text-primary">{totalOrders}</span>
        <span className="ml-2 text-gray">
          {totalOrders === 1 ? 'order' : 'orders'} this week
        </span>
      </div>

      {/* Tally bars */}
      <div className="space-y-3">
        {tallies.map((tally) => {
          const bagel = getBagelById(tally.bagel_type as any);
          const percentage = (tally.count / maxCount) * 100;

          return (
            <div key={tally.bagel_type} className="flex items-center gap-3">
              {/* Bagel image */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                {bagel ? (
                  <Image
                    src={`/images/bagels/${bagel.imageFile}`}
                    alt={bagel.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-2xl">🥯</span>
                )}
              </div>

              {/* Name and bar */}
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {bagel?.name || tally.bagel_type}
                  </span>
                  <span className="font-semibold text-primary">{tally.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-light/20">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
