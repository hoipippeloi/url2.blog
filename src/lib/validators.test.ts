import { describe, it, expect } from 'vitest';
import { urlSchema, blogGenerationSchema } from './validators';

describe('URL Schema Validation', () => {
	describe('urlSchema', () => {
		it('accepts valid URLs', () => {
			const result = urlSchema.safeParse({ url: 'https://example.com' });
			expect(result.success).toBe(true);
		});

		it('accepts URLs with paths', () => {
			const result = urlSchema.safeParse({ url: 'https://example.com/path/to/page' });
			expect(result.success).toBe(true);
		});

		it('accepts URLs with query params', () => {
			const result = urlSchema.safeParse({ url: 'https://example.com?query=value' });
			expect(result.success).toBe(true);
		});

		it('accepts URLs with fragments', () => {
			const result = urlSchema.safeParse({ url: 'https://example.com#section' });
			expect(result.success).toBe(true);
		});

		it('rejects invalid URL format', () => {
			const result = urlSchema.safeParse({ url: 'not-a-url' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.errors[0].message).toContain('valid URL');
			}
		});

		it('rejects empty string', () => {
			const result = urlSchema.safeParse({ url: '' });
			expect(result.success).toBe(false);
		});

		it('rejects URLs without protocol', () => {
			const result = urlSchema.safeParse({ url: 'example.com' });
			expect(result.success).toBe(false);
		});

		it('accepts http URLs', () => {
			const result = urlSchema.safeParse({ url: 'http://example.com' });
			expect(result.success).toBe(true);
		});

		it('accepts localhost URLs for development', () => {
			const result = urlSchema.safeParse({ url: 'http://localhost:3000/test' });
			expect(result.success).toBe(true);
		});
	});
});

describe('Blog Generation Schema Validation', () => {
	const validInput = {
		savedUrlId: 'url-123',
		title: 'My Blog Post',
		blogReason: 'Testing the feature',
		tone: 'Professional',
		format: 'Tutorial',
		tags: ['test', 'vitest'],
		category: 'Technology',
		additionalInstructions: 'Make it concise',
	};

	it('accepts valid input', () => {
		const result = blogGenerationSchema.safeParse(validInput);
		expect(result.success).toBe(true);
	});

	it('requires savedUrlId', () => {
		const result = blogGenerationSchema.safeParse({
			...validInput,
			savedUrlId: '',
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.errors[0].message).toContain('required');
		}
	});

	it('requires title', () => {
		const result = blogGenerationSchema.safeParse({
			...validInput,
			title: '',
		});
		expect(result.success).toBe(false);
	});

	it('requires blogReason', () => {
		const result = blogGenerationSchema.safeParse({
			...validInput,
			blogReason: '',
		});
		expect(result.success).toBe(false);
	});

	it('requires tone', () => {
		const result = blogGenerationSchema.safeParse({
			...validInput,
			tone: '',
		});
		expect(result.success).toBe(false);
	});

	it('requires format', () => {
		const result = blogGenerationSchema.safeParse({
			...validInput,
			format: '',
		});
		expect(result.success).toBe(false);
	});

	it('requires category', () => {
		const result = blogGenerationSchema.safeParse({
			...validInput,
			category: '',
		});
		expect(result.success).toBe(false);
	});

	it('accepts empty additionalInstructions', () => {
		const result = blogGenerationSchema.safeParse({
			...validInput,
			additionalInstructions: '',
		});
		expect(result.success).toBe(true);
	});

	it('accepts missing additionalInstructions', () => {
		const { additionalInstructions, ...rest } = validInput;
		const result = blogGenerationSchema.safeParse(rest);
		expect(result.success).toBe(true);
	});

	it('accepts empty tags array', () => {
		const result = blogGenerationSchema.safeParse({
			...validInput,
			tags: [],
		});
		expect(result.success).toBe(true);
	});
});