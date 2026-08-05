import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  enrollmentsApi,
  type CreateEnrollmentPayload,
  type EnrollmentFilters,
  type UpdateEnrollmentPayload,
} from '@/api/enrollments.api'

export function useEnrollments(filters: EnrollmentFilters & Record<string, any> = {}) {
  return useQuery({
    queryKey: ['enrollments', filters],
    queryFn: () => enrollmentsApi.list(filters),
  })
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEnrollmentPayload) => enrollmentsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
  })
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEnrollmentPayload }) => enrollmentsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
  })
}

export function useCancelEnrollment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => enrollmentsApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollments'] }),
  })
}
