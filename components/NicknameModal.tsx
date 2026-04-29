'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (nickname: string) => void;
}

export default function NicknameModal({ onSubmit }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">设置你的昵称</h2>
        <p className="text-sm text-gray-500 mb-4">昵称会显示给房间里的其他人</p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="你的昵称"
          maxLength={20}
          autoFocus
          className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 mb-4 text-gray-900"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="w-full py-2 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          确认
        </button>
      </div>
    </div>
  );
}
