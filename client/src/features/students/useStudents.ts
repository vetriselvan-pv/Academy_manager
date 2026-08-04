import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { studentsApi, type UpdateStudentPayload } from '@/api/students.api'

export function useStudents(branch?: string) {
  return useQuery({
    queryKey: ['students', { branch: branch ?? null }],
    queryFn: () => studentsApi.list(branch),
  })
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStudentPayload }) => studentsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  })
}

export function useDeactivateStudent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => studentsApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['students'] }),
  })
}
