import { apiClient } from '@/lib/apiClient'
import type { CourseCategory } from '@/types/models'

export interface CourseCategoriesResponse {
  courseCategories: CourseCategory[]
}

export const courseCategoriesApi = {
  async list(params?: Record<string, string>): Promise<CourseCategory[]> {
    const { data } = await apiClient.get<CourseCategoriesResponse>('/course-categories', { params })
    return data.courseCategories
  },
}
