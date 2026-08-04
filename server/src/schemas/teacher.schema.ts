import { z } from 'zod';
import { objectId } from './common.schema';
import { Permission, TeacherDesignation } from '../types';

export const createTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  designation: z.nativeEnum(TeacherDesignation).default(TeacherDesignation.INSTRUCTOR),
  branches: z.array(objectId).min(1),
  specializedCourses: z.array(objectId).optional(),
  joiningDate: z.coerce.date().optional(),
});
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  designation: z.nativeEnum(TeacherDesignation).optional(),
  branches: z.array(objectId).min(1).optional(),
  specializedCourses: z.array(objectId).optional(),
  permissions: z.array(z.nativeEnum(Permission)).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
