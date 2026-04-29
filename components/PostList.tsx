'use client';

import { useEffect, useRef } from 'react';
import type { Post } from '@/lib/types';

interface Props {
  posts: Post[];
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function PostItem({ post }: { post: Post }) {
  const bgMap = {
    narration: 'bg-gray-50',
    dialogue: 'bg-white border border-gray-100',
    action: 'bg-gray-50',
    system: 'bg-yellow-50 border border-yellow-100',
  };

  const badgeMap = {
    narration: 'bg-gray-200 text-gray-600',
    dialogue: 'bg-blue-100 text-blue-700',
    action: 'bg-purple-100 text-purple-700',
    system: 'bg-yellow-100 text-yellow-700',
  };

  const labelMap = {
    narration: '旁白',
    dialogue: '对话',
    action: '动作',
    system: '备注',
  };

  let displayContent = post.content;
  if (post.post_type === 'dialogue' && post.character_name) {
    displayContent = `${post.character_name}："${post.content}"`;
  } else if (post.post_type === 'action' && post.character_name) {
    displayContent = `${post.character_name} ${post.content}`;
  } else if (post.post_type === 'system') {
    displayContent = `【${post.content}】`;
  }

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
      <p
        className={`text-sm whitespace-pre-wrap ${
          post.post_type === 'system' ? 'text-gray-500 italic' : 'text-gray-800'
        }`}
      >
        {displayContent}
      </p>
    </div>
  );
}

export default function PostList({ posts }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts.length]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {posts.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400 text-sm">还没有内容，开始写作吧</p>
        </div>
      ) : (
        posts.map((post) => <PostItem key={post.id} post={post} />)
      )}
      <div ref={bottomRef} />
    </div>
  );
}
