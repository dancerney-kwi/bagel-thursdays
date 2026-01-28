import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BagelSelector from '@/app/components/BagelSelector';
import { BAGEL_TYPES } from '@/lib/constants/bagels';
import { UI } from '@/lib/constants/config';

describe('BagelSelector Component', () => {
  const defaultProps = {
    selectedBagel: null,
    customBagel: '',
    onBagelSelect: vi.fn(),
    onCustomBagelChange: vi.fn(),
    disabled: false,
  };

  it('should render all bagel types', () => {
    render(<BagelSelector {...defaultProps} />);

    BAGEL_TYPES.forEach((bagel) => {
      expect(screen.getByText(bagel.name)).toBeInTheDocument();
    });
  });

  it('should call onBagelSelect when a bagel is clicked', async () => {
    const onBagelSelect = vi.fn();
    render(<BagelSelector {...defaultProps} onBagelSelect={onBagelSelect} />);

    const plainButton = screen.getByRole('button', { name: /plain bagel/i });
    await userEvent.click(plainButton);

    expect(onBagelSelect).toHaveBeenCalledWith('plain');
  });

  it('should show selected state for selected bagel', () => {
    render(<BagelSelector {...defaultProps} selectedBagel="sesame" />);

    const sesameButton = screen.getByRole('button', { name: /select sesame bagel/i });
    expect(sesameButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should show unselected state for non-selected bagels', () => {
    render(<BagelSelector {...defaultProps} selectedBagel="plain" />);

    const sesameButton = screen.getByRole('button', { name: /select sesame bagel/i });
    expect(sesameButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should show custom input when "Other" is selected', () => {
    render(<BagelSelector {...defaultProps} selectedBagel="other" />);

    expect(screen.getByLabelText(/what kind of bagel/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your bagel preference/i)).toBeInTheDocument();
  });

  it('should not show custom input when "Other" is not selected', () => {
    render(<BagelSelector {...defaultProps} selectedBagel="plain" />);

    expect(screen.queryByLabelText(/what kind of bagel/i)).not.toBeInTheDocument();
  });

  it('should call onCustomBagelChange when custom input changes', async () => {
    const onCustomBagelChange = vi.fn();
    render(
      <BagelSelector
        {...defaultProps}
        selectedBagel="other"
        onCustomBagelChange={onCustomBagelChange}
      />
    );

    const input = screen.getByLabelText(/what kind of bagel/i);
    await userEvent.type(input, 'Jalapeño');

    expect(onCustomBagelChange).toHaveBeenCalled();
  });

  it('should display current custom bagel value', () => {
    render(
      <BagelSelector
        {...defaultProps}
        selectedBagel="other"
        customBagel="Jalapeño Cheddar"
      />
    );

    const input = screen.getByLabelText(/what kind of bagel/i) as HTMLInputElement;
    expect(input.value).toBe('Jalapeño Cheddar');
  });

  it('should show character count for custom input', () => {
    render(
      <BagelSelector
        {...defaultProps}
        selectedBagel="other"
        customBagel="Test"
      />
    );

    expect(screen.getByText(`4/${UI.CUSTOM_BAGEL_MAX_LENGTH} characters`)).toBeInTheDocument();
  });

  it('should truncate custom input at max length', async () => {
    const onCustomBagelChange = vi.fn();
    render(
      <BagelSelector
        {...defaultProps}
        selectedBagel="other"
        onCustomBagelChange={onCustomBagelChange}
      />
    );

    const input = screen.getByLabelText(/what kind of bagel/i);
    const longText = 'a'.repeat(UI.CUSTOM_BAGEL_MAX_LENGTH + 10);

    // Simulate typing by directly setting value and triggering change
    fireEvent.change(input, { target: { value: longText } });

    // The component should truncate to max length
    expect(onCustomBagelChange).toHaveBeenCalledWith('a'.repeat(UI.CUSTOM_BAGEL_MAX_LENGTH));
  });

  describe('disabled state', () => {
    it('should disable all bagel cards when disabled', () => {
      render(<BagelSelector {...defaultProps} disabled={true} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should disable custom input when disabled', () => {
      render(
        <BagelSelector
          {...defaultProps}
          selectedBagel="other"
          disabled={true}
        />
      );

      const input = screen.getByLabelText(/what kind of bagel/i);
      expect(input).toBeDisabled();
    });

    it('should not call onBagelSelect when disabled', async () => {
      const onBagelSelect = vi.fn();
      render(
        <BagelSelector
          {...defaultProps}
          onBagelSelect={onBagelSelect}
          disabled={true}
        />
      );

      const plainButton = screen.getByRole('button', { name: /plain bagel/i });
      await userEvent.click(plainButton);

      expect(onBagelSelect).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('should select bagel on Enter key', async () => {
      const onBagelSelect = vi.fn();
      render(<BagelSelector {...defaultProps} onBagelSelect={onBagelSelect} />);

      const plainButton = screen.getByRole('button', { name: /plain bagel/i });
      plainButton.focus();
      await userEvent.keyboard('{Enter}');

      expect(onBagelSelect).toHaveBeenCalledWith('plain');
    });

    it('should select bagel on Space key', async () => {
      const onBagelSelect = vi.fn();
      render(<BagelSelector {...defaultProps} onBagelSelect={onBagelSelect} />);

      const plainButton = screen.getByRole('button', { name: /plain bagel/i });
      plainButton.focus();
      await userEvent.keyboard(' ');

      expect(onBagelSelect).toHaveBeenCalledWith('plain');
    });

    it('should be focusable with tab', async () => {
      render(<BagelSelector {...defaultProps} />);

      await userEvent.tab();

      // First bagel should be focused
      const plainButton = screen.getByRole('button', { name: /plain bagel/i });
      expect(plainButton).toHaveFocus();
    });
  });

  describe('accessibility', () => {
    it('should have aria-labels for bagel buttons', () => {
      render(<BagelSelector {...defaultProps} />);

      const plainButton = screen.getByRole('button', { name: /select plain bagel/i });
      expect(plainButton).toBeInTheDocument();
    });

    it('should have accessible fieldset legend', () => {
      render(<BagelSelector {...defaultProps} />);

      // Legend is sr-only but still in DOM
      expect(screen.getByText('Select your bagel type')).toBeInTheDocument();
    });
  });
});
