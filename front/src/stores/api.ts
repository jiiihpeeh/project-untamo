// circular import — safe: useStore only accessed inside function bodies after init
import { useStore } from './store'

type Headers = Record<string, string>

export interface ApiError extends Error {
    response: { status: number; data: unknown }
}

export function isApiError(e: unknown): e is ApiError {
    return e instanceof Error && 'response' in e
}

export function getCommunicationInfo() {
    const state = useStore.getState()
    return { server: state.address, token: state.token }
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let data: unknown = null
        try { data = await res.json() } catch {}
        const err = new Error(`HTTP ${res.status}`) as ApiError
        err.response = { status: res.status, data }
        throw err
    }
    const text = await res.text()
    return (text ? JSON.parse(text) : null) as T
}

export async function apiGet<T>(path: string, extraHeaders?: Headers): Promise<T> {
    const { server, token } = getCommunicationInfo()
    const res = await fetch(`${server}${path}`, {
        headers: { token, ...extraHeaders },
    })
    return handleResponse<T>(res)
}

export async function apiPost<T>(path: string, body: unknown, extraHeaders?: Headers): Promise<T> {
    const { server, token } = getCommunicationInfo()
    const res = await fetch(`${server}${path}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', token, ...extraHeaders },
        body:    JSON.stringify(body),
    })
    return handleResponse<T>(res)
}

export async function apiPut<T>(path: string, body: unknown, extraHeaders?: Headers): Promise<T> {
    const { server, token } = getCommunicationInfo()
    const res = await fetch(`${server}${path}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', token, ...extraHeaders },
        body:    JSON.stringify(body),
    })
    return handleResponse<T>(res)
}

export async function apiDelete<T>(path: string, extraHeaders?: Headers): Promise<T> {
    const { server, token } = getCommunicationInfo()
    const res = await fetch(`${server}${path}`, {
        method:  'DELETE',
        headers: { token, ...extraHeaders },
    })
    return handleResponse<T>(res)
}

export async function apiGetBlob(path: string, extraHeaders?: Headers): Promise<Blob> {
    const { server, token } = getCommunicationInfo()
    const res = await fetch(`${server}${path}`, {
        headers: { token, ...extraHeaders },
    })
    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`) as ApiError
        err.response = { status: res.status, data: null }
        throw err
    }
    return res.blob()
}

export async function apiGetArrayBuffer(path: string, extraHeaders?: Headers): Promise<ArrayBuffer> {
    const { server, token } = getCommunicationInfo()
    const res = await fetch(`${server}${path}`, {
        headers: { token, ...extraHeaders },
    })
    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`) as ApiError
        err.response = { status: res.status, data: null }
        throw err
    }
    return res.arrayBuffer()
}

// Unauthenticated or fully custom-URL requests (login, qr-login, etc.)
export async function apiFetch<T>(
    method: string,
    url: string,
    body?: unknown,
    headers?: Headers
): Promise<T> {
    const init: RequestInit = {
        method,
        headers: body !== undefined
            ? { 'Content-Type': 'application/json', ...headers }
            : { ...headers },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    }
    const res = await fetch(url, init)
    return handleResponse<T>(res)
}
