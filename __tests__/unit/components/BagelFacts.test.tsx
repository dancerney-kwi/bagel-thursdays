import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import BagelFacts from '@/app/components/BagelFacts';
import { BAGEL_FACTS } from '@/lib/constants/facts';

describe('BagelFacts Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock document.hidden to be false by default
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render the first fact', () => {
    const testFacts = ['Fact one', 'Fact two', 'Fact three'];
    render(<BagelFacts facts={testFacts} />);

    expect(screen.getByText('Fact one')).toBeInTheDocument();
  });

  it('should render bagel emoji indicator', () => {
    render(<BagelFacts facts={['Test fact']} />);

    expect(screen.getByText('🥯')).toBeInTheDocument();
  });

  it('should rotate to next fact after interval', async () => {
    const testFacts = ['Fact one', 'Fact two', 'Fact three'];
    render(<BagelFacts facts={testFacts} rotationInterval={1000} />);

    expect(screen.getByText('Fact one')).toBeInTheDocument();

    // Advance past rotation interval
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Wait for fade transition
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Fact two')).toBeInTheDocument();
  });

  it('should cycle back to first fact after all facts shown', async () => {
    const testFacts = ['Fact one', 'Fact two'];
    render(<BagelFacts facts={testFacts} rotationInterval={1000} />);

    // First fact
    expect(screen.getByText('Fact one')).toBeInTheDocument();

    // Advance to second fact
    await act(async () => {
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('Fact two')).toBeInTheDocument();

    // Advance to cycle back to first
    await act(async () => {
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByText('Fact one')).toBeInTheDocument();
  });

  it('should not rotate with single fact', async () => {
    const testFacts = ['Only fact'];
    render(<BagelFacts facts={testFacts} rotationInterval={1000} />);

    expect(screen.getByText('Only fact')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Should still show same fact
    expect(screen.getByText('Only fact')).toBeInTheDocument();
  });

  it('should render nothing with empty facts array', () => {
    const { container } = render(<BagelFacts facts={[]} />);

    expect(container.firstChild).toBeNull();
  });

  // Note: Progress dots were removed from BagelFacts component per UI simplification
  // Facts now auto-rotate without manual navigation

  it('should have accessible region label', () => {
    render(<BagelFacts facts={['Test fact']} />);

    expect(screen.getByRole('region', { name: /bagel facts/i })).toBeInTheDocument();
  });

  it('should have aria-live for announcements', () => {
    render(<BagelFacts facts={['Test fact']} />);

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('should clean up interval on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const testFacts = ['Fact one', 'Fact two'];

    const { unmount } = render(<BagelFacts facts={testFacts} rotationInterval={1000} />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  describe('visibility handling', () => {
    it('should pause rotation when tab becomes hidden', async () => {
      const testFacts = ['Fact one', 'Fact two'];
      render(<BagelFacts facts={testFacts} rotationInterval={1000} />);

      expect(screen.getByText('Fact one')).toBeInTheDocument();

      // Simulate tab becoming hidden
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });
      fireEvent(document, new Event('visibilitychange'));

      // Advance time past rotation interval
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // Should still show first fact (rotation paused)
      expect(screen.getByText('Fact one')).toBeInTheDocument();
    });

    it('should resume rotation when tab becomes visible', async () => {
      const testFacts = ['Fact one', 'Fact two'];
      render(<BagelFacts facts={testFacts} rotationInterval={1000} />);

      // Hide tab
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => true,
      });
      fireEvent(document, new Event('visibilitychange'));

      // Show tab again
      Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => false,
      });
      fireEvent(document, new Event('visibilitychange'));

      // Advance time and check rotation resumes
      await act(async () => {
        vi.advanceTimersByTime(1000);
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText('Fact two')).toBeInTheDocument();
    });
  });

  it('should use default BAGEL_FACTS when no facts prop provided', () => {
    render(<BagelFacts />);

    // Should display one of the actual bagel facts
    expect(screen.getByText(BAGEL_FACTS[0])).toBeInTheDocument();
  });
});
