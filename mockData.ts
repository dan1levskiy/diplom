
import { Task, TaskStatus, TaskPriority, TelegramUser, UserStats } from './types';

export const MOCK_USER: TelegramUser = {
  id: 160906,
  username: 'venya',
  firstName: 'Вениамин',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256'
};

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Ревью кода фронтенда дашборда',
    description: 'Проверить адаптивную верстку сайдбара, интеграцию Recharts графиков и обработку токенов Telegram.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    dueDate: '2026-05-22',
    createdAt: '2026-05-18',
    reportCount: 3
  },
  {
    id: '2',
    title: 'Настройка вебхуков для @tasksmgu_bot',
    description: 'Интеграция бота на платформу Amvera, деплой Node.js вебхука для мгновенной синхронизации логов.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    dueDate: '2026-05-24',
    createdAt: '2026-05-20',
    reportCount: 1
  },
  {
    id: '3',
    title: 'Подготовка отчета по практике',
    description: 'Описать архитектуру базы данных PostgreSQL, схемы связей таблиц пользователей и сессий задач.',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: '2026-05-28',
    createdAt: '2026-05-21',
    reportCount: 0
  },
  {
    id: '4',
    title: 'Оптимизация SQL-запросов и индексов',
    description: 'Добавить составные индексы для полей user_id и status во избежание просадок при росте базы.',
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    dueDate: '2026-06-02',
    createdAt: '2026-05-21',
    reportCount: 0
  },
  {
    id: '5',
    title: 'Исправление утечки памяти в сессиях',
    description: 'Пользователи сообщали, что при долгом простое сессия разлогинивается. Исправлено добавлением keep-alive пингов.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    dueDate: '2026-05-19',
    createdAt: '2026-05-17',
    reportCount: 4
  }
];

export const MOCK_STATS: UserStats = {
  completed: 24,
  pending: 3,
  failed: 0,
  efficiency: 94,
  weeklyProgress: [
    { day: 'Пн', tasks: 3 },
    { day: 'Вт', tasks: 5 },
    { day: 'Ср', tasks: 6 },
    { day: 'Чт', tasks: 4 },
    { day: 'Пт', tasks: 5 },
    { day: 'Сб', tasks: 2 },
    { day: 'Вс', tasks: 1 },
  ]
};
