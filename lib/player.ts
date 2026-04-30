import type { RecentRoom } from './types';

const PLAYER_ID_KEY = 'rwr_player_id';
const NICKNAME_KEY = 'rwr_nickname';
const RECENT_ROOMS_KEY = 'rwr_recent_rooms';

export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function getNickname(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(NICKNAME_KEY) || '';
}

export function saveNickname(nickname: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NICKNAME_KEY, nickname);
}

export function getRecentRooms(): RecentRoom[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_ROOMS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveRecentRoom(room: Omit<RecentRoom, 'lastVisited'>): void {
  if (typeof window === 'undefined') return;
  const rooms = getRecentRooms().filter((r) => r.id !== room.id);
  const updated: RecentRoom[] = [{ ...room, lastVisited: new Date().toISOString() }, ...rooms].slice(0, 5);
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(updated));
}
