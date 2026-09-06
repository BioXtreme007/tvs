import { useEffect, useState } from 'react';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = window.setTimeout(abort, 45000);
  try {
    const token = localStorage.getItem('tvs_auth_token');
    const response = await fetch(API_BASE_URL + '/api/v1' + path, {
      ...options, signal: controller.signal, credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers },
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('tvs_auth_token');
        localStorage.removeItem('tvs_credit_user');
      }
      const body = await response.json().catch(() => ({}));
      const detail = typeof body.detail === 'string' ? body.detail : body.error?.message;
      throw new Error(detail || (response.status === 401 ? 'Please sign in again to continue.' : 'The service could not complete this request (' + response.status + '). Please try again.'));
    }
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) throw new Error(options.signal?.aborted ? 'Request cancelled.' : 'The request timed out. Please try again.');
    if (error instanceof TypeError) throw new Error('Cannot reach the lending service. Check your connection and try again.');
    throw error;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}

export function useResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    api<T>(path, { signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) setData(value); })
      .catch(e => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, revision]);
  return { data, error, loading, refresh: () => setRevision(v => v + 1) };
}

export const money = (value: unknown) => typeof value === 'number' && Number.isFinite(value)
  ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value) : '—';
export const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value)
  ? value.toLocaleString('en-IN') : '—';
export const humanize = (value: unknown) => typeof value === 'string' ? value.replace(/_/g, ' ').toLowerCase() : 'Not available';
export function download(name: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

