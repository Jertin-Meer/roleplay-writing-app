import type { Post } from './types';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function formatPostForArticle(post: Post): string {
  switch (post.post_type) {
    case 'dialogue':
      return `${post.character_name || '???'}："${post.content}"`;
    case 'action':
      return `${post.character_name || '???'} ${post.content}`;
    case 'system':
      return `【${post.content}】`;
    default:
      return post.content;
  }
}
