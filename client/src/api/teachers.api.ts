import { apiClient } from '@/lib/apiClient'
import type { PaginatedResponse, TeacherResponse } from '@/types/api'
import type { Permission, TeacherDesignation } from '@/types/enums'
import type { Teacher } from '@/types/models'

export interface CreateTeacherPayload {
  name: string
  email: string
  password: string
  phone?: string
  designation: TeacherDesignation
  branches: string[]
  specializedCourses?: string[]
  joiningDate?: string
}

export interface UpdateTeacherPayload {
  name?: string
  phone?: string
  designation?: TeacherDesignation
  branches?: string[]
  specializedCourses?: string[]
  permissions?: Permission[]
  isActive?: boolean
}

export const teachersApi = {
  async list(filters?: Record<string, any>): Promise<PaginatedResponse<Teacher>> {
    const { data } = await apiClient.get<PaginatedResponse<Teacher>>('/teachers', { params: filters })
    return data
  },

  async get(id: string): Promise<Teacher> {
    const { data } = await apiClient.get<TeacherResponse>(`/teachers/${id}`)
    return data.teacher
  },

  async create(payload: CreateTeacherPayload): Promise<Teacher> {
    const { data } = await apiClient.post<TeacherResponse>('/teachers', payload)
    return data.teacher
  },

  async update(id: string, payload: UpdateTeacherPayload): Promise<Teacher> {
    const { data } = await apiClient.patch<TeacherResponse>(`/teachers/${id}`, payload)
    return data.teacher
  },

  async deactivate(id: string): Promise<void> {
    await apiClient.delete(`/teachers/${id}`)
  },
}
