
import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import TaskAttachments from './TaskAttachments';

interface TaskListProps {
  tasks: Task[];
  userId: number;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH: return 'text-red-600 bg-red-50';
    case TaskPriority.MEDIUM: return 'text-amber-600 bg-amber-50';
    case TaskPriority.LOW: return 'text-emerald-600 bg-emerald-50';
    default: return 'text-slate-600 bg-slate-50';
  }
};

const getStatusBadge = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.DONE: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Готово</span>;
    case TaskStatus.IN_PROGRESS: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">В работе</span>;
    case TaskStatus.FAILED: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Просрочено</span>;
    default: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">В ожидании</span>;
  }
};

const TaskList: React.FC<TaskListProps> = ({ tasks, userId, onStatusChange }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Последние задачи</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => (
          <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-slate-900">{task.title}</h4>
                  {getStatusBadge(task.status)}
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                  <div className={`px-2 py-0.5 rounded-md ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {task.dueDate}
                  </div>
                </div>
                <TaskAttachments attachments={task.attachments} userId={userId} compact />
              </div>
              
              <div className="flex flex-col gap-2">
                {task.status !== TaskStatus.DONE && (
                  <button 
                    onClick={() => onStatusChange?.(task.id, TaskStatus.DONE)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-green-600 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-100"
                    title="Отметить как выполнено"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
