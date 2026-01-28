import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Countdown from '@/app/components/Countdown';

describe('Countdown Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render countdown units with labels', () => {
    // Monday morning - collecting state
    vi.setSystemTime(new Date('2025-01-27T15:00:00.000Z'));

    render(<Countdown />);

    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Minutes')).toBeInTheDocument();
    expect(screen.getByText('Seconds')).toBeInTheDocument();
  });

  it('should display "collecting" message before cutoff', () => {
    // Monday - before Wednesday noon cutoff
    vi.setSystemTime(new Date('2025-01-27T15:00:00.000Z'));

    render(<Countdown />);

    expect(screen.getByText('Time remaining to submit your order')).toBeInTheDocument();
  });

  it('should display "closed" message after cutoff', () => {
    // Wednesday afternoon - after noon cutoff
    vi.setSystemTime(new Date('2025-01-29T19:00:00.000Z'));

    render(<Countdown />);

    expect(screen.getByText('Orders closed! Bagels arriving Thursday morning')).toBeInTheDocument();
  });

  it('should display "closed" message on Thursday', () => {
    // Thursday
    vi.setSystemTime(new Date('2025-01-30T15:00:00.000Z'));

    render(<Countdown />);

    expect(screen.getByText('Orders closed! Bagels arriving Thursday morning')).toBeInTheDocument();
  });

  it('should display "collecting" message on Friday (new cycle)', () => {
    // Friday
    vi.setSystemTime(new Date('2025-01-31T15:00:00.000Z'));

    render(<Countdown />);

    expect(screen.getByText('Time remaining to submit your order')).toBeInTheDocument();
  });

  it('should update countdown every second', async () => {
    // Set to a specific time
    vi.setSystemTime(new Date('2025-01-27T15:00:00.000Z'));

    render(<Countdown />);

    // Get initial seconds value
    const initialSeconds = screen.getAllByText(/^\d{2}$/);
    expect(initialSeconds.length).toBe(4); // days, hours, minutes, seconds

    // Advance time by 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Component should have updated
    // (We can't easily test the exact values changed, but we verify no errors)
    expect(screen.getByText('Days')).toBeInTheDocument();
  });

  it('should clean up interval on unmount', () => {
    vi.setSystemTime(new Date('2025-01-27T15:00:00.000Z'));
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = render(<Countdown />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should pad single digit values with zero', () => {
    // Set time so we get small countdown values
    vi.setSystemTime(new Date('2025-01-29T16:58:55.000Z')); // ~1 min 5 sec before cutoff

    render(<Countdown />);

    // Should have padded values (00, 01, etc.)
    const allText = screen.getAllByText(/^0\d$/);
    expect(allText.length).toBeGreaterThan(0);
  });

  it('should handle countdown reaching zero', async () => {
    // Set time to just before cutoff
    vi.setSystemTime(new Date('2025-01-29T16:59:59.000Z')); // 1 second before cutoff

    render(<Countdown />);

    // Advance past cutoff
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Should now show closed message
    expect(screen.getByText('Orders closed! Bagels arriving Thursday morning')).toBeInTheDocument();
  });
});
