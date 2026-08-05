import { apiClient } from '@/lib/apiClient'
import type { SuperAdmin } from '@/types/models'

export interface AdminsResponse {
  admins: SuperAdmin[]
}

export const usersApi = {
  async getAdmins(): Promise<SuperAdmin[]> {
    const { data } = await apiClient.get<AdminsResponse>('/users/admins')
    return data.admins
  },
}
