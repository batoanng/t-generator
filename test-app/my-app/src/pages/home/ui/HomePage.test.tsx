import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders the generated base content', () => {
    render(<HomePage />);

    expect(
      screen.getByRole('heading', { name: 'my-app' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Feature-Sliced Design foundation/i),
    ).toBeInTheDocument();
  });
});
