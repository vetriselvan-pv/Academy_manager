import { apiClient } from '@/lib/apiClient'
import type { EnrollmentResponse, EnrollmentsResponse } from '@/types/api'
import type { EnrollmentStatus } from '@/types/enums'
import type { Enrollment } from '@/types/models'

export interface EnrollmentFilters {
  student?: string
  branch?: string
  status?: EnrollmentStatus
}

export interface CreateEnrollmentPayload {
  student?: string
  course: string
  branch: string
  teacher?: string
  batchTiming?: string
  startDate?: string
}

export interface UpdateEnrollmentPayload {
  teacher?: string
  batchTiming?: string
  endDate?: string
  status?: EnrollmentStatus
  feePaid?: number
}

export const enrollmentsApi = {
  async list(filters: EnrollmentFilters = {}): Promise<Enrollment[]> {
    const { data } = await apiClient.get<EnrollmentsResponse>('/enrollments', { params: filters })
    return data.enrollments
  },

  async get(id: string): Promise<Enrollment> {
    const { data } = await apiClient.get<EnrollmentResponse>(`/enrollments/${id}`)
    return data.enrollment
  },

  async create(payload: CreateEnrollmentPayload): Promise<Enrollment> {
    const { data } = await apiClient.post<EnrollmentResponse>('/enrollments', payload)
    return data.enrollment
  },

  async update(id: string, payload: UpdateEnrollmentPayload): Promise<Enrollment> {
    const { data } = await apiClient.patch<EnrollmentResponse>(`/enrollments/${id}`, payload)
    return data.enrollment
  },

  async cancel(id: string): Promise<void> {
    await apiClient.delete(`/enrollments/${id}`)
  },
}
