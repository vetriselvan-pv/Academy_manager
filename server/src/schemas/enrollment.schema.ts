import { z } from 'zod';
import { objectId } from './common.schema';
import { EnrollmentStatus } from '../types';

export const createEnrollmentSchema = z.object({
  student: objectId.optional(), // omitted when a student enrolls themselves
  course: objectId,
  branch: objectId,
  teacher: objectId.optional(),
  batchTiming: z.string().optional(),
  startDate: z.coerce.date().optional(),
});
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;

export const updateEnrollmentSchema = z.object({
  teacher: objectId.optional(),
  batchTiming: z.string().optional(),
  endDate: z.coerce.date().optional(),
  status: z.nativeEnum(EnrollmentStatus).optional(),
  feePaid: z.coerce.number().min(0).optional(),
});
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
