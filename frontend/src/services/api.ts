import {
  ScanResponse,
  ImportPreviewResponse,
  ImportConfirmResponse,
  DashboardStats,
} from '../types';

export function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).Capacitor?.isNativePlatform?.() ||
    (window as any).Capacitor !== undefined ||
    window.location.protocol === 'capacitor:' ||
    (window.location.hostname === 'localhost' && window.location.port === '')
  );
}

export function getApiBaseUrl(): string {
  const customUrl = localStorage.getItem('qr_server_url');
  if (customUrl && customUrl.trim()) {
    const trimmed = customUrl.trim().replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  const env = (import.meta as any).env;
  if (env && env.VITE_API_URL) {
    const envUrl = (env.VITE_API_URL as string).trim().replace(/\/+$/, '');
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }

  return '/api';
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err: any) {
    const activeBase = getApiBaseUrl();
    const isLocal = activeBase.startsWith('/') || activeBase.includes('localhost') || activeBase.includes('127.0.0.1');
    const isMobile = isNativePlatform();
    
    if (isMobile && isLocal && !localStorage.getItem('qr_server_url')) {
      throw new Error(
        `Cannot reach backend server. Mobile app is not connected to a server URL. Please tap the Server button at top-right to enter your PC's IP (e.g. http://192.168.1.19:5000).`
      );
    }
    
    throw new Error(
      `Cannot connect to backend server (${activeBase}). Please verify the backend is running and accessible on this network.`
    );
  }
}

async function handleResponse(res: Response, fallbackErrorMessage: string) {
  let text = '';
  try {
    text = await res.text();
  } catch (err: any) {
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText || fallbackErrorMessage}`);
    }
    return { status: 'OK' };
  }

  // Attempt JSON parse
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (data !== null) {
    if (!res.ok) {
      throw new Error(data.message || data.error || fallbackErrorMessage);
    }
    return data;
  }

  // Handle Non-JSON (e.g., HTML from frontend or proxy)
  if (text.includes('<!DOCTYPE html>') || text.includes('<html') || text.includes('<head>')) {
    throw new Error(
      `Connected to web page instead of API server. Please check your Server URL in settings and ensure it points to the backend (port 5000, e.g. http://192.168.1.19:5000).`
    );
  }

  if (!res.ok) {
    throw new Error(
      `Server returned ${res.status}: ${text.slice(0, 120).trim() || res.statusText || fallbackErrorMessage}`
    );
  }

  return { status: 'OK', message: text.trim() || 'OK' };
}

