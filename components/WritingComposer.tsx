'use client';

import { useState } from 'react';
import type { Character, PostType } from '@/lib/types';

interface Props {
  isMyTurn: boolean;
  isFreeForAll: boolean;
  availableCharacters: Character[];
  myPlayerId: string;
  onSubmit: (content: string, postType: PostType, character?: Character) => Promise<void>;
  onEndTurn: () => Promise<void>;
  onTypingChange: (content: string, postType: PostType, characterName?: string) => void;
}

const POST_TYPES: { type: PostType; label: string }[] = [
  { type: 'narration', label: '旁白' },
  { type: 'dialogue', label: '对话' },
  { type: 'action', label: '动作' },
  { type: 'system', label: '备注' },
];

export default function WritingComposer({
  isMyTurn,
  isFreeForAll,
  availableCharacters,
  myPlayerId,
  onSubmit,
  onEndTurn,
  onTypingChange,
}: Props) {
  const [postType, setPostType] = useState<PostType>('narration');
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [endingTurn, setEndingTurn] = useState(false);
  const [error, setError] = useState('');

  const canWrite = isFreeForAll || isMyTurn;
  const needsCharacter = postType === 'dialogue' || postType === 'action';
  const selectedCharacter = availableCharacters.find((c) => c.id === selectedCharacterId);

  const broadcast = (text: string, type: PostType, charName?: string) => {
    if (canWrite) onTypingChange(text, type, charName);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    broadcast(value, postType, needsCharacter ? selectedCharacter?.character_name : undefined);
  };

  const handleTypeChange = (type: PostType) => {
    setPostType(type);
    setError('');
    const charName = (type === 'dialogue' || type === 'action') ? selectedCharacter?.character_name : undefined;
    broadcast(content, type, charName);
  };

  const handleCharChange = (id: string) => {
    setSelectedCharacterId(id);
    const char = availableCharacters.find((c) => c.id === id);
    broadcast(content, postType, char?.character_name);
  };

  const handleSubmit = async () => {
    if (!canWrite) return;
    if (!content.trim()) { setError('内容不能为空'); return; }
    if (needsCharacter && availableCharacters.length === 0) { setError('请先在左侧创建一个角色'); return; }
    if (needsCharacter && !selectedCharacterId) { setError('请先选择一个角色'); return; }

    setError('');
    setSubmitting(true);
    try {
      await onSubmit(content.trim(), postType, selectedCharacter);
      setContent('');
      onTypingChange('', postType);
    } catch {
      setError('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndTurn = async () => {
    setEndingTurn(true);
    onTypingChange('', postType);
    try {
      await onEndTurn();
      setContent('');
      setPostType('narration');
      setSelectedCharacterId('');
    } finally {
      setEndingTurn(false);
    }
  };

  // 区分自己的角色和他人角色
  const myChars = availableCharacters.filter((c) => c.owner_player_id === myPlayerId);
  const othersChars = availableCharacters.filter((c) => c.owner_player_id !== myPlayerId);

  return (
    <div className="border-t border-gray-200 bg-white p-4 space-y-3 shrink-0">
      {/* 类型选择 */}
      <div className="flex gap-2 flex-wrap">
        {POST_TYPES.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            disabled={!canWrite}
            className={`px-3 py-1 text-sm rounded border transition-colors ${
              postType === type
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 角色选择 */}
      {needsCharacter && (
        availableCharacters.length === 0 ? (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
            请先在左侧角色面板创建一个角色
          </p>
        ) : (
          <select
            value={selectedCharacterId}
            onChange={(e) => handleCharChange(e.target.value)}
            disabled={!canWrite}
            className="w-full py-1.5 px-2 text-sm border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-40"
          >
            <option value="">选择角色...</option>
            {myChars.length > 0 && (
              <optgroup label="我的角色">
                {myChars.map((c) => <option key={c.id} value={c.id}>{c.character_name}</option>)}
              </optgroup>
            )}
            {othersChars.length > 0 && (
              <optgroup label="其他人的角色">
                {othersChars.map((c) => <option key={c.id} value={c.id}>{c.character_name}</option>)}
              </optgroup>
            )}
          </select>
        )
      )}

      {/* 输入框 */}
      <textarea
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
        disabled={!canWrite}
        placeholder={canWrite ? '写点什么... (Ctrl+Enter 提交)' : '等待对方写作中...'}
        rows={4}
        className="w-full py-2 px-3 border border-gray-200 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none disabled:bg-gray-50 disabled:opacity-60"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        {/* 结束回合（自由模式下不显示） */}
        {!isFreeForAll && canWrite ? (
          <button
            onClick={handleEndTurn}
            disabled={endingTurn}
            className="text-sm px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {endingTurn ? '结束中...' : '结束回合 →'}
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleSubmit}
          disabled={!canWrite || submitting || !content.trim()}
          className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '提交中...' : '提交'}
        </button>
      </div>
    </div>
  );
}
