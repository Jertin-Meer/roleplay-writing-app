'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Character } from '@/lib/types';

interface Props {
  characters: Character[];
  roomId: string;
  playerId: string;
  myMemberId: string;
}

export default function CharacterPanel({ characters, roomId, playerId, myMemberId }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError('');

    const { error: err } = await supabase.from('characters').insert({
      room_id: roomId,
      owner_player_id: playerId,
      owner_member_id: myMemberId,
      character_name: name.trim(),
      short_description: desc.trim() || null,
    });

    if (err) {
      setError('创建失败，请重试');
    } else {
      setName('');
      setDesc('');
      setShowForm(false);
    }
    setCreating(false);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">角色</h3>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          {showForm ? '取消' : '+ 新建'}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 space-y-2 p-3 bg-gray-50 rounded-md">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="角色名 *"
            maxLength={30}
            className="w-full text-sm py-1.5 px-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
          />
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="简介（可选）"
            maxLength={100}
            className="w-full text-sm py-1.5 px-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="w-full text-sm py-1.5 bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            {creating ? '创建中...' : '创建角色'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {characters.length === 0 ? (
          <p className="text-xs text-gray-400">还没有角色，点击「+ 新建」创建</p>
        ) : (
          characters.map((char) => (
            <div key={char.id} className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0 uppercase">
                {char.character_name[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {char.character_name}
                  </span>
                  {char.owner_player_id === playerId && (
                    <span className="text-xs text-gray-400 shrink-0">你</span>
                  )}
                </div>
                {char.short_description && (
                  <p className="text-xs text-gray-400 truncate">{char.short_description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
