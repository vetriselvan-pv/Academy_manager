import { apiClient } from '@/lib/apiClient'
import type { BranchResponse, BranchesResponse } from '@/types/api'
import type { Branch } from '@/types/models'

export interface CreateBranchPayload {
  name: string
  code: string
  address: string
  city: string
  state?: string
  phone?: string
  email?: string
}

export type UpdateBranchPayload = Partial<CreateBranchPayload> & { isActive?: boolean }

export const branchesApi = {
  async list(): Promise<Branch[]> {
    const { data } = await apiClient.get<BranchesResponse>('/branches')
    return data.branches
  },

  async get(id: string): Promise<Branch> {
    const { data } = await apiClient.get<BranchResponse>(`/branches/${id}`)
    return data.branch
  },

  async create(payload: CreateBranchPayload): Promise<Branch> {
    const { data } = await apiClient.post<BranchResponse>('/branches', payload)
    return data.branch
  },

  async update(id: string, payload: UpdateBranchPayload): Promise<Branch> {
    const { data } = await apiClient.patch<BranchResponse>(`/branches/${id}`, payload)
    return data.branch
  },

  async deactivate(id: string): Promise<void> {
    await apiClient.delete(`/branches/${id}`)
  },
}
