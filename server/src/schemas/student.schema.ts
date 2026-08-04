import { z } from 'zod';
import { objectId } from './common.schema';

export const updateStudentSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  branch: objectId.optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
