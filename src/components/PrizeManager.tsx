import { useState } from 'react';
import { Gift, Plus, Trash2 } from 'lucide-react';
import type { Prize } from '../App';

interface PrizeManagerProps {
  prizes: Prize[];
  onAdd: (name: string, color: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52B788', '#E63946', '#457B9D'
];

export function PrizeManager({ prizes, onAdd, onRemove }: PrizeManagerProps) {
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && quantity > 0) {
      onAdd(newName.trim(), selectedColor, quantity);
      setNewName('');
      setSelectedColor(PRESET_COLORS[0]);
      setQuantity(1);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6 text-pink-400" />
        <h2 className="text-white text-xl">Quản Lý Giải Thưởng</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nhập tên giải thưởng..."
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  selectedColor === color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            placeholder="Số lượng..."
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />

          <button
            type="submit"
            className="w-full px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm Giải Thưởng
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {prizes.length === 0 ? (
          <p className="text-white/50 text-center py-4">Chưa có giải thưởng</p>
        ) : (
          prizes.map((prize) => (
            <div
              key={prize.id}
              className="flex items-center justify-between bg-white/5 hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: prize.color }}
                />
                <div className="flex-1">
                  <span className="text-white block">{prize.name}</span>
                  <span className="text-white/60 text-sm">
                    Còn lại: {prize.quantity - prize.wonCount}/{prize.quantity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onRemove(prize.id)}
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
          Tổng số giải thưởng: <span className="text-white">{prizes.length}</span>
        </p>
      </div>
    </div>
  );
}