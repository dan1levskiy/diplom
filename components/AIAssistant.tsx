
import React, { useState, useEffect } from 'react';
import { getAIInsight } from '../geminiService';
import { Task } from '../types';

interface AIAssistantProps {
  tasks: Task[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ tasks }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      const res = await getAIInsight(tasks);
      setInsight(res || '');
      setLoading(false);
    };
    fetchInsight();
  }, [tasks]);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg mb-8">
      <div className="flex items-center mb-4">
        <div className="bg-white/20 p-2 rounded-lg mr-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold">Советы от ИИ Коуча</h3>
      </div>
      
      {loading ? (
        <div className="flex items-center space-x-2 animate-pulse">
          <div className="h-4 bg-white/30 rounded w-3/4"></div>
          <div className="h-4 bg-white/30 rounded w-1/4"></div>
        </div>
      ) : (
        <div className="whitespace-pre-wrap text-indigo-50 leading-relaxed font-medium">
          {insight}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
