import React, { useCallback, useEffect, useState } from 'react';
import { Task, UserStats, TelegramUser, TaskStatus, TaskPriority, TeamOverview, AdminCompaniesOverview } from './types';
import { fetchTasks, fetchStats, fetchTeam, assignDeputy, removeDeputy, fetchAdminCompanies, deleteCompany } from './apiService';
import { exportTasksToExcel, exportTeamReportToExcel, getPeriodLabel, ReportPeriod } from './excelReport';
import StatCard from './components/StatCard';
import Charts from './components/Charts';
import TaskList from './components/TaskList';
import EmployeesPanel from './components/EmployeesPanel';
import SuperAdminPanel from './components/SuperAdminPanel';
import TaskAttachments from './components/TaskAttachments';
import Login from './components/Login';

const STORAGE_USER_KEY = 'tg_user';

type TabId = 'dashboard' | 'tasks' | 'employees' | 'companies' | 'reports';

const App: React.FC = () => {
  const [user, setUser] = useState<TelegramUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [team, setTeam] = useState<TeamOverview | null>(null);
  const [adminOverview, setAdminOverview] = useState<AdminCompaniesOverview | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [loading, setLoading] = useState(false);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('month');

  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdmin = Boolean(user?.isAdmin);
  const isSuperAdmin = Boolean(user?.isSuperAdmin ?? user?.role === 'super');
  const canViewTeam = Boolean(user?.canViewTeam ?? user?.isAdmin ?? user?.role === 'deputy');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async (loggedUser: TelegramUser) => {
    setLoading(true);
    try {
      const requests: Promise<void>[] = [
        fetchTasks(loggedUser.id).then(setTasks),
        fetchStats(loggedUser.id).then(setStats),
      ];

      const viewTeam =
        loggedUser.canViewTeam ?? loggedUser.isAdmin ?? loggedUser.role === 'deputy';

      if (viewTeam) {
        requests.push(fetchTeam(loggedUser.id).then(setTeam));
      } else {
        setTeam(null);
      }

      const superAdmin = loggedUser.isSuperAdmin ?? loggedUser.role === 'super';
      if (superAdmin) {
        requests.push(fetchAdminCompanies(loggedUser.id).then(setAdminOverview));
      } else {
        setAdminOverview(null);
      }

      await Promise.all(requests);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData(user);
    }
  }, [user, loadData]);

  const handleLogin = (loggedUser: TelegramUser) => {
    setUser(loggedUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    setStats(null);
    setTeam(null);
    setAdminOverview(null);
    localStorage.removeItem(STORAGE_USER_KEY);
  };

  const handleRefresh = () => {
    if (user) loadData(user);
  };

  const handleExportExcel = () => {
    if (!user) return;

    if (canViewTeam && team) {
      exportTeamReportToExcel(
        team.employees,
        reportPeriod,
        team.companyName,
        user.firstName,
        user.id
      );
      showToast(`Excel по всем сотрудникам (${getPeriodLabel(reportPeriod)})`);
      return;
    }

    exportTasksToExcel(tasks, reportPeriod, user.firstName, user.id, {
      companyName: user.companyName,
    });
    showToast(`Excel-отчёт (${getPeriodLabel(reportPeriod)}) скачан`);
  };

  const handleAssignDeputy = async (targetId: number) => {
    if (!user) return;
    try {
      const result = await assignDeputy(user.id, targetId);
      showToast(result.message);
      await loadData(user);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Не удалось назначить зама');
    }
  };

  const handleRemoveDeputy = async () => {
    if (!user) return;
    try {
      const result = await removeDeputy(user.id);
      showToast(result.message);
      await loadData(user);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Не удалось снять зама');
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (!user) return;
    try {
      const result = await deleteCompany(user.id, companyId);
      showToast(result.message);
      await loadData(user);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Не удалось удалить компанию');
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const dynamicStats: UserStats = stats || {
    completed: 0,
    pending: 0,
    failed: 0,
    efficiency: 100,
    weeklyProgress: [],
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      task.description.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (task.assigneeNames || '').toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const reportPeriods: { id: ReportPeriod; label: string }[] = [
    { id: 'week', label: 'Неделя' },
    { id: 'month', label: 'Месяц' },
    { id: 'halfYear', label: 'Полгода' },
    { id: 'year', label: 'Год' },
  ];

  const tabs: { id: TabId; label: string; adminOnly?: boolean; badge?: number }[] = [
    { id: 'dashboard', label: 'Дашборд' },
    ...(isSuperAdmin
      ? [{ id: 'companies' as TabId, label: 'Компании', badge: adminOverview?.totalCompanies }]
      : []),
    {
      id: 'tasks',
      label: isSuperAdmin ? 'Все задачи' : canViewTeam ? 'Задачи компании' : 'Мои задачи',
      badge: tasks.length,
    },
    ...(canViewTeam ? [{ id: 'employees' as TabId, label: 'Сотрудники', badge: team?.totalEmployees }] : []),
    { id: 'reports', label: 'Отчёты' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <aside className="w-full md:w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col sticky top-0 md:h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">T</div>
          <div>
            <span className="text-xl font-bold tracking-tight block">TaskManager</span>
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
              {user.roleLabel || 'Пользователь'}
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="font-semibold">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-auto bg-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full text-indigo-400">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-850 rounded-2xl border border-slate-800">
            <img src={user.photoUrl} alt="User" className="w-10 h-10 rounded-full border-2 border-indigo-500" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.firstName}</p>
              <p className="text-xs text-slate-400 truncate">{user.companyName || `ID: ${user.id}`}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800" title="Выйти">
              ✕
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
              <div>
                {user.companyName && (
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {user.companyName}
                  </span>
                )}
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">Привет, {user.firstName.split(' ')[0]}!</h1>
                <p className="text-slate-500 mt-0.5">
                  {isSuperAdmin
                    ? 'Управление всеми компаниями и задачами'
                    : canViewTeam
                      ? 'Управление задачами и командой'
                      : 'Ваши задачи'}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-all shadow-sm"
              >
                Обновить данные
              </button>
            </header>

            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Завершено" value={dynamicStats.completed} subtext="Задач" color="bg-emerald-500" icon={<span>✓</span>} />
                  <StatCard label="В работе" value={dynamicStats.pending} subtext="Активных" color="bg-amber-500" icon={<span>⏳</span>} />
                  <StatCard label="КПД" value={`${dynamicStats.efficiency}%`} subtext="Эффективность" color="bg-indigo-500" icon={<span>↑</span>} />
                  <StatCard
                    label={isSuperAdmin ? 'Компаний' : canViewTeam ? 'Сотрудников' : 'Всего задач'}
                    value={isSuperAdmin ? (adminOverview?.totalCompanies ?? 0) : canViewTeam ? (team?.totalEmployees ?? 0) : tasks.length}
                    subtext={isSuperAdmin ? 'В системе' : canViewTeam ? 'В команде' : 'Назначено'}
                    color="bg-rose-500"
                    icon={<span>#</span>}
                  />
                </div>
                <div className="space-y-8">
                  <TaskList tasks={tasks.slice(0, 4)} userId={user.id} onStatusChange={() => showToast('Статус меняется в Telegram-боте')} />
                  <Charts stats={dynamicStats} variant="full" />
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder={canViewTeam ? 'Поиск по задаче или исполнителю...' : 'Поиск...'}
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="w-full md:w-96 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold">
                    <option value="all">Все статусы</option>
                    <option value={TaskStatus.TODO}>На проверке</option>
                    <option value={TaskStatus.IN_PROGRESS}>В работе</option>
                    <option value={TaskStatus.DONE}>Выполнено</option>
                  </select>
                  <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold">
                    <option value="all">Все приоритеты</option>
                    <option value={TaskPriority.HIGH}>Высокий</option>
                    <option value={TaskPriority.MEDIUM}>Средний</option>
                    <option value={TaskPriority.LOW}>Низкий</option>
                  </select>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100">
                  {filteredTasks.length === 0 ? (
                    <p className="p-12 text-center text-slate-400">Задач не найдено.</p>
                  ) : (
                    filteredTasks.map((task) => (
                      <div key={task.id} className="p-6">
                        <h4 className="font-bold text-slate-900">{task.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">{task.description}</p>
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
                          {canViewTeam && task.assigneeNames && (
                            <span className="text-indigo-600 font-semibold">Исполнители: {task.assigneeNames}</span>
                          )}
                          <span>Дедлайн: {task.deadlineRaw || task.dueDate || '—'}</span>
                          <span>Статус: {task.statusRaw || task.status}</span>
                          <span>Отчётов: {task.reportCount}</span>
                        </div>
                        {task.resultText && (
                          <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2">Отчёт: {task.resultText}</p>
                        )}
                        <TaskAttachments attachments={task.attachments} userId={user.id} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'companies' && isSuperAdmin && adminOverview && (
              <SuperAdminPanel overview={adminOverview} onDeleteCompany={handleDeleteCompany} />
            )}

            {activeTab === 'employees' && canViewTeam && team && (
              <EmployeesPanel
                employees={team.employees}
                companyName={isSuperAdmin ? 'Все компании' : team.companyName}
                userId={user.id}
                showCompany={isSuperAdmin}
                isAdmin={isAdmin && !isSuperAdmin}
                onAssignDeputy={isAdmin && !isSuperAdmin ? handleAssignDeputy : undefined}
                onRemoveDeputy={isAdmin && !isSuperAdmin ? handleRemoveDeputy : undefined}
              />
            )}

            {activeTab === 'reports' && (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Экспорт отчёта в Excel</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    {canViewTeam
                      ? 'Сводный отчёт по всем сотрудникам за выбранный период.'
                      : 'Ваш отчёт по задачам за выбранный период.'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {reportPeriods.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setReportPeriod(p.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                          reportPeriod === p.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleExportExcel}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-md flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {canViewTeam
                      ? `Excel по всем сотрудникам (${getPeriodLabel(reportPeriod)})`
                      : `Сформировать Excel (${getPeriodLabel(reportPeriod)})`}
                  </button>

                  {canViewTeam && team && (
                    <p className="text-xs text-slate-400 mt-4">
                      Файл содержит сводку, статистику по сотрудникам и список всех задач.
                    </p>
                  )}
                </div>

                <Charts stats={dynamicStats} variant="full" />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
