'use client';

import type { Room } from '@/lib/types';

interface Props {
  room: Room;
  isHost: boolean;
  onToggle: (key: 'show_typing_preview' | 'allow_use_others_chars' | 'free_for_all_mode', value: boolean) => void;
  onPauseToggle: () => void;
}

interface SettingItem {
  key: 'show_typing_preview' | 'allow_use_others_chars' | 'free_for_all_mode';
  label: string;
  desc: string;
}

const SETTINGS: SettingItem[] = [
  {
    key: 'show_typing_preview',
    label: '实时预览',
    desc: '看到其他玩家正在输入的内容',
  },
  {
    key: 'allow_use_others_chars',
    label: '使用他人角色',
    desc: '可使用其他玩家的角色发言/描写',
  },
  {
    key: 'free_for_all_mode',
    label: '自由编辑',
    desc: '取消回合制，所有人可同时发言',
  },
];

export default function RoomSettings({ room, isHost, onToggle, onPauseToggle }: Props) {
  return (
    <div className="p-4 border-t border-gray-100">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">房间设置</h3>

      <div className="space-y-3">
        {SETTINGS.map((s) => {
          const enabled = room[s.key] as boolean;
          return (
            <div key={s.key} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className={`text-sm font-medium ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                  {s.label}
                </p>
                <p className="text-xs text-gray-400 truncate">{s.desc}</p>
              </div>
              <button
                onClick={() => isHost && onToggle(s.key, !enabled)}
                disabled={!isHost}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  enabled ? 'bg-gray-900' : 'bg-gray-200'
                } ${isHost ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                title={!isHost ? '只有房主可以更改设置' : undefined}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* 暂停 / 恢复 */}
      {isHost && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={onPauseToggle}
            className={`w-full text-sm py-2 px-3 rounded border transition-colors ${
              room.status === 'paused'
                ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {room.status === 'paused' ? '▶ 恢复房间' : '⏸ 暂停并保存'}
          </button>
          {room.status === 'paused' && (
            <p className="text-xs text-gray-400 mt-1 text-center">
              房间已暂停，数据已保存，用房间码可随时回来
            </p>
          )}
        </div>
      )}

      {!isHost && (
        <p className="text-xs text-gray-400 mt-3">设置由房主控制</p>
      )}
    </div>
  );
}
