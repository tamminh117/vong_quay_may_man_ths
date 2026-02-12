import { motion } from 'motion/react';
import { Trophy, Calendar, Trash2, X } from 'lucide-react';
import type { WinnerRecord } from '../App';

interface WinnerHistoryProps {
  winners: WinnerRecord[];
  onClear: () => void;
  onRemove: (winnerId: string) => void;
}

export function WinnerHistory({ winners, onClear, onRemove }: WinnerHistoryProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (winners.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-white text-xl">Lịch Sử Trúng Thưởng</h2>
        </div>
        <p className="text-white/50 text-center py-8">Chưa có người trúng thưởng</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-white text-xl">Lịch Sử Trúng Thưởng</h2>
          <span className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm">
            {winners.length}
          </span>
        </div>
        <button
          onClick={onClear}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center gap-2 border border-red-500/30"
        >
          <Trash2 className="w-4 h-4" />
          Xóa Lịch Sử
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {winners.map((winner, index) => (
          <motion.div
            key={winner.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors border border-white/10 relative"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 text-xl">🏆</span>
                  <span className="text-white">{winner.participantName}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-pink-400 text-sm">🎁</span>
                  <span className="text-white/80 text-sm">{winner.prizeName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-sm">🎮</span>
                  <span className="text-white/60 text-sm">{winner.gameType}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Calendar className="w-3 h-3" />
                  {formatTime(winner.timestamp)}
                </div>
                <button
                  onClick={() => onRemove(winner.id)}
                  className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors border border-red-500/30 flex items-center gap-1"
                  title="Hoàn tác và thêm lại người này"
                >
                  <X className="w-3 h-3" />
                  <span className="text-xs">Hoàn tác</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}