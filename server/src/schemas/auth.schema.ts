import { z } from 'zod';
import { objectId } from './common.schema';
import { TeacherDesignation } from '../types';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  branch: objectId,
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
});
export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;

export const registerTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  designation: z.nativeEnum(TeacherDesignation),
  branches: z.array(objectId).min(1),
  specializedCourses: z.array(objectId).optional(),
});
export type RegisterTeacherInput = z.infer<typeof registerTeacherSchema>;

export const registerAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});
export type RegisterAdminInput = z.infer<typeof registerAdminSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
