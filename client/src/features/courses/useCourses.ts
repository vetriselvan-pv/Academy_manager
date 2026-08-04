import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { coursesApi, type CreateCoursePayload, type UpdateCoursePayload } from '@/api/courses.api'
import type { CourseCategory } from '@/types/enums'

export function useCourses(category?: CourseCategory) {
  return useQuery({
    queryKey: ['courses', { category: category ?? null }],
    queryFn: () => coursesApi.list(category),
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => coursesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCoursePayload }) => coursesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  })
}

export function useDeactivateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => coursesApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courses'] }),
  })
}
