'use client'
import axios, { AxiosResponse } from 'axios'

// Define a reusable response type
interface ApiResponse<T = unknown> {
  data: T
  status: number
}

// Define a reusable error type
interface ApiError {
  message: string
  status?: number
}

interface ErrorResponse {
  message: string
}

const extractError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message:
        // Try common shapes: { data: { message } } or fallback to axios error message
        (error.response?.data as ErrorResponse)?.message || error.message || 'Something went wrong!',
      status: error.response?.status,
    }
  }

  // Non-axios errors
  return {
    message: (error as Error)?.message || 'Something went wrong!',
  }
}

// ---- GET ----
export const GET = async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
  try {
    const { data, status }: AxiosResponse<T> = await axios.get(`/api${url}`)
    return { data, status }
  } catch (error: unknown) {
    throw extractError(error)
  }
}

// ---- POST ----
export const POST = async <T = unknown>(url: string, body?: unknown, beforeUrl = '/api'): Promise<ApiResponse<T>> => {
  try {
    const { data, status }: AxiosResponse<T> = await axios.post(beforeUrl + url, body)
    return { data, status }
  } catch (error: unknown) {
    throw extractError(error)
  }
}

// ---- PUT ----
export const PUT = async <T = unknown>(url: string, body?: unknown, beforeUrl = '/api'): Promise<ApiResponse<T>> => {
  try {
    const { data, status }: AxiosResponse<T> = await axios.put(beforeUrl + url, body)
    return { data, status }
  } catch (error: unknown) {
    throw extractError(error)
  }
}

// ---- DELETE ----
export const DELETE = async <T = unknown>(url: string, beforeUrl = '/api'): Promise<ApiResponse<T>> => {
  try {
    const { data, status }: AxiosResponse<T> = await axios.delete(beforeUrl + url)
    return { data, status }
  } catch (error: unknown) {
    throw extractError(error)
  }
}

// ---- PATCH ----
export const PATCH = async <T = unknown>(url: string, body?: unknown, beforeUrl = '/api'): Promise<ApiResponse<T>> => {
  try {
    const { data, status }: AxiosResponse<T> = await axios.patch(beforeUrl + url, body)
    return { data, status }
  } catch (error: unknown) {
    throw extractError(error)
  }
}

// ---- POST FORM ----
export const POST_FORM = async <T = unknown>(
  url: string,
  body?: unknown,
  beforeUrl = '/api'
): Promise<ApiResponse<T>> => {
  try {
    const { data, status }: AxiosResponse<T> = await axios.postForm(beforeUrl + url, body)
    return { data, status }
  } catch (error: unknown) {
    throw extractError(error)
  }
}

// ---- PUT FORM ----
export const PUT_FORM = async <T = unknown>(
  url: string,
  body?: unknown,
  beforeUrl = '/api'
): Promise<ApiResponse<T>> => {
  try {
    const { data, status }: AxiosResponse<T> = await axios.putForm(beforeUrl + url, body)
    return { data, status }
  } catch (error: unknown) {
    throw extractError(error)
  }
}
