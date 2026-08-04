export const UserRole = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const TeacherDesignation = {
  INSTRUCTOR: 'INSTRUCTOR',
  SENIOR_INSTRUCTOR: 'SENIOR_INSTRUCTOR',
  COORDINATOR: 'COORDINATOR',
  ACADEMIC_HEAD: 'ACADEMIC_HEAD',
} as const
export type TeacherDesignation = (typeof TeacherDesignation)[keyof typeof TeacherDesignation]

export const CourseCategory = {
  YOGA: 'YOGA',
  DANCE: 'DANCE',
  MUSIC: 'MUSIC',
  ABACUS: 'ABACUS',
  TUITION_10TH: 'TUITION_10TH',
  HINDI_CLASSES: 'HINDI_CLASSES',
  OTHER: 'OTHER',
} as const
export type CourseCategory = (typeof CourseCategory)[keyof typeof CourseCategory]

export const EnrollmentStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type EnrollmentStatus = (typeof EnrollmentStatus)[keyof typeof EnrollmentStatus]

export const Permission = {
  VIEW_STUDENTS: 'VIEW_STUDENTS',
  MANAGE_STUDENTS: 'MANAGE_STUDENTS',
  VIEW_ENROLLMENTS: 'VIEW_ENROLLMENTS',
  MANAGE_ENROLLMENTS: 'MANAGE_ENROLLMENTS',
  VIEW_REPORTS: 'VIEW_REPORTS',
  MANAGE_COURSE_CONTENT: 'MANAGE_COURSE_CONTENT',
  MANAGE_BRANCH_TEACHERS: 'MANAGE_BRANCH_TEACHERS',
} as const
export type Permission = (typeof Permission)[keyof typeof Permission]

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const
export type Gender = (typeof Gender)[keyof typeof Gender]

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  YOGA: 'Yoga',
  DANCE: 'Dance',
  MUSIC: 'Music',
  ABACUS: 'Abacus',
  TUITION_10TH: '10th Tuition',
  HINDI_CLASSES: 'Hindi Classes',
  OTHER: 'Other',
}

export const DESIGNATION_LABELS: Record<TeacherDesignation, string> = {
  INSTRUCTOR: 'Instructor',
  SENIOR_INSTRUCTOR: 'Senior Instructor',
  COORDINATOR: 'Coordinator',
  ACADEMIC_HEAD: 'Academic Head',
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  VIEW_STUDENTS: 'View Students',
  MANAGE_STUDENTS: 'Manage Students',
  VIEW_ENROLLMENTS: 'View Enrollments',
  MANAGE_ENROLLMENTS: 'Manage Enrollments',
  VIEW_REPORTS: 'View Reports',
  MANAGE_COURSE_CONTENT: 'Manage Course Content',
  MANAGE_BRANCH_TEACHERS: 'Manage Branch Teachers',
}

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
}
