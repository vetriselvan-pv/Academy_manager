import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10),
  address: z.string().min(2),
  city: z.string().min(2),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});
export type CreateBranchInput = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = createBranchSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
