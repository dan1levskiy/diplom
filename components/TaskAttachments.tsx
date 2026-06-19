
import React from 'react';
import { TaskAttachment } from '../types';
import { getAttachmentUrl } from '../apiService';

interface TaskAttachmentsProps {
  attachments?: TaskAttachment[];
  userId: number;
  compact?: boolean;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ attachments, userId, compact }) => {
  if (!attachments?.length) return null;

  const taskFiles = attachments.filter((a) => !a.isResult);
  const reportFiles = attachments.filter((a) => a.isResult);

  const renderGroup = (title: string, files: TaskAttachment[]) => {
    if (!files.length) return null;

    const images = files.filter((f) => f.type === 'img');
    const docs = files.filter((f) => f.type === 'doc');

    return (
      <div className={compact ? 'mt-2' : 'mt-3'}>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
        {images.length > 0 && (
          <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mb-2'}`}>
            {images.map((file) => (
              <a
                key={file.fileId}
                href={getAttachmentUrl(file.fileId, userId)}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:border-indigo-300 transition-colors"
              >
                <img
                  src={getAttachmentUrl(file.fileId, userId)}
                  alt="Вложение"
                  className={compact ? 'w-20 h-20 object-cover' : 'max-w-[220px] max-h-[160px] object-cover'}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        )}
        {docs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {docs.map((file) => (
              <a
                key={file.fileId}
                href={getAttachmentUrl(file.fileId, userId)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-300"
              >
                <span>📎</span>
                <span>Документ</span>
              </a>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={compact ? '' : 'pt-1'}>
      {renderGroup('Вложения к задаче', taskFiles)}
      {renderGroup('Файлы отчёта', reportFiles)}
    </div>
  );
};

export default TaskAttachments;
