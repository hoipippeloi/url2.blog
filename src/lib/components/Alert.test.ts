import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Alert from './Alert.svelte';

describe('Alert component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders error alert with correct styles', () => {
    render(Alert, {
      props: {
        type: 'error',
        message: 'This is an error message',
      },
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('bg-red-50');
    expect(alert).toHaveClass('border-red-200');
    expect(alert).toHaveClass('text-red-700');
  });

  it('renders success alert with correct styles', () => {
    render(Alert, {
      props: {
        type: 'success',
        message: 'This is a success message',
      },
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('bg-green-50');
    expect(alert).toHaveClass('border-green-200');
    expect(alert).toHaveClass('text-green-700');
  });

  it('renders with custom title', () => {
    render(Alert, {
      props: {
        type: 'error',
        message: 'Error details',
        title: 'Error',
      },
    });

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Error details')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(Alert, {
      props: {
        type: 'error',
        message: 'Test message',
        dismissible: true,
        onDismiss,
      },
    });

    const dismissButton = screen.getByLabelText('Dismiss alert');
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalled();
  });

  it('does not render dismiss button when dismissible is false', () => {
    render(Alert, {
      props: {
        type: 'error',
        message: 'Test message',
        dismissible: false,
      },
    });

    expect(screen.queryByLabelText('Dismiss alert')).not.toBeInTheDocument();
  });

  it('renders children content when provided', () => {
    const children = vi.fn(() => null);
    render(Alert, {
      props: {
        type: 'success',
        message: 'Test message',
        children,
      },
    });

    expect(children).toHaveBeenCalled();
  });

  it('hides alert after dismiss', () => {
    render(Alert, {
      props: {
        type: 'error',
        message: 'Test message',
        dismissible: true,
      },
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();

    const dismissButton = screen.getByLabelText('Dismiss alert');
    fireEvent.click(dismissButton);

    expect(alert).not.toBeInTheDocument();
  });

  it('renders with fixed positioning when no children', () => {
    render(Alert, {
      props: {
        type: 'error',
        message: 'Test message',
      },
    });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('fixed');
    expect(alert).toHaveClass('top-20');
    expect(alert).toHaveClass('left-1/2');
    expect(alert).toHaveClass('-translate-x-1/2');
    expect(alert).toHaveClass('z-50');
  });
});
