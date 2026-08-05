import { z } from 'zod';

export const courseCategoryQuerySchema = z.object({
  name: z.string().optional(),
  isActive: z.string().optional(),
});

export const createCourseCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});
export type CreateCourseCategoryInput = z.infer<typeof createCourseCategorySchema>;

export const updateCourseCategorySchema = createCourseCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateCourseCategoryInput = z.infer<typeof updateCourseCategorySchema>;
