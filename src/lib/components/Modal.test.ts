import { page } from '$app/stores';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Modal from './Modal.svelte';

describe('Modal', () => {
  const defaultProps = {
    title: '',
    blogReason: '',
    tone: 'Professional',
    format: 'Tutorial',
    tags: [],
    category: 'Technology',
    additionalInstructions: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open is true', () => {
    const { container } = render(Modal, {
      props: { ...defaultProps, open: true },
      events: {},
    });

    expect(container.querySelector('.modal-overlay')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    const { container } = render(Modal, {
      props: { ...defaultProps, open: false },
      events: {},
    });

    expect(container.querySelector('.modal-overlay')).not.toBeInTheDocument();
  });

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup();
    const events = { close: vi.fn() };
    const { container } = render(Modal, {
      props: { ...defaultProps, open: true },
      events,
    });

    await user.click(screen.getByRole('button', { name: 'Close modal' }));

    await waitFor(() => {
      expect(events.close).toHaveBeenCalled();
    });
  });

  it('emits close event when close button is clicked', async () => {
    const user = userEvent.setup();
    const events = { close: vi.fn() };

    render(Modal, {
      props: { ...defaultProps, open: true },
      events,
    });

    await user.click(screen.getByRole('button', { name: 'Close modal' }));

    await waitFor(() => {
      expect(events.close).toHaveBeenCalled();
    });
  });

  it('emits generate event with correct data when Generate button is clicked', async () => {
    const user = userEvent.setup();
    const events = { generate: vi.fn() };

    const testData = {
      title: 'Test Blog Post',
      blogReason: 'Testing the modal',
      tone: 'Casual',
      format: 'Guide',
      tags: ['test', 'vitest'],
      category: 'Tutorial',
      additionalInstructions: 'Make it good',
    };

    render(Modal, {
      props: {
        ...defaultProps,
        ...testData,
        open: true,
      },
      events,
    });

    await user.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => {
      expect(events.generate).toHaveBeenCalled();
      const call = events.generate.mock.calls[0][0];
      expect(call.detail.title).toBe(testData.title);
      expect(call.detail.blogReason).toBe(testData.blogReason);
      expect(call.detail.tone).toBe(testData.tone);
      expect(call.detail.format).toBe(testData.format);
      expect(call.detail.tags).toEqual(testData.tags);
      expect(call.detail.category).toBe(testData.category);
      expect(call.detail.additionalInstructions).toBe(testData.additionalInstructions);
    });
  });

  it('disables Generate button when title is empty', () => {
    render(Modal, {
      props: { ...defaultProps, open: true, title: '' },
      events: {},
    });

    expect(screen.getByRole('button', { name: 'Generate' })).toBeDisabled();
  });

  it('enables Generate button when title has value', () => {
    render(Modal, {
      props: { ...defaultProps, open: true, title: 'Test' },
      events: {},
    });

    expect(screen.getByRole('button', { name: 'Generate' })).not.toBeDisabled();
  });

  it('updates title when user types', async () => {
    const user = userEvent.setup();
    render(Modal, {
      props: { ...defaultProps, open: true },
      events: {},
    });

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'My Blog Post');

    expect(titleInput).toHaveValue('My Blog Post');
  });

  it('parses tags from comma-separated input', async () => {
    const user = userEvent.setup();
    const events = { generate: vi.fn() };

    render(Modal, {
      props: { ...defaultProps, open: true },
      events,
    });

    const tagsInput = screen.getByPlaceholderText('javascript, web, tutorial');
    await user.type(tagsInput, 'js, react, svelte');
    await user.click(screen.getByRole('button', { name: 'Generate' }));

    await waitFor(() => {
      expect(events.generate).toHaveBeenCalled();
      const call = events.generate.mock.calls[0][0];
      expect(call.detail.tags).toEqual(['js', 'react', 'svelte']);
    });
  });
});
