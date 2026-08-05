import { z } from 'zod';
import { objectId } from './common.schema';

export const branchQuerySchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.string().optional(),
});

export const createBranchSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(2),
  city: z.string().min(2),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  manager: objectId.optional(),
});
export type CreateBranchInput = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = createBranchSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
