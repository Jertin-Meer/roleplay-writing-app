'use client';

import { useState } from 'react';
import type { Character, PostType } from '@/lib/types';

interface Props {
  isMyTurn: boolean;
  myCharacters: Character[];
  onSubmit: (content: string, postType: PostType, character?: Character) => Promise<void>;
}

const POST_TYPES: { type: PostType; label: string }[] = [
  { type: 'narration', label: '旁白' },
  { type: 'dialogue', label: '对话' },
  { type: 'action', label: '动作' },
  { type: 'system', label: '备注' },
];

export default function WritingComposer({ isMyTurn, myCharacters, onSubmit }: Props) {
  const [postType, setPostType] = useState<PostType>('narration');
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const needsCharacter = postType === 'dialogue' || postType === 'action';
  const selectedCharacter = myCharacters.find((c) => c.id === selectedCharacterId);

  const handleSubmit = async () => {
    if (!isMyTurn) return;
    if (!content.trim()) {
      setError('内容不能为空');
      return;
    }
    if (needsCharacter && !selectedCharacterId) {
      setError('请先选择一个角色');
      return;
    }
    if (needsCharacter && myCharacters.length === 0) {
      setError('请先在左侧创建一个角色');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSubmit(content.trim(), postType, selectedCharacter);
      setContent('');
    } catch {
      setError('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 space-y-3 shrink-0">
      {/* Type selector */}
      <div className="flex gap-2 flex-wrap">
        {POST_TYPES.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => { setPostType(type); setError(''); }}
            disabled={!isMyTurn}
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

      {/* Character selector */}
      {needsCharacter && (
        <div>
          {myCharacters.length === 0 ? (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
              请先在左侧角色面板创建一个角色
            </p>
          ) : (
            <select
              value={selectedCharacterId}
              onChange={(e) => setSelectedCharacterId(e.target.value)}
              disabled={!isMyTurn}
              className="w-full py-1.5 px-2 text-sm border border-gray-200 rounded bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-40"
            >
              <option value="">选择角色...</option>
              {myCharacters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.character_name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Content textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
        disabled={!isMyTurn}
        placeholder={isMyTurn ? '写点什么... (Ctrl+Enter 提交)' : '等待对方写作中...'}
        rows={4}
        className="w-full py-2 px-3 border border-gray-200 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none disabled:bg-gray-50 disabled:opacity-60"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!isMyTurn || submitting || !content.trim()}
          className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '提交中...' : '提交'}
        </button>
      </div>
    </div>
  );
}
