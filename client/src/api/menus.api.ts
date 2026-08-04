import { apiClient } from '@/lib/apiClient'
import type { MenuResponse } from '@/types/api'

export const menusApi = {
  async get(): Promise<MenuResponse> {
    const { data } = await apiClient.get<MenuResponse>('/menus')
    return data
  },
}
