import { apiClient } from '@/lib/apiClient'
import type { StudentResponse, StudentsResponse } from '@/types/api'
import type { Gender } from '@/types/enums'
import type { Student } from '@/types/models'

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
  async list(branch?: string): Promise<Student[]> {
    const { data } = await apiClient.get<StudentsResponse>('/students', { params: { branch } })
    return data.students
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
