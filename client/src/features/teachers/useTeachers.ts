import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teachersApi, type CreateTeacherPayload, type UpdateTeacherPayload } from '@/api/teachers.api'

export function useTeachers(branch?: string) {
  return useQuery({
    queryKey: ['teachers', { branch: branch ?? null }],
    queryFn: () => teachersApi.list(branch),
  })
}

export function useCreateTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTeacherPayload) => teachersApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }),
  })
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTeacherPayload }) => teachersApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }),
  })
}

export function useDeactivateTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teachersApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teachers'] }),
  })
}
