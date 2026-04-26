export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  expires_at: number  // Unix timestamp
}

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
}
