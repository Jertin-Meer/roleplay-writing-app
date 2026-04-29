import type { RoomMember } from '@/lib/types';

interface Props {
  members: RoomMember[];
  currentTurnMemberId: string | null;
  myMemberId?: string;
}

export default function MemberList({ members, currentTurnMemberId, myMemberId }: Props) {
  return (
    <div className="p-4 border-b border-gray-100">
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
        成员 ({members.length})
      </h3>
      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                member.id === currentTurnMemberId ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span
              className={`text-sm truncate flex-1 ${
                member.id === myMemberId ? 'font-semibold text-gray-900' : 'text-gray-700'
              }`}
            >
              {member.nickname}
              {member.is_host && (
                <span className="ml-1 text-xs text-gray-400 font-normal">房主</span>
              )}
              {member.id === myMemberId && (
                <span className="ml-1 text-xs text-gray-400 font-normal">你</span>
              )}
            </span>
            {member.id === currentTurnMemberId && (
              <span className="text-xs text-green-600 shrink-0">写作中</span>
            )}
          </div>
        ))}
        {members.length === 0 && (
          <p className="text-xs text-gray-400">暂无成员</p>
        )}
      </div>
    </div>
  );
}
