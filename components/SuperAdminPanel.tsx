
import React, { useState } from 'react';
import { AdminCompaniesOverview, AdminCompany } from '../types';

interface SuperAdminPanelProps {
  overview: AdminCompaniesOverview;
  onDeleteCompany: (companyId: number) => Promise<void>;
}

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-indigo-100 text-indigo-700',
  deputy: 'bg-violet-100 text-violet-700',
  teacher: 'bg-slate-100 text-slate-600',
};

function CompanyCard({
  company,
  onDelete,
  deleting,
}: {
  company: AdminCompany;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shrink-0">
          {company.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-lg">{company.name}</h4>
          <p className="text-sm text-slate-500 mt-0.5">
            Код: <span className="font-mono font-semibold text-slate-700">{company.code}</span>
            {' · '}
            Руководитель: <span className="font-semibold text-slate-700">{company.adminName}</span>
          </p>
        </div>
        <div className="flex gap-4 sm:gap-6 text-center shrink-0">
          <div>
            <p className="text-lg font-black text-indigo-600">{company.memberCount}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Участников</p>
          </div>
          <div>
            <p className="text-lg font-black text-amber-600">{company.employeeCount}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Сотрудников</p>
          </div>
          <div>
            <p className="text-lg font-black text-emerald-600">{company.taskCount}</p>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Задач</p>
          </div>
        </div>
        <span className="text-slate-400 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Все участники компании
          </p>
          {company.members.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Участников нет</p>
          ) : (
            <div className="space-y-2 mb-5">
              {company.members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      {member.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{member.firstName}</p>
                      <p className="text-xs text-slate-400">ID: {member.id}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      ROLE_BADGE[member.role] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {member.roleLabel}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
            <p className="text-sm font-semibold text-rose-900">Удалить компанию</p>
            <p className="text-xs text-rose-700 mt-1">
              Будут удалены все пользователи, задачи и файлы компании. Действие необратимо.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? 'Удаляем...' : confirmDelete ? 'Подтвердить удаление' : 'Удалить компанию'}
              </button>
              {confirmDelete && !deleting && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Отмена
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ overview, onDeleteCompany }) => {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = overview.companies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.adminName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (companyId: number) => {
    setDeletingId(companyId);
    try {
      await onDeleteCompany(companyId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Компаний</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{overview.totalCompanies}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Пользователей</p>
          <p className="text-3xl font-black text-indigo-600 mt-1">{overview.totalUsers}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Задач</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{overview.totalTasks}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800">Компании системы</h3>
        <p className="text-sm text-slate-500 mt-1">
          Все организации, зарегистрированные в боте. Можно удалить компанию при отказе от сервиса.
        </p>
        <input
          type="text"
          placeholder="Поиск по названию, коду или руководителю..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-12">Компании не найдены</p>
      ) : (
        filtered.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            deleting={deletingId === company.id}
            onDelete={() => handleDelete(company.id)}
          />
        ))
      )}
    </div>
  );
};

export default SuperAdminPanel;
