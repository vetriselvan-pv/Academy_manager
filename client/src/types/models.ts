import type {
  EnrollmentStatus,
  Gender,
  Permission,
  TeacherDesignation,
  UserRole,
} from "./enums";

export interface Branch {
  _id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state?: string;
  phone?: string;
  email?: string;
  manager?: SuperAdmin | string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** A branch reference is either a populated object or a bare id string, depending on the endpoint. */
export type BranchRef = Branch | string;

export interface CourseCategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  name: string;
  category: CourseCategory;
  description?: string;
  durationMonths?: number;
  fee: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CourseRef = Course | string;

interface BaseUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SuperAdmin extends BaseUser {
  role: typeof UserRole.SUPER_ADMIN;
}

export interface Student extends BaseUser {
  role: typeof UserRole.STUDENT;
  branch: BranchRef;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface Teacher extends BaseUser {
  role: typeof UserRole.TEACHER;
  designation: TeacherDesignation;
  branches: BranchRef[];
  specializedCourses: CourseRef[];
  permissions: Permission[];
  joiningDate?: string;
}

export type AuthenticatedUser = SuperAdmin | Student | Teacher;

export interface StudentRef {
  _id: string;
  name: string;
  email: string;
}

export interface TeacherRef {
  _id: string;
  name: string;
  email: string;
}

export interface EnrollmentCourseRef {
  _id: string;
  name: string;
  category: CourseCategory;
  fee: number;
}

export interface BranchSummaryRef {
  _id: string;
  name: string;
  code: string;
}

export interface Enrollment {
  _id: string;
  student: StudentRef | string;
  course: EnrollmentCourseRef | string;
  branch: BranchSummaryRef | string;
  teacher?: TeacherRef | string;
  batchTiming?: string;
  startDate: string;
  endDate?: string;
  status: EnrollmentStatus;
  feePaid: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  key: string;
  label: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

export function isPopulated<T extends { _id: string }>(
  ref: T | string | undefined,
): ref is T {
  return typeof ref === "object" && ref !== null;
}

export function refId(
  ref: { _id: string } | string | undefined,
): string | undefined {
  if (!ref) return undefined;
  return typeof ref === "string" ? ref : ref._id;
}

export function refLabel(
  ref: { name: string } | string | undefined,
  fallback = "Unknown",
): string {
  if (!ref) return fallback;
  return typeof ref === "string" ? ref : ref.name;
}
