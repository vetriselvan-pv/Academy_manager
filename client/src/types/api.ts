import type { Gender } from './enums'
import type {
  AuthenticatedUser,
  Branch,
  Course,
  Enrollment,
  MenuItem,
  Student,
  Teacher,
} from './models'

export interface ApiErrorBody {
  message: string
  errors?: Record<string, string[] | undefined>
}

export interface AuthResponse {
  user: AuthenticatedUser
  accessToken: string
  refreshToken: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterStudentPayload {
  name: string
  email: string
  password: string
  phone?: string
  branch: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  guardianName?: string
  guardianPhone?: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface MeResponse {
  user: AuthenticatedUser
}

export interface BranchesResponse {
  branches: Branch[]
}

export interface BranchResponse {
  branch: Branch
}

export interface CoursesResponse {
  courses: Course[]
}

export interface CourseResponse {
  course: Course
}

export interface TeachersResponse {
  teachers: Teacher[]
}

export interface TeacherResponse {
  teacher: Teacher
}

export interface StudentsResponse {
  students: Student[]
}

export interface StudentResponse {
  student: Student
}

export interface EnrollmentsResponse {
  enrollments: Enrollment[]
}

export interface EnrollmentResponse {
  enrollment: Enrollment
}

export interface MenuResponse {
  menu: MenuItem[]
}