export const api = {
  isNative: isNativePlatform,

  isCustomServerSet: (): boolean => {
    return Boolean(localStorage.getItem('qr_server_url'));
  },

  getServerUrl: (): string => {
    const env = (import.meta as any).env;
    return localStorage.getItem('qr_server_url') || (env?.VITE_API_URL as string) || '';
  },

  getRecommendedPresets: (): Array<{ label: string; url: string; desc: string }> => {
    return [
      {
        label: 'Local Wi-Fi (Default PC IP)',
        url: 'http://192.168.1.19:5000',
        desc: 'For testing phone connected to same Wi-Fi as host PC',
      },
      {
        label: 'Android Emulator',
        url: 'http://10.0.2.2:5000',
        desc: 'Default host loopback address for Android Studio Emulator',
      },
      {
        label: 'Localhost (Dev PC)',
        url: 'http://localhost:5000',
        desc: 'For local browser development on this computer',
      },
    ];
  },

  setServerUrl: (url: string) => {
    if (!url || !url.trim()) {
      localStorage.removeItem('qr_server_url');
    } else {
      localStorage.setItem('qr_server_url', url.trim().replace(/\/+$/, ''));
    }
  },

  testConnection: async (testUrl?: string): Promise<{ ok: boolean; status?: string; message?: string }> => {
    let baseUrl: string;
    if (testUrl && testUrl.trim()) {
      const trimmed = testUrl.trim().replace(/\/+$/, '');
      baseUrl = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
    } else {
      baseUrl = getApiBaseUrl();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      // Try /health then /api/health
      let res: Response | null = null;
      try {
        res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
      } catch {
        // Fallback without /api if base ended in /api or vice versa
        const altUrl = baseUrl.endsWith('/api') ? baseUrl.replace(/\/api$/, '/health') : `${baseUrl}/api/health`;
        res = await fetch(altUrl, { signal: controller.signal });
      }
      
      clearTimeout(timeoutId);
      if (res && res.ok) {
        const data = await res.json();
        return { ok: true, status: data.status || 'OK', message: 'Connected to server successfully!' };
      }
      return { ok: false, message: `Server responded with status ${res?.status || 'ERROR'}` };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { ok: false, message: 'Connection timed out (6s). Check IP, port & Wi-Fi.' };
      }
      return { ok: false, message: err.message || 'Cannot reach server. Ensure backend is running.' };
    }
  },

  // Auth
  login: async (username: string, password: string) => {
    const res = await safeFetch(`${getApiBaseUrl()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res, 'Login failed. Please check credentials.');
  },

  studentLogin: async (studentId: string, password: string) => {
    const res = await safeFetch(`${getApiBaseUrl()}/candidate/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, password }),
    });
    return handleResponse(res, 'Student login failed.');
  },

  me: async () => {
    const res = await safeFetch(`${getApiBaseUrl()}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to verify admin session.');
  },

  // Candidate Verification & Registration
  verifyCandidate: async (studentId: string) => {
    const res = await safeFetch(`${getApiBaseUrl()}/candidates/verify/${encodeURIComponent(studentId)}`);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (res.status === 403) return data; // Not eligible structure
      if (!res.ok) throw new Error(data.message || data.error || 'Verification failed');
      return data;
    }
    throw new Error(`Server error (${res.status}) during candidate verification.`);
  },

  registerCandidate: async (studentId: string, eventId?: string) => {
    const res = await safeFetch(`${getApiBaseUrl()}/candidates/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, eventId }),
    });
    return handleResponse(res, 'Registration pass generation failed.');
  },

  // Admin Candidate Import Engine
  uploadPreview: async (file: File): Promise<ImportPreviewResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await safeFetch(`${getApiBaseUrl()}/admin/import/preview`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    return handleResponse(res, 'Failed to preview import file.');
  },

  confirmImport: async (previewRows: any[], filename: string): Promise<ImportConfirmResponse> => {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/import/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ previewRows, filename }),
    });
    return handleResponse(res, 'Import confirmation failed.');
  },

  // Candidates Directory
  getCandidates: async (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${getApiBaseUrl()}/admin/candidates?${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to load candidate list.');
  },

  // Import History
  getImportLogs: async (): Promise<any[]> => {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/import/history`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse(res, 'Failed to fetch import logs');
    return data.logs || [];
  },

  // Gate Scanner
  scanToken: async (qrToken: string, eventId?: string): Promise<ScanResponse> => {
    const res = await safeFetch(`${getApiBaseUrl()}/attendance/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ qrToken, eventId }),
    });
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return {
      status: 'INVALID',
      message: `Scanner error: Server returned ${res.status}`,
    };
  },

  // Attendance Audit Logs & CSV Export
  getAttendanceLogs: async (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await safeFetch(`${getApiBaseUrl()}/admin/attendance/logs?${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to load attendance logs.');
  },

  exportAttendanceCSV: async () => {
    const res = await safeFetch(`${getApiBaseUrl()}/attendance/export-csv`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to export CSV report');
    const blob = await res.blob();
    return {
      blob,
      filename: `Graduation-Day-2026-Attendance-${new Date().toISOString().split('T')[0]}.csv`,
    };
  },

  resetAttendance: async () => {
    const res = await safeFetch(`${getApiBaseUrl()}/attendance/reset`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to reset attendance.');
  },

  // Events & Ceremony Events Management
  getEvents: async () => {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/events`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to fetch ceremony events.');
  },

  createEvent: async (eventData: { name: string; slug: string; description?: string }) => {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(eventData),
    });
    return handleResponse(res, 'Failed to create event.');
  },

  updateEvent: async (id: string, updateData: { name?: string; description?: string; isActive?: boolean }) => {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updateData),
    });
    return handleResponse(res, 'Failed to update event.');
  },

  getEventStats: async (id: string) => {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/events/${id}/stats`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to fetch event stats.');
  },

  // Dashboard Live Analytics
  getDashboardStats: async (): Promise<DashboardStats & { programBreakdown: any[] }> => {
    const res = await safeFetch(`${getApiBaseUrl()}/admin/dashboard/stats`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse(res, 'Failed to fetch dashboard stats.');
    return data.stats || data;
  },
};
