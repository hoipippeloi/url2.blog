import { mount, unmount, flushSync } from 'svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Modal from './Modal.svelte';

describe('Modal', () => {
	let target: HTMLElement;

	beforeEach(() => {
		target = document.createElement('div');
		document.body.appendChild(target);
	});

	afterEach(() => {
		document.body.removeChild(target);
	});

	it('renders when open is true', () => {
		const component = mount(Modal, {
			target,
			props: { open: true },
		});
		flushSync();

		expect(target.querySelector('.modal-overlay')).toBeTruthy();
		expect(target.querySelector('[role="dialog"]')).toBeTruthy();

		unmount(component);
	});

	it('does not render when open is false', () => {
		const component = mount(Modal, {
			target,
			props: { open: false },
		});
		flushSync();

		expect(target.querySelector('.modal-overlay')).toBeNull();

		unmount(component);
	});

	it('closes when close button is clicked', async () => {
		const onClose = vi.fn();
		const component = mount(Modal, {
			target,
			props: {
				open: true,
				onclose: onClose,
			},
		});
		flushSync();

		const closeButton = target.querySelector('[aria-label="Close modal"]') as HTMLButtonElement;
		expect(closeButton).toBeTruthy();

		closeButton.click();
		flushSync();

		expect(onClose).toHaveBeenCalled();

		unmount(component);
	});

	it('emits generate event with correct data when Generate button is clicked', async () => {
		const onsubmit = vi.fn();
		const component = mount(Modal, {
			target,
			props: {
				open: true,
				onsubmit,
			},
		});
		flushSync();

		const titleInput = target.querySelector('#modal-title') as HTMLInputElement;
		titleInput.value = 'Test Blog Post';
		titleInput.dispatchEvent(new Event('input', { bubbles: true }));

		const blogReasonInput = target.querySelector('#modal-blogReason') as HTMLTextAreaElement;
		blogReasonInput.value = 'Testing the modal';
		blogReasonInput.dispatchEvent(new Event('input', { bubbles: true }));

		flushSync();

		const generateButton = target.querySelector('.btn-primary') as HTMLButtonElement;
		expect(generateButton).toBeTruthy();
		expect(generateButton.disabled).toBe(false);

		generateButton.click();
		flushSync();

		expect(onsubmit).toHaveBeenCalled();

		unmount(component);
	});

	it('disables Generate button when title is empty', () => {
		const component = mount(Modal, {
			target,
			props: { open: true },
		});
		flushSync();

		const generateButton = target.querySelector('.btn-primary') as HTMLButtonElement;
		expect(generateButton.disabled).toBe(true);

		unmount(component);
	});

	it('enables Generate button when title has value', async () => {
		const component = mount(Modal, {
			target,
			props: { open: true },
		});
		flushSync();

		const titleInput = target.querySelector('#modal-title') as HTMLInputElement;
		titleInput.value = 'Test Title';
		titleInput.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		const blogReasonInput = target.querySelector('#modal-blogReason') as HTMLTextAreaElement;
		blogReasonInput.value = 'Some reason';
		blogReasonInput.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		const generateButton = target.querySelector('.btn-primary') as HTMLButtonElement;
		expect(generateButton.disabled).toBe(false);

		unmount(component);
	});

	it('updates title when user types', async () => {
		const component = mount(Modal, {
			target,
			props: { open: true },
		});
		flushSync();

		const titleInput = target.querySelector('#modal-title') as HTMLInputElement;
		expect(titleInput).toBeTruthy();

		titleInput.value = 'My Blog Post';
		titleInput.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		expect(titleInput.value).toBe('My Blog Post');

		unmount(component);
	});

	it('parses tags from comma-separated input', async () => {
		const onsubmit = vi.fn();
		const component = mount(Modal, {
			target,
			props: { open: true, onsubmit },
		});
		flushSync();

		const titleInput = target.querySelector('#modal-title') as HTMLInputElement;
		titleInput.value = 'Test Title';
		titleInput.dispatchEvent(new Event('input', { bubbles: true }));

		const blogReasonInput = target.querySelector('#modal-blogReason') as HTMLTextAreaElement;
		blogReasonInput.value = 'Some reason';
		blogReasonInput.dispatchEvent(new Event('input', { bubbles: true }));

		const tagsInput = target.querySelector('#modal-tags') as HTMLInputElement;
		tagsInput.value = 'js, react, svelte';
		tagsInput.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		const generateButton = target.querySelector('.btn-primary') as HTMLButtonElement;
		generateButton.click();
		flushSync();

		expect(onsubmit).toHaveBeenCalled();

		unmount(component);
	});
});