
import { Task, UserStats, TelegramUser, TeamOverview, AdminCompaniesOverview } from './types';

// Прямо на Amvera (CORS включён). Vercel-прокси не нужен.
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://taskmanager-n1mb3l.amvera.io'
).replace(/\/$/, '');

async function parseApiError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await response.json().catch(() => ({}));
    if (typeof body.detail === 'string') return body.detail;
  }
  if (response.status === 404) {
    return 'Сервер API не отвечает. Пересоберите проект на Amvera (файлы api.py + app.py).';
  }
  return `Ошибка API (${response.status})`;
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json();
}

async function apiPost<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { method: 'POST' });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json();
}

export const loginByTelegramId = async (tgId: string): Promise<TelegramUser> => {
  const id = parseInt(tgId.trim(), 10);
  if (!id || Number.isNaN(id)) {
    throw new Error('Введите корректный Telegram ID (только цифры).');
  }
  return apiGet<TelegramUser>(`/api/user?userId=${id}`);
};

export const fetchTasks = async (userId: number): Promise<Task[]> => {
  return apiGet<Task[]>(`/api/tasks?userId=${userId}`);
};

export const fetchStats = async (userId: number): Promise<UserStats> => {
  return apiGet<UserStats>(`/api/stats?userId=${userId}`);
};

export const fetchTeam = async (userId: number): Promise<TeamOverview> => {
  return apiGet<TeamOverview>(`/api/team?userId=${userId}`);
};

export const assignDeputy = async (adminId: number, targetId: number): Promise<{ ok: boolean; message: string }> => {
  return apiPost(`/api/deputy/assign?userId=${adminId}&targetId=${targetId}`);
};

export const removeDeputy = async (adminId: number): Promise<{ ok: boolean; message: string }> => {
  return apiPost(`/api/deputy/remove?userId=${adminId}`);
};

export const fetchAdminCompanies = async (userId: number): Promise<AdminCompaniesOverview> => {
  return apiGet<AdminCompaniesOverview>(`/api/admin/companies?userId=${userId}`);
};

export const deleteCompany = async (
  userId: number,
  companyId: number
): Promise<{ ok: boolean; message: string }> => {
  return apiPost(`/api/admin/companies/delete?userId=${userId}&companyId=${companyId}`);
};

export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const data = await apiGet<{ ok: boolean }>('/api/health');
    return data.ok === true;
  } catch {
    return false;
  }
};

export const getAttachmentUrl = (fileId: string, userId: number): string => {
  return `${API_BASE_URL}/api/files?fileId=${encodeURIComponent(fileId)}&userId=${userId}`;
};
