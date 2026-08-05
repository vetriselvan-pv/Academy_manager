export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum TeacherDesignation {
  INSTRUCTOR = 'INSTRUCTOR',
  SENIOR_INSTRUCTOR = 'SENIOR_INSTRUCTOR',
  COORDINATOR = 'COORDINATOR',
  ACADEMIC_HEAD = 'ACADEMIC_HEAD',
}

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Permission {
  VIEW_STUDENTS = 'VIEW_STUDENTS',
  MANAGE_STUDENTS = 'MANAGE_STUDENTS',
  VIEW_ENROLLMENTS = 'VIEW_ENROLLMENTS',
  MANAGE_ENROLLMENTS = 'MANAGE_ENROLLMENTS',
  VIEW_REPORTS = 'VIEW_REPORTS',
  MANAGE_COURSE_CONTENT = 'MANAGE_COURSE_CONTENT',
  MANAGE_BRANCH_TEACHERS = 'MANAGE_BRANCH_TEACHERS',
}

/**
 * Default permission set granted to a teacher based on their designation.
 * A teacher's `permissions` field is seeded from this map on creation and
 * can be customized afterwards by a super admin.
 */
export const DESIGNATION_PERMISSIONS: Record<TeacherDesignation, Permission[]> = {
  [TeacherDesignation.INSTRUCTOR]: [Permission.VIEW_STUDENTS, Permission.VIEW_ENROLLMENTS],
  [TeacherDesignation.SENIOR_INSTRUCTOR]: [
    Permission.VIEW_STUDENTS,
    Permission.VIEW_ENROLLMENTS,
    Permission.MANAGE_ENROLLMENTS,
  ],
  [TeacherDesignation.COORDINATOR]: [
    Permission.VIEW_STUDENTS,
    Permission.MANAGE_STUDENTS,
    Permission.VIEW_ENROLLMENTS,
    Permission.MANAGE_ENROLLMENTS,
    Permission.VIEW_REPORTS,
  ],
  [TeacherDesignation.ACADEMIC_HEAD]: [
    Permission.VIEW_STUDENTS,
    Permission.MANAGE_STUDENTS,
    Permission.VIEW_ENROLLMENTS,
    Permission.MANAGE_ENROLLMENTS,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_COURSE_CONTENT,
    Permission.MANAGE_BRANCH_TEACHERS,
  ],
};

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
  permissions: Permission[];
  branches: string[];
}

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: AuthUser;
  }
}
