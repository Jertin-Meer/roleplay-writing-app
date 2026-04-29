'use client';

import { useEffect, useRef } from 'react';
import type { Post, PostType } from '@/lib/types';

export interface TypingPreview {
  memberId: string;
  nickname: string;
  content: string;
  postType: PostType;
  characterName?: string;
}

interface Props {
  posts: Post[];
  typingPreview?: TypingPreview | null;
  myMemberId?: string;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const bgMap: Record<PostType, string> = {
  narration: 'bg-gray-50',
  dialogue: 'bg-white border border-gray-100',
  action: 'bg-gray-50',
  system: 'bg-yellow-50 border border-yellow-100',
};

const badgeMap: Record<PostType, string> = {
  narration: 'bg-gray-200 text-gray-600',
  dialogue: 'bg-blue-100 text-blue-700',
  action: 'bg-purple-100 text-purple-700',
  system: 'bg-yellow-100 text-yellow-700',
};

const labelMap: Record<PostType, string> = {
  narration: '旁白',
  dialogue: '对话',
  action: '动作',
  system: '备注',
};

function formatContent(postType: PostType, characterName: string | null | undefined, content: string) {
  if (postType === 'dialogue' && characterName) return `${characterName}："${content}"`;
  if (postType === 'action' && characterName) return `${characterName} ${content}`;
  if (postType === 'system') return `【${content}】`;
  return content;
}

function PostItem({ post }: { post: Post }) {
  return (
    <div className={`p-3 rounded-md ${bgMap[post.post_type]}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-medium text-gray-500">{post.author_nickname}</span>
        {post.character_name && (
          <span className="text-xs text-gray-400">as {post.character_name}</span>
        )}
        <span className="ml-auto text-xs text-gray-300">{formatTime(post.created_at)}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${badgeMap[post.post_type]}`}>
          {labelMap[post.post_type]}
        </span>
      </div>
      <p className={`text-sm whitespace-pre-wrap ${post.post_type === 'system' ? 'text-gray-500 italic' : 'text-gray-800'}`}>
        {formatContent(post.post_type, post.character_name, post.content)}
      </p>
    </div>
  );
}

function TypingPreviewItem({ preview }: { preview: TypingPreview }) {
  const displayContent = preview.content
    ? formatContent(preview.postType, preview.characterName, preview.content)
    : '...';

  return (
    <div className="p-3 rounded-md border border-dashed border-gray-300 bg-gray-50/50 opacity-70">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-medium text-gray-400">{preview.nickname}</span>
        {preview.characterName && (
          <span className="text-xs text-gray-300">as {preview.characterName}</span>
        )}
        <span className="ml-auto flex items-center gap-1">
          <span className="text-xs text-gray-400">正在输入</span>
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded ${badgeMap[preview.postType]}`}>
          {labelMap[preview.postType]}
        </span>
      </div>
      <p className={`text-sm whitespace-pre-wrap ${preview.postType === 'system' ? 'text-gray-400 italic' : 'text-gray-500'}`}>
        {displayContent}
      </p>
    </div>
  );
}

export default function PostList({ posts, typingPreview, myMemberId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts.length, typingPreview?.content]);

  const showPreview = typingPreview && typingPreview.memberId !== myMemberId && typingPreview.content;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {posts.length === 0 && !showPreview ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400 text-sm">还没有内容，开始写作吧</p>
        </div>
      ) : (
        <>
          {posts.map((post) => <PostItem key={post.id} post={post} />)}
          {showPreview && <TypingPreviewItem preview={typingPreview} />}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
