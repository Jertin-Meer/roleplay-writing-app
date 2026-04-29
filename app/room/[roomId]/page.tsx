'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { getOrCreatePlayerId, getNickname, saveNickname } from '@/lib/player';
import type { Room, RoomMember, Character, Post, PostType } from '@/lib/types';
import NicknameModal from '@/components/NicknameModal';
import RoomHeader from '@/components/RoomHeader';
import MemberList from '@/components/MemberList';
import CharacterPanel from '@/components/CharacterPanel';
import TurnBanner from '@/components/TurnBanner';
import WritingComposer from '@/components/WritingComposer';
import PostList from '@/components/PostList';
import ArticlePreview from '@/components/ArticlePreview';

type Tab = 'writing' | 'preview' | 'members';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  // Player identity
  const [playerId, setPlayerId] = useState('');
  const [nickname, setNickname] = useState('');
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  // Room data
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [myMember, setMyMember] = useState<RoomMember | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('writing');

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Step 1: on mount, get player identity
  useEffect(() => {
    const pid = getOrCreatePlayerId();
    setPlayerId(pid);
    const nick = getNickname();
    if (nick) {
      setNickname(nick);
    } else {
      setShowNicknameModal(true);
    }
  }, []);

  const handleNicknameSet = (nick: string) => {
    saveNickname(nick);
    setNickname(nick);
    setShowNicknameModal(false);
  };

  // Step 2: once we have playerId + nickname, load room and subscribe
  useEffect(() => {
    if (!playerId || !nickname) return;

    let channel: ReturnType<typeof supabase.channel>;

    const init = async () => {
      setLoading(true);

      // Load room
      const { data: roomData, error: roomErr } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomErr || !roomData) {
        setError('房间不存在或已关闭');
        setLoading(false);
        return;
      }

      setRoom(roomData);

      // Load members
      const { data: membersData } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', roomId)
        .order('turn_order', { ascending: true });

      const existingMembers: RoomMember[] = membersData || [];
      setMembers(existingMembers);

      // Join room (upsert)
      const alreadyIn = existingMembers.find((m) => m.player_id === playerId);
      let me: RoomMember | null = alreadyIn || null;

      if (!alreadyIn) {
        const maxOrder = existingMembers.reduce((max, m) => Math.max(max, m.turn_order), 0);
        const isHost = playerId === roomData.host_player_id;

        const { data: newMember, error: joinErr } = await supabase
          .from('room_members')
          .insert({
            room_id: roomId,
            player_id: playerId,
            nickname,
            turn_order: isHost ? 1 : maxOrder + 1,
            is_host: isHost,
          })
          .select()
          .single();

        if (!joinErr && newMember) {
          me = newMember;
          setMembers((prev) => [...prev, newMember].sort((a, b) => a.turn_order - b.turn_order));
        }
      }

      setMyMember(me);

      // Set initial turn if none
      if (me && !roomData.current_turn_member_id) {
        const allMembers = alreadyIn
          ? existingMembers
          : [...existingMembers, me].sort((a, b) => a.turn_order - b.turn_order);
        const first = allMembers[0];
        if (first) {
          await supabase
            .from('rooms')
            .update({ current_turn_member_id: first.id })
            .eq('id', roomId);
          setRoom((prev) => prev ? { ...prev, current_turn_member_id: first.id } : prev);
        }
      }

      // Load characters
      const { data: charsData } = await supabase
        .from('characters')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      setCharacters(charsData || []);

      // Load posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('room_id', roomId)
        .order('order_index', { ascending: true });

      setPosts(postsData || []);
      setLoading(false);

      // Realtime subscriptions
      channel = supabase
        .channel(`room-${roomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'posts', filter: `room_id=eq.${roomId}` },
          (payload) => {
            setPosts((prev) => {
              if (prev.find((p) => p.id === (payload.new as Post).id)) return prev;
              return [...prev, payload.new as Post].sort((a, b) => a.order_index - b.order_index);
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${roomId}` },
          () => {
            supabase
              .from('room_members')
              .select('*')
              .eq('room_id', roomId)
              .order('turn_order', { ascending: true })
              .then(({ data }) => {
                if (data) {
                  setMembers(data);
                  setMyMember((prev) => (prev ? data.find((m) => m.id === prev.id) ?? prev : prev));
                }
              });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'characters', filter: `room_id=eq.${roomId}` },
          () => {
            supabase
              .from('characters')
              .select('*')
              .eq('room_id', roomId)
              .order('created_at', { ascending: true })
              .then(({ data }) => {
                if (data) setCharacters(data);
              });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
          (payload) => {
            setRoom(payload.new as Room);
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, nickname, roomId]);

  const handlePostSubmit = useCallback(
    async (content: string, postType: PostType, character?: Character) => {
      if (!myMember || !room) return;
      if (room.current_turn_member_id !== myMember.id) return;

      // Get max order_index
      const { data: lastPost } = await supabase
        .from('posts')
        .select('order_index')
        .eq('room_id', roomId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      const nextIndex = lastPost ? lastPost.order_index + 1 : 1;

      const { error: postErr } = await supabase.from('posts').insert({
        room_id: roomId,
        author_member_id: myMember.id,
        author_nickname: myMember.nickname,
        character_id: character?.id ?? null,
        character_name: character?.character_name ?? null,
        post_type: postType,
        content,
        order_index: nextIndex,
      });

      if (postErr) throw postErr;

      // Advance turn
      const sorted = [...members].sort((a, b) => a.turn_order - b.turn_order);
      const idx = sorted.findIndex((m) => m.id === myMember.id);
      const next = sorted[(idx + 1) % sorted.length];

      if (next) {
        await supabase
          .from('rooms')
          .update({ current_turn_member_id: next.id, updated_at: new Date().toISOString() })
          .eq('id', roomId);
      }
    },
    [myMember, room, members, roomId]
  );

  const handleSkipTurn = useCallback(async () => {
    if (!room || !myMember?.is_host) return;
    const sorted = [...members].sort((a, b) => a.turn_order - b.turn_order);
    const idx = sorted.findIndex((m) => m.id === room.current_turn_member_id);
    const next = sorted[(idx + 1) % sorted.length];
    if (next) {
      await supabase
        .from('rooms')
        .update({ current_turn_member_id: next.id, updated_at: new Date().toISOString() })
        .eq('id', roomId);
    }
  }, [room, myMember, members, roomId]);

  const handleResetTurn = useCallback(async () => {
    if (!myMember?.is_host) return;
    const sorted = [...members].sort((a, b) => a.turn_order - b.turn_order);
    if (!sorted[0]) return;
    await supabase
      .from('rooms')
      .update({ current_turn_member_id: sorted[0].id, updated_at: new Date().toISOString() })
      .eq('id', roomId);
  }, [myMember, members, roomId]);

  const handleRenameRoom = useCallback(
    async (newTitle: string) => {
      if (!myMember?.is_host) return;
      await supabase
        .from('rooms')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', roomId);
    },
    [myMember, roomId]
  );

  // ─── Render ───────────────────────────────────

  if (showNicknameModal) {
    return <NicknameModal onSubmit={handleNicknameSet} />;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-800 font-medium">{error || '房间不存在'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-gray-500 underline hover:text-gray-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const currentTurnMember = members.find((m) => m.id === room.current_turn_member_id);
  const isMyTurn = myMember ? room.current_turn_member_id === myMember.id : false;
  const isHost = myMember?.is_host ?? false;
  const myCharacters = characters.filter((c) => c.owner_player_id === playerId);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <RoomHeader room={room} isHost={isHost} onRename={handleRenameRoom} />

      {/* Mobile tabs */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white shrink-0">
        {(['writing', 'preview', 'members'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500'
            }`}
          >
            {tab === 'writing' ? '写作' : tab === 'preview' ? '预览' : '成员'}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar — Members & Characters */}
        <aside
          className={`${
            activeTab === 'members' ? 'flex' : 'hidden'
          } lg:flex flex-col w-full lg:w-64 border-r border-gray-200 bg-white overflow-y-auto shrink-0`}
        >
          <MemberList
            members={members}
            currentTurnMemberId={room.current_turn_member_id}
            myMemberId={myMember?.id}
          />
          <CharacterPanel
            characters={characters}
            roomId={roomId}
            playerId={playerId}
            myMemberId={myMember?.id ?? ''}
          />
          {isHost && (
            <div className="p-4 border-t border-gray-100 space-y-2 mt-auto">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                Host 控制
              </p>
              <button
                onClick={handleSkipTurn}
                className="w-full text-sm py-1.5 px-3 border border-gray-200 text-gray-600 rounded hover:bg-gray-50 transition-colors"
              >
                跳过当前回合
              </button>
              <button
                onClick={handleResetTurn}
                className="w-full text-sm py-1.5 px-3 border border-gray-200 text-gray-600 rounded hover:bg-gray-50 transition-colors"
              >
                重置到第一位
              </button>
            </div>
          )}
        </aside>

        {/* Center — Posts + Composer */}
        <div
          className={`${
            activeTab === 'writing' ? 'flex' : 'hidden'
          } lg:flex flex-col flex-1 overflow-hidden`}
        >
          <TurnBanner isMyTurn={isMyTurn} currentTurnMember={currentTurnMember} />
          <PostList posts={posts} />
          <WritingComposer
            isMyTurn={isMyTurn}
            myCharacters={myCharacters}
            onSubmit={handlePostSubmit}
          />
        </div>

        {/* Right sidebar — Article Preview */}
        <aside
          className={`${
            activeTab === 'preview' ? 'flex' : 'hidden'
          } lg:flex flex-col w-full lg:w-80 border-l border-gray-200 bg-white overflow-hidden shrink-0`}
        >
          <ArticlePreview posts={posts} />
        </aside>
      </div>
    </div>
  );
}
