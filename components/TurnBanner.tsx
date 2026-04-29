import type { RoomMember } from '@/lib/types';

interface Props {
  isMyTurn: boolean;
  currentTurnMember?: RoomMember;
}

export default function TurnBanner({ isMyTurn, currentTurnMember }: Props) {
  if (!currentTurnMember) return null;

  return (
    <div
      className={`px-4 py-2 text-sm font-medium shrink-0 ${
        isMyTurn
          ? 'bg-gray-900 text-white'
          : 'bg-gray-100 text-gray-600 border-b border-gray-200'
      }`}
    >
      {isMyTurn ? '✏️ 轮到你了 — 请写作' : `⏳ 等待 ${currentTurnMember.nickname} 写作中...`}
    </div>
  );
}
