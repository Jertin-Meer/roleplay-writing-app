'use client';

import { useState } from 'react';
import { formatPostForArticle } from '@/lib/room';
import type { Post } from '@/lib/types';

interface Props {
  posts: Post[];
}

export default function ArticlePreview({ posts }: Props) {
  const [cleanMode, setCleanMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const articleText = posts.map(formatPostForArticle).join('\n\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(articleText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-medium text-gray-700">文章预览</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCleanMode(!cleanMode)}
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              cleanMode
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {cleanMode ? '详细' : '简洁'}
          </button>
          <button
            onClick={handleCopy}
            disabled={posts.length === 0}
            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
          >
            {copied ? '✓ 已复制' : '复制全文'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {posts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-8">暂无内容</p>
        ) : cleanMode ? (
          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {articleText}
          </div>
        ) : (
          <div className="space-y-3 text-sm leading-relaxed">
            {posts.map((post) => (
              <div key={post.id}>
                <span className="text-xs text-gray-400 mr-1">[{post.author_nickname}]</span>
                <span
                  className={
                    post.post_type === 'system'
                      ? 'text-gray-400 italic'
                      : 'text-gray-800'
                  }
                >
                  {formatPostForArticle(post)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
