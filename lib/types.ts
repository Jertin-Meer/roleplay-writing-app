export type PostType = 'narration' | 'dialogue' | 'action' | 'system';

export interface Room {
  id: string;
  title: string;
  room_code: string;
  host_player_id: string;
  current_turn_member_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  player_id: string;
  nickname: string;
  turn_order: number;
  is_host: boolean;
  joined_at: string;
}

export interface Character {
  id: string;
  room_id: string;
  owner_player_id: string;
  owner_member_id: string;
  character_name: string;
  avatar_url: string | null;
  short_description: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  room_id: string;
  author_member_id: string;
  author_nickname: string;
  character_id: string | null;
  character_name: string | null;
  post_type: PostType;
  content: string;
  order_index: number;
  created_at: string;
}
