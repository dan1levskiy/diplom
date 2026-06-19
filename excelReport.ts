
import * as XLSX from 'xlsx';
import { Task, TaskPriority, TaskStatus, TeamEmployee } from './types';

export type ReportPeriod = 'week' | 'month' | 'halfYear' | 'year';

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  week: 'За неделю',
  month: 'За месяц',
  halfYear: 'За полгода',
  year: 'За год',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'На проверке',
  [TaskStatus.IN_PROGRESS]: 'В работе',
  [TaskStatus.DONE]: 'Выполнено',
  [TaskStatus.FAILED]: 'Просрочено',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.HIGH]: 'Высокий',
  [TaskPriority.MEDIUM]: 'Средний',
  [TaskPriority.LOW]: 'Низкий',
};

export function getPeriodLabel(period: ReportPeriod): string {
  return PERIOD_LABELS[period];
}

export function getPeriodStart(period: ReportPeriod): Date {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'halfYear':
      start.setMonth(now.getMonth() - 6);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

function parseTaskDate(task: Task): Date | null {
  if (!task.dueDate) return null;
  const dt = new Date(task.dueDate);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function filterTasksByPeriod(tasks: Task[], period: ReportPeriod): Task[] {
  const start = getPeriodStart(period);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return tasks.filter((task) => {
    const dt = parseTaskDate(task);
    if (!dt) return true;
    return dt >= start && dt <= end;
  });
}

function taskToRow(task: Task, index: number, employeeName?: string) {
  return {
    '№': index + 1,
    ...(employeeName ? { 'Сотрудник': employeeName, 'Telegram ID': '' } : {}),
    'ID задачи': task.id,
    'Название': task.title,
    'Описание': task.description,
    'Статус': task.statusRaw || STATUS_LABELS[task.status] || task.status,
    'Приоритет': task.priorityRaw || PRIORITY_LABELS[task.priority] || task.priority,
    'Дедлайн': task.deadlineRaw || task.dueDate || '—',
    'Текст отчёта': task.resultText || '—',
    'Причина доработки': task.refactorReason || '—',
    'Файлов в отчёте': task.reportCount,
    ...(!employeeName && task.assigneeNames ? { 'Исполнители': task.assigneeNames } : {}),
  };
}

function employeeTaskToRow(task: Task, index: number, employee: TeamEmployee) {
  return {
    '№': index + 1,
    'Сотрудник': employee.firstName,
    'Telegram ID': employee.id,
    'ID задачи': task.id,
    'Название': task.title,
    'Описание': task.description,
    'Статус': task.statusRaw || STATUS_LABELS[task.status] || task.status,
    'Приоритет': task.priorityRaw || PRIORITY_LABELS[task.priority] || task.priority,
    'Дедлайн': task.deadlineRaw || task.dueDate || '—',
    'Текст отчёта': task.resultText || '—',
    'Причина доработки': task.refactorReason || '—',
    'Файлов в отчёте': task.reportCount,
  };
}

export function exportTasksToExcel(
  tasks: Task[],
  period: ReportPeriod,
  userName: string,
  userId: number,
  options?: { companyName?: string; isCompanyReport?: boolean }
): void {
  const filtered = filterTasksByPeriod(tasks, period);
  const now = new Date();
  const generatedAt = now.toLocaleString('ru-RU');
  const isCompany = options?.isCompanyReport;

  const summaryRows = [
    ['Отчёт по задачам TaskManager'],
    ['Тип отчёта', isCompany ? 'По всей компании' : 'Личный'],
    ...(options?.companyName ? [['Компания', options.companyName]] : []),
    ['Пользователь', userName],
    ['Telegram ID', userId],
    ['Период', getPeriodLabel(period)],
    ['Сформирован', generatedAt],
    ['Всего задач в отчёте', filtered.length],
    [],
  ];

  const tableRows = filtered.map((task, index) => taskToRow(task, index));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), 'Сводка');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(tableRows), 'Задачи');

  const dateStamp = now.toISOString().slice(0, 10);
  const prefix = isCompany ? 'otchet_kompanii' : 'otchet_zadach';
  XLSX.writeFile(workbook, `${prefix}_${period}_${dateStamp}.xlsx`);
}

export function exportTeamReportToExcel(
  employees: TeamEmployee[],
  period: ReportPeriod,
  companyName: string,
  adminName: string,
  adminId: number
): void {
  const now = new Date();
  const generatedAt = now.toLocaleString('ru-RU');

  const allRows: Record<string, string | number>[] = [];
  const summaryByEmployee: Record<string, string | number>[] = [];

  employees.forEach((emp) => {
    const filtered = filterTasksByPeriod(emp.tasks, period);
    summaryByEmployee.push({
      'Сотрудник': emp.firstName,
      'Telegram ID': emp.id,
      'Роль': emp.roleLabel,
      'Всего задач': filtered.length,
      'Выполнено': filtered.filter((t) => t.status === TaskStatus.DONE).length,
      'В работе / на проверке': filtered.filter(
        (t) => t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.TODO
      ).length,
      'КПД %': emp.stats.efficiency,
    });
    filtered.forEach((task, index) => {
      allRows.push(employeeTaskToRow(task, allRows.length, emp));
    });
  });

  allRows.forEach((row, index) => {
    row['№'] = index + 1;
  });

  const summaryRows = [
    ['Отчёт по сотрудникам TaskManager'],
    ['Компания', companyName],
    ['Сформировал', adminName],
    ['Telegram ID', adminId],
    ['Период', getPeriodLabel(period)],
    ['Дата', generatedAt],
    ['Всего строк задач', allRows.length],
    [],
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), 'Сводка');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryByEmployee), 'По сотрудникам');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(allRows), 'Все задачи');

  const dateStamp = now.toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `otchet_sotrudniki_${period}_${dateStamp}.xlsx`);
}
