import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { branchesApi, type CreateBranchPayload, type UpdateBranchPayload } from '@/api/branches.api'

export function useBranches(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['branches', filters],
    queryFn: () => branchesApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBranchPayload) => branchesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  })
}

export function useUpdateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBranchPayload }) => branchesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  })
}

export function useDeactivateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => branchesApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  })
}
