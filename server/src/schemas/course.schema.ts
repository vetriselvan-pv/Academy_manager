import { z } from 'zod';
import { CourseCategory } from '../types';

export const courseQuerySchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  isActive: z.string().optional(),
});

export const createCourseSchema = z.object({
  name: z.string().min(2),
  category: z.nativeEnum(CourseCategory),
  description: z.string().optional(),
  durationMonths: z.coerce.number().int().min(1).optional(),
  fee: z.coerce.number().min(0),
});
export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
