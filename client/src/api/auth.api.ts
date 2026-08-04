import { apiClient } from '@/lib/apiClient'
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  RegisterStudentPayload,
} from '@/types/api'

export const authApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async registerStudent(payload: RegisterStudentPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register/student', payload)
    return data
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken })
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.post('/auth/change-password', payload)
  },
}
