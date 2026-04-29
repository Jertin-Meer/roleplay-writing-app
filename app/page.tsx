'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { generateRoomCode } from '@/lib/room';
import { getOrCreatePlayerId, getNickname, saveNickname } from '@/lib/player';
import NicknameModal from '@/components/NicknameModal';

export default function Home() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<'create' | 'join' | null>(null);

  useEffect(() => {
    const saved = getNickname();
    if (saved) setNickname(saved);
  }, []);

  const handleNicknameSet = (nick: string) => {
    saveNickname(nick);
    setNickname(nick);
    setShowNicknameModal(false);
    if (pendingAction === 'create') createRoom(nick);
    if (pendingAction === 'join') joinRoom(nick);
    setPendingAction(null);
  };

  const requireNickname = (action: 'create' | 'join'): boolean => {
    if (!nickname) {
      setPendingAction(action);
      setShowNicknameModal(true);
      return false;
    }
    return true;
  };

  const createRoom = async (nick?: string) => {
    const currentNick = nick || nickname;
    setLoading(true);
    setError('');

    try {
      const playerId = getOrCreatePlayerId();
      const roomCode = generateRoomCode();

      const { data: room, error: err } = await supabase
        .from('rooms')
        .insert({
          title: `${currentNick} 的房间`,
          room_code: roomCode,
          host_player_id: playerId,
        })
        .select()
        .single();

      if (err) throw err;
      router.push(`/room/${room.id}`);
    } catch {
      setError('创建房间失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (nick?: string) => {
    if (!joinCode.trim()) {
      setError('请输入房间码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: room, error: err } = await supabase
        .from('rooms')
        .select('id')
        .eq('room_code', joinCode.trim().toUpperCase())
        .single();

      if (err || !room) {
        setError('找不到该房间，请检查房间码');
        return;
      }

      router.push(`/room/${room.id}`);
    } catch {
      setError('加入房间失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    if (!requireNickname('create')) return;
    createRoom();
  };

  const handleJoin = () => {
    if (!requireNickname('join')) return;
    joinRoom();
  };

  return (
    <>
      {showNicknameModal && <NicknameModal onSubmit={handleNicknameSet} />}

      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Roleplay Writing Room</h1>
            <p className="mt-2 text-gray-500 text-sm">多人回合制语 C 写作工具</p>
            {nickname && (
              <p className="mt-3 text-sm text-gray-400">
                你好，<span className="font-medium text-gray-600">{nickname}</span>
                <button
                  onClick={() => setShowNicknameModal(true)}
                  className="ml-2 text-xs underline hover:text-gray-600"
                >
                  修改
                </button>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading && !showJoinInput ? '创建中...' : 'Create Room'}
            </button>

            {!showJoinInput ? (
              <button
                onClick={() => setShowJoinInput(true)}
                className="w-full py-3 px-4 bg-white text-gray-900 font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Join Room
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="输入 6 位房间码"
                  maxLength={6}
                  autoFocus
                  className="w-full py-3 px-4 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 font-mono text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleJoin}
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? '加入中...' : '加入'}
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinInput(false);
                      setJoinCode('');
                      setError('');
                    }}
                    className="py-2 px-4 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </div>
      </main>
    </>
  );
}
