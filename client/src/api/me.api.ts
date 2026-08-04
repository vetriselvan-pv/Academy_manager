import { apiClient } from '@/lib/apiClient'
import type { MeResponse } from '@/types/api'

export const meApi = {
  async get(): Promise<MeResponse> {
    const { data } = await apiClient.get<MeResponse>('/me')
    return data
  },
}
