import { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import type { Participant } from '../App';

interface ParticipantManagerProps {
  participants: Participant[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

export function ParticipantManager({ participants, onAdd, onRemove }: ParticipantManagerProps) {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-6 h-6 text-blue-400" />
        <h2 className="text-white text-xl">Quản Lý Người Tham Gia</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nhập tên người tham gia..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm
          </button>
        </div>
      </form>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {participants.length === 0 ? (
          <p className="text-white/50 text-center py-4">Chưa có người tham gia</p>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between bg-white/5 hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
            >
              <span className="text-white">{participant.name}</span>
              <button
                onClick={() => onRemove(participant.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-white/70 text-sm">
          Tổng số người tham gia: <span className="text-white">{participants.length}</span>
        </p>
      </div>
    </div>
  );
}
