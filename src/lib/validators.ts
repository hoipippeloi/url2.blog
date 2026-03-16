import { z } from 'zod';

export const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL (e.g., https://example.com)'),
});

export const blogGenerationSchema = z.object({
  savedUrlId: z.string().min(1, 'Saved URL ID is required'),
  title: z.string().min(1, 'Title is required'),
  blogReason: z.string().min(1, 'Blog reason is required'),
  tone: z.string().min(1, 'Tone is required'),
  format: z.string().min(1, 'Format is required'),
  tags: z.array(z.string()),
  category: z.string().min(1, 'Category is required'),
  additionalInstructions: z.string().optional(),
});

export const blogPostSaveSchema = z.object({
  savedUrlId: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  frontmatter: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    category: z.string(),
    tone: z.string(),
    format: z.string(),
  }),
  tone: z.string(),
  format: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  blogReason: z.string(),
  additionalInstructions: z.string().optional(),
});
