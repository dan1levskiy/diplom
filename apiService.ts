
import { Task, UserStats, TelegramUser, TeamOverview, AdminCompaniesOverview } from './types';

// Всегда этот домен. На Vercel удали переменную VITE_API_BASE_URL, если она есть.
const API_BASE_URL = 'https://taskmanager-n1mb3l.amvera.io';

async function parseApiError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === 'string') return body.detail;
  } catch {
    // не JSON
  }
  if (response.status === 404) {
    return 'Пользователь не найден. Сначала зарегистрируйтесь в боте.';
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
