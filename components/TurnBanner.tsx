import type { RoomMember } from '@/lib/types';

interface Props {
  isMyTurn: boolean;
  currentTurnMember?: RoomMember;
  isFreeForAll?: boolean;
  isPaused?: boolean;
}

export default function TurnBanner({ isMyTurn, currentTurnMember, isFreeForAll, isPaused }: Props) {
  if (isPaused) return null;

  if (isFreeForAll) {
    return (
      <div className="px-4 py-2 text-sm font-medium bg-purple-50 text-purple-700 border-b border-purple-100 shrink-0">
        ✏️ 自由编辑模式 — 所有人可同时发言
      </div>
    );
  }

  if (!currentTurnMember) return null;

  return (
    <div className={`px-4 py-2 text-sm font-medium shrink-0 ${isMyTurn ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 border-b border-gray-200'}`}>
      {isMyTurn ? '✏️ 轮到你了 — 请写作' : `⏳ 等待 ${currentTurnMember.nickname} 写作中...`}
    </div>
  );
}
