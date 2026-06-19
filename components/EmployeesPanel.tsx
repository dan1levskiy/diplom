
import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus, TeamEmployee } from '../types';
import TaskAttachments from './TaskAttachments';

const STATUS_UI: Record<string, { label: string; className: string }> = {
  [TaskStatus.DONE]: { label: 'Выполнено', className: 'bg-emerald-100 text-emerald-800' },
  [TaskStatus.IN_PROGRESS]: { label: 'В работе', className: 'bg-blue-100 text-blue-800' },
  [TaskStatus.TODO]: { label: 'На проверке', className: 'bg-amber-100 text-amber-800' },
  [TaskStatus.FAILED]: { label: 'Просрочено', className: 'bg-rose-100 text-rose-800' },
};

const PRIORITY_UI: Record<TaskPriority, string> = {
  [TaskPriority.HIGH]: 'Высокий',
  [TaskPriority.MEDIUM]: 'Средний',
  [TaskPriority.LOW]: 'Низкий',
};

function TaskCard({ task, userId }: { task: Task; userId: number }) {
  const status = STATUS_UI[task.status] || { label: task.statusRaw || task.status, className: 'bg-slate-100 text-slate-700' };

  return (
    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/80">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <h5 className="font-bold text-slate-900">{task.title}</h5>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${status.className}`}>
          {task.statusRaw || status.label}
        </span>
      </div>
      {task.description && <p className="text-sm text-slate-600 mb-3">{task.description}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>Приоритет: <b className="text-slate-700">{task.priorityRaw || PRIORITY_UI[task.priority]}</b></span>
        <span>Дедлайн: <b className="text-slate-700">{task.deadlineRaw || task.dueDate || '—'}</b></span>
        <span>Отчётов: <b className="text-slate-700">{task.reportCount}</b></span>
      </div>
      {task.resultText && (
        <p className="mt-3 text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-600">
          <span className="font-bold text-slate-800">Отчёт: </span>{task.resultText}
        </p>
      )}
      {task.refactorReason && (
        <p className="mt-2 text-xs bg-amber-50 border border-amber-100 rounded-lg p-2 text-amber-800">
          <span className="font-bold">Доработка: </span>{task.refactorReason}
        </p>
      )}
      <TaskAttachments attachments={task.attachments} userId={userId} />
    </div>
  );
}

interface EmployeesPanelProps {
  employees: TeamEmployee[];
  companyName: string;
  userId: number;
  isAdmin?: boolean;
  showCompany?: boolean;
  onAssignDeputy?: (employeeId: number) => Promise<void>;
  onRemoveDeputy?: () => Promise<void>;
}

const EmployeesPanel: React.FC<EmployeesPanelProps> = ({
  employees,
  companyName,
  userId,
  isAdmin,
  showCompany,
  onAssignDeputy,
  onRemoveDeputy,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(
    employees.length === 1 ? employees[0].id : null
  );
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const deputy = employees.find((e) => e.role === 'deputy');
  const filtered = employees.filter((emp) =>
    emp.firstName.toLowerCase().includes(search.toLowerCase()) ||
    String(emp.id).includes(search)
  );

  const handleAssign = async (e: React.MouseEvent, employeeId: number) => {
    e.stopPropagation();
    if (!onAssignDeputy) return;
    setActionId(employeeId);
    try {
      await onAssignDeputy(employeeId);
    } finally {
      setActionId(null);
    }
  };

  const handleRemove = async () => {
    if (!onRemoveDeputy) return;
    setActionId(-1);
    try {
      await onRemoveDeputy();
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800">Сотрудники</h3>
        <p className="text-sm text-slate-500 mt-1">
          {companyName || 'Компания'} · {employees.length} {employees.length === 1 ? 'человек' : 'человека'}
        </p>

        {isAdmin && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
            <p className="text-sm font-semibold text-indigo-900">Заместитель</p>
            <p className="text-xs text-indigo-700 mt-1">
              Зам видит статистику сотрудников на сайте и может получать задачи в боте.
            </p>
            {deputy ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-800">
                  Сейчас: <b>{deputy.firstName}</b>
                </span>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={actionId === -1}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  {actionId === -1 ? '...' : 'Снять зама'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-600 mt-2">Не назначен — выберите сотрудника ниже.</p>
            )}
          </div>
        )}

        <input
          type="text"
          placeholder="Поиск по имени или ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-12">Сотрудники не найдены</p>
      ) : (
        filtered.map((emp) => {
          const isOpen = expandedId === emp.id;
          const isDeputy = emp.role === 'deputy';
          return (
            <div key={emp.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : emp.id)}
                className="w-full p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                  isDeputy ? 'bg-violet-100 text-violet-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {emp.firstName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900">{emp.firstName}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isDeputy ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {emp.roleLabel}
                    </span>
                    {showCompany && emp.companyName && (
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {emp.companyName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 sm:gap-6 text-center shrink-0">
                  <div>
                    <p className="text-lg font-black text-emerald-600">{emp.stats.completed}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Готово</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-amber-600">{emp.stats.pending}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Активно</p>
                  </div>
                  <div>
                    <p className="text-lg font-black text-indigo-600">{emp.tasks.length}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Всего</p>
                  </div>
                </div>
                <span className="text-slate-400 text-sm">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isAdmin && emp.role === 'teacher' && onAssignDeputy && (
                <div className="px-5 pb-3 border-b border-slate-50">
                  <button
                    type="button"
                    onClick={(e) => handleAssign(e, emp.id)}
                    disabled={actionId === emp.id}
                    className="text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {actionId === emp.id ? 'Назначаем...' : '👔 Назначить замом'}
                  </button>
                </div>
              )}

              {isOpen && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3">
                  {emp.tasks.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">Задач пока нет</p>
                  ) : (
                    emp.tasks.map((task) => <TaskCard key={task.id} task={task} userId={userId} />)
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default EmployeesPanel;
