import { apiClient } from '@/lib/apiClient'
import type { PaginatedResponse, StudentResponse } from '@/types/api'
import type { Gender } from '@/types/enums'
import type { Student } from '@/types/models'

export interface CreateStudentPayload {
  name: string
  email: string
  password?: string
  phone?: string
  branch: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  guardianName?: string
  guardianPhone?: string
}

export interface UpdateStudentPayload {
  name?: string
  phone?: string
  branch?: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  guardianName?: string
  guardianPhone?: string
  isActive?: boolean
}

export const studentsApi = {
  async create(payload: CreateStudentPayload): Promise<Student> {
    const { data } = await apiClient.post<{ user: Student }>('/auth/register/student', payload)
    return data.user
  },

  async list(filters?: Record<string, any>): Promise<PaginatedResponse<Student>> {
    const { data } = await apiClient.get<PaginatedResponse<Student>>('/students', { params: filters })
    return data
  },

  async get(id: string): Promise<Student> {
    const { data } = await apiClient.get<StudentResponse>(`/students/${id}`)
    return data.student
  },

  async update(id: string, payload: UpdateStudentPayload): Promise<Student> {
    const { data } = await apiClient.patch<StudentResponse>(`/students/${id}`, payload)
    return data.student
  },

  async deactivate(id: string): Promise<void> {
    await apiClient.delete(`/students/${id}`)
  },
}
