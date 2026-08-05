import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { coursesApi, type CreateCoursePayload, type UpdateCoursePayload } from '@/api/courses.api'


export function useCourses(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => coursesApi.list(filters),
    placeholderData: keepPreviousData,
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
