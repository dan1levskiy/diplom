
import React, { useEffect, useState } from 'react';
import { TelegramUser } from '../types';
import { checkApiHealth, loginByTelegramId } from '../apiService';

interface LoginProps {
  onLogin: (user: TelegramUser) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [tgId, setTgId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const botUsername = 'tasksmgu_bot';

  useEffect(() => {
    checkApiHealth().catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await loginByTelegramId(tgId);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
              <span className="text-2xl font-black">T</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">TaskManager</h1>
            <p className="text-slate-400 text-sm mt-1">Личный кабинет</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
            <p className="text-xs text-slate-600 leading-relaxed">
              Введите свой Telegram ID. Узнать его можно через @userinfobot или в боте{' '}
              <a href={`https://t.me/${botUsername}`} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 underline">
                @{botUsername}
              </a>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Telegram ID</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Например: 498139848"
                value={tgId}
                onChange={(e) => setTgId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {error && <p className="text-[11px] text-red-500 font-medium text-center">{error}</p>}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Войти'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
