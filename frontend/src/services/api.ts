/**
 * HireMind Centralized API Service Layer
 * Automatically manages Authorization Bearer headers, standardizes errors,
 * and provides typed access to backend endpoints.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  data: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const token = localStorage.getItem('hiremind_token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle Unauthorized (401)
  if (response.status === 401) {
    // If not already on auth endpoints, clear token
    if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      localStorage.removeItem('hiremind_token')
    }
  }

  let data: any = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const errorMessage = data?.detail || response.statusText || 'Request failed'
    throw new ApiError(errorMessage, response.status, data)
  }

  return data as T
}

// --- API Service Methods ---

export const api = {
  // Authentication & Current User
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ access_token: string; token_type: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (payload: {
      email: string
      password: string
      experience_level?: string
      location?: string
      work_mode?: string
      skills?: string[]
    }) =>
      request<{ access_token: string; token_type: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getMe: () => request<any>('/me'),

    updateProfile: (payload: {
      experience_level?: string
      location?: string
      work_mode?: string
      skills?: string[]
    }) =>
      request<any>('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  },

  // Jobs & Catalog
  jobs: {
    list: (params: {
      q?: string
      location?: string
      work_mode?: string
      experience_level?: string
      page?: number
      limit?: number
    } = {}) => {
      const searchParams = new URLSearchParams()
      if (params.q?.trim()) searchParams.append('q', params.q.trim())
      if (params.location?.trim()) searchParams.append('location', params.location.trim())
      if (params.work_mode && params.work_mode !== 'All') searchParams.append('work_mode', params.work_mode)
      if (params.experience_level && params.experience_level !== 'All') searchParams.append('experience_level', params.experience_level)
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.limit) searchParams.append('limit', params.limit.toString())

      const queryStr = searchParams.toString()
      return request<any>(`/jobs${queryStr ? `?${queryStr}` : ''}`)
    },

    getById: (id: number) => request<any>(`/jobs/${id}`),

    save: (id: number) =>
      request<any>(`/jobs/${id}/save`, {
        method: 'POST',
      }),

    unsave: (id: number) =>
      request<{ message: string; job_id: number; saved: boolean }>(`/jobs/${id}/save`, {
        method: 'DELETE',
      }),

    updateSavedStatus: (id: number, status: string) =>
      request<any>(`/jobs/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    getSaved: (status?: string) => {
      const qs = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : ''
      return request<any[]>(`/saved${qs}`)
    },

    getRecommendations: (params: { limit?: number; min_score?: number } = {}) => {
      const searchParams = new URLSearchParams()
      if (params.limit) searchParams.append('limit', params.limit.toString())
      if (params.min_score !== undefined) searchParams.append('min_score', params.min_score.toString())
      const queryStr = searchParams.toString()
      return request<any[]>(`/recommendations${queryStr ? `?${queryStr}` : ''}`)
    },
  },

  // AI Career Assistant
  assistant: {
    chat: (payload: {
      message?: string
      messages?: Array<{ role: string; content?: string }>
    }) =>
      request<{ reply: string; jobs: any[]; tool_calls_count: number }>('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  // Health
  health: {
    check: () => request<any>('/health'),
  },
}

export default api
