import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple test component
function TestComponent({ message }: { message: string }) {
  return <div data-testid="test-component">{message}</div>;
}

describe('Sample component tests', () => {
  it('should render a component with text', () => {
    render(<TestComponent message="Hello Bagel Thursdays" />);

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByText('Hello Bagel Thursdays')).toBeInTheDocument();
  });

  it('should render with different props', () => {
    render(<TestComponent message="Order your bagel!" />);

    expect(screen.getByText('Order your bagel!')).toBeInTheDocument();
  });
});
