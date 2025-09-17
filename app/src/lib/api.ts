export type HealthResponse = {
  status: string;
  timestamp: string;
};

const baseUrl = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  return resp.json() as Promise<T>;
}

export const api = {
  getHealth: () => request<HealthResponse>('/api/health'),
};


