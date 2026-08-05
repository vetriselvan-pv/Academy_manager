import { apiClient } from '@/lib/apiClient'
import type { CourseResponse, CoursesResponse } from '@/types/api'

import type { Course } from '@/types/models'

export interface CreateCoursePayload {
  name: string
  category: string
  description?: string
  durationMonths?: number
  fee: number
}

export type UpdateCoursePayload = Partial<CreateCoursePayload> & { isActive?: boolean }

export const coursesApi = {
  async list(params?: Record<string, string>): Promise<Course[]> {
    const { data } = await apiClient.get<CoursesResponse>('/courses', { params })
    return data.courses
  },

  async get(id: string): Promise<Course> {
    const { data } = await apiClient.get<CourseResponse>(`/courses/${id}`)
    return data.course
  },

  async create(payload: CreateCoursePayload): Promise<Course> {
    const { data } = await apiClient.post<CourseResponse>('/courses', payload)
    return data.course
  },

  async update(id: string, payload: UpdateCoursePayload): Promise<Course> {
    const { data } = await apiClient.patch<CourseResponse>(`/courses/${id}`, payload)
    return data.course
  },

  async deactivate(id: string): Promise<void> {
    await apiClient.delete(`/courses/${id}`)
  },
}
