'use client';

import { useState } from 'react';
import type { Room } from '@/lib/types';

interface Props {
  room: Room;
  isHost: boolean;
  onRename: (title: string) => void;
}

export default function RoomHeader({ room, isHost, onRename }: Props) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(room.title);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/room/${room.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRename = () => {
    if (title.trim() && title.trim() !== room.title) {
      onRename(title.trim());
    }
    setEditing(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {editing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
            className="text-lg font-semibold border-b border-gray-400 focus:outline-none bg-transparent text-gray-900"
          />
        ) : (
          <h1
            className={`text-lg font-semibold text-gray-900 truncate ${isHost ? 'cursor-pointer hover:text-gray-600' : ''}`}
            title={isHost ? '点击重命名' : undefined}
            onClick={() => isHost && setEditing(true)}
          >
            {room.title}
          </h1>
        )}
        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded shrink-0 select-all">
          {room.room_code}
        </span>
      </div>

      <button
        onClick={handleCopyLink}
        className="text-sm px-3 py-1.5 border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition-colors shrink-0"
      >
        {copied ? '✓ 已复制' : '复制邀请链接'}
      </button>
    </header>
  );
}
