const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

interface ApiSuccessResponse<T> {
  data: T;
}

interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json() as ApiErrorResponse;
    throw new Error(errorData.error?.message || 'API request failed');
  }

  const successData = await response.json() as ApiSuccessResponse<T>;
  return successData.data;
}

export async function checkApiHealth(): Promise<{ status: string }> {
  return apiClient('/health');
}

export interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

export async function fetchSummary(): Promise<Summary> {
  return apiClient<Summary>('/summary');
}
