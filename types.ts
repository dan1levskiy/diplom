
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
  FAILED = 'failed'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface TaskAssignee {
  id: number;
  name: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  reportCount: number;
  statusRaw?: string;
  priorityRaw?: string;
  deadlineRaw?: string;
  resultText?: string;
  refactorReason?: string;
  assignees?: TaskAssignee[];
  assigneeNames?: string;
  attachments?: TaskAttachment[];
}

export interface TaskAttachment {
  fileId: string;
  type: 'img' | 'doc';
  isResult: boolean;
}

export interface UserStats {
  completed: number;
  pending: number;
  failed: number;
  efficiency: number;
  weeklyProgress: { day: string; tasks: number }[];
}

export interface TelegramUser {
  id: number;
  username: string;
  firstName: string;
  photoUrl: string;
  role?: string;
  roleLabel?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  canViewTeam?: boolean;
  companyName?: string;
}

export interface TeamEmployee {
  id: number;
  firstName: string;
  role: string;
  roleLabel: string;
  companyId?: number;
  companyName?: string;
  stats: UserStats;
  tasks: Task[];
}

export interface TeamOverview {
  companyName: string;
  totalEmployees: number;
  employees: TeamEmployee[];
}

export interface CompanyMember {
  id: number;
  firstName: string;
  role: string;
  roleLabel: string;
}

export interface AdminCompany {
  id: number;
  name: string;
  code: string;
  adminName: string;
  employeeCount: number;
  memberCount: number;
  taskCount: number;
  members: CompanyMember[];
}

export interface AdminCompaniesOverview {
  companies: AdminCompany[];
  totalCompanies: number;
  totalUsers: number;
  totalTasks: number;
}
