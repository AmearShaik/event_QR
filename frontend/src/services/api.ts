import {
  ScanResponse,
  ImportPreviewResponse,
  ImportConfirmResponse,
  DashboardStats,
} from '../../../shared/types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res: Response, fallbackErrorMessage: string) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || fallbackErrorMessage);
    }
    return data;
  } else {
    const text = await res.text();
    console.error(`[API Non-JSON Response] ${res.url} (${res.status}):`, text.slice(0, 200));
    throw new Error(`Server returned ${res.status}: ${res.statusText || fallbackErrorMessage}`);
  }
}

export const api = {
  // Auth
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res, 'Login failed. Please check credentials.');
  },

  studentLogin: async (studentId: string, password: string) => {
    const res = await fetch(`${API_BASE}/candidate/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, password }),
    });
    return handleResponse(res, 'Student login failed.');
  },

  me: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to verify admin session.');
  },

  // Candidate Verification & Registration
  verifyCandidate: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/candidates/verify/${encodeURIComponent(studentId)}`);
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
    const res = await fetch(`${API_BASE}/candidates/register`, {
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
    const res = await fetch(`${API_BASE}/admin/import/preview`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    return handleResponse(res, 'Failed to preview import file.');
  },

  confirmImport: async (previewRows: any[], filename: string): Promise<ImportConfirmResponse> => {
    const res = await fetch(`${API_BASE}/admin/import/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ previewRows, filename }),
    });
    return handleResponse(res, 'Import confirmation failed.');
  },

  // Candidates Directory
  getCandidates: async (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/candidates?${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to load candidate list.');
  },

  // Gate Scanner
  scanToken: async (qrToken: string, eventId?: string): Promise<ScanResponse> => {
    const res = await fetch(`${API_BASE}/attendance/scan`, {
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
    const res = await fetch(`${API_BASE}/admin/attendance/logs?${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to load attendance logs.');
  },

  exportAttendanceCSV: async () => {
    const res = await fetch(`${API_BASE}/admin/attendance/export-csv`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to export CSV report');
    const blob = await res.blob();
    return {
      blob,
      filename: `Graduation-Day-2026-Attendance-${new Date().toISOString().split('T')[0]}.csv`,
    };
  },

  // Ceremony Events Management
  getEvents: async () => {
    const res = await fetch(`${API_BASE}/admin/events`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to fetch ceremony events.');
  },

  createEvent: async (eventData: { name: string; slug: string; description?: string }) => {
    const res = await fetch(`${API_BASE}/admin/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(eventData),
    });
    return handleResponse(res, 'Failed to create event.');
  },

  updateEvent: async (id: string, updateData: { name?: string; description?: string; isActive?: boolean }) => {
    const res = await fetch(`${API_BASE}/admin/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updateData),
    });
    return handleResponse(res, 'Failed to update event.');
  },

  getEventStats: async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/events/${id}/stats`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res, 'Failed to fetch event stats.');
  },

  // Dashboard Live Analytics
  getDashboardStats: async (): Promise<DashboardStats & { programBreakdown: any[] }> => {
    const res = await fetch(`${API_BASE}/admin/dashboard/stats`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse(res, 'Failed to fetch dashboard stats.');
    return data.stats || data;
  },
};
