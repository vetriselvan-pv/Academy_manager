import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { courseCategoriesApi } from '@/api/courseCategories.api'

export function useCourseCategories(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['courseCategories', filters],
    queryFn: () => courseCategoriesApi.list(filters),
    placeholderData: keepPreviousData,
  })
}
