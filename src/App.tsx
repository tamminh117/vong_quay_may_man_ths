import { useState } from 'react';
import { LuckyWheel } from './components/LuckyWheel';
import { ParticipantManager } from './components/ParticipantManager';
import { PrizeManager } from './components/PrizeManager';
import { WinnerHistory } from './components/WinnerHistory';
import { Trophy, Users, Gift } from 'lucide-react';
import logo from 'figma:asset/5278e650c8143a258b5629549409fdd9cd39a0aa.png';
import chiVangImg from 'figma:asset/5592fe97886705a0c835dcfff6f9954576e1803c.png';
import luongBacImg from 'figma:asset/b13e62fc27affd00d44ce129b8b4797762c28961.png';
import img500k from 'figma:asset/604bdaaa4be3b81ecc70c52282c92460822d09d2.png';
import img200k from 'figma:asset/fae102359c608d48a791513b49d5e83ebe57df23.png';
import img2trieu from 'figma:asset/f07ce8064a32d3b95b7f6458ceadaefb2eeecc15.png';
import img1trieu from 'figma:asset/21d4c460ea5b3a3f4445681d6c7803c8fa8a3b50.png';

export interface Participant {
  id: string;
  name: string;
}

export interface Prize {
  id: string;
  name: string;
  color: string;
  quantity: number;
  wonCount: number;
  image?: string; // Add image field
}

export interface WinnerRecord {
  id: string;
  participantName: string;
  participantId: string;
  prizeName: string;
  prizeId: string;
  timestamp: Date;
  gameType: string;
}

export default function App() {
  const [activeGame, setActiveGame] = useState<'wheel' | 'box'>('wheel');
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Chị Phương' },
    { id: '2', name: 'Tú' },
    { id: '3', name: 'Anh Bằng' },
    { id: '4', name: 'Huy' },
    { id: '5', name: 'Chị Tuyết' },
    { id: '6', name: 'Chị Bình' },
    { id: '7', name: 'Chị Xuyến' },
    { id: '8', name: 'Tâm' },
    { id: '9', name: 'Anh Tân' },
    { id: '10', name: 'Anh Thiện' },
    { id: '11', name: 'Anh Cường' },
  ]);
  const [prizes, setPrizes] = useState<Prize[]>([
    { id: '1', name: '0.5 Chỉ Vàng', color: '#FFD700', quantity: 1, wonCount: 0, image: chiVangImg },
    { id: '2', name: '1 Lượng Bạc', color: '#C0C0C0', quantity: 1, wonCount: 0, image: luongBacImg },
    { id: '3', name: '2 Triệu', color: '#FF6B6B', quantity: 1, wonCount: 0, image: img2trieu },
    { id: '4', name: '1 Triệu', color: '#4ECDC4', quantity: 2, wonCount: 0, image: img1trieu },
    { id: '5', name: '500K', color: '#45B7D1', quantity: 5, wonCount: 0, image: img500k },
    { id: '6', name: '200K', color: '#FFA07A', quantity: 17, wonCount: 0, image: img200k },
  ]);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [showManagement, setShowManagement] = useState(false);

  const addParticipant = (name: string) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name,
    };
    setParticipants([...participants, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const addPrize = (name: string, color: string, quantity: number) => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      name,
      color,
      quantity,
      wonCount: 0,
    };
    setPrizes([...prizes, newPrize]);
  };

  const removePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const addWinner = (participantName: string, participantId: string, prizeName: string, prizeId: string, gameType: string) => {
    const newWinner: WinnerRecord = {
      id: Date.now().toString(),
      participantName,
      participantId,
      prizeName,
      prizeId,
      timestamp: new Date(),
      gameType,
    };
    setWinners([newWinner, ...winners]);
    
    // Update prize won count and remove participant
    setPrizes(prevPrizes => {
      const updatedPrizes = prevPrizes.map(p => 
        p.id === prizeId ? { ...p, wonCount: p.wonCount + 1 } : p
      );
      // Remove prize if it has reached its quantity limit
      return updatedPrizes.filter(p => p.wonCount < p.quantity);
    });
    
    // Remove participant who won
    setParticipants(prevParticipants => 
      prevParticipants.filter(p => p.id !== participantId)
    );
  };

  const removeWinner = (winnerId: string) => {
    const winner = winners.find(w => w.id === winnerId);
    if (!winner) return;

    // Remove from winners list
    setWinners(winners.filter(w => w.id !== winnerId));

    // Add participant back
    const participantExists = participants.some(p => p.id === winner.participantId);
    if (!participantExists) {
      setParticipants([...participants, { id: winner.participantId, name: winner.participantName }]);
    }

    // Update prize count or add prize back if needed
    const prizeExists = prizes.find(p => p.id === winner.prizeId);
    if (prizeExists) {
      setPrizes(prizes.map(p => 
        p.id === winner.prizeId ? { ...p, wonCount: Math.max(0, p.wonCount - 1) } : p
      ));
    } else {
      // Prize was removed, need to add it back
      // We'll need to reconstruct it from the winner record
      const prizeWonCount = winners.filter(w => w.prizeId === winner.prizeId && w.id !== winnerId).length;
      const newPrize: Prize = {
        id: winner.prizeId,
        name: winner.prizeName,
        color: '#FF6B6B', // Default color, since we don't store it in winner
        quantity: prizeWonCount + 1, // At least the number that have won
        wonCount: prizeWonCount,
      };
      setPrizes([...prizes, newPrize]);
    }
  };

  const clearHistory = () => {
    setWinners([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="THS Logo" className="w-16 h-16 object-contain" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-white text-3xl">THS</h1>
                  <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-white/70 text-sm">Quay Thưởng May Mắn</p>
              </div>
            </div>
            <button
              onClick={() => setShowManagement(!showManagement)}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
            >
              {showManagement ? 'Ẩn Quản Lý' : 'Quản Lý'}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Management Section */}
        {showManagement && (
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParticipantManager
              participants={participants}
              onAdd={addParticipant}
              onRemove={removeParticipant}
            />
            <PrizeManager
              prizes={prizes}
              onAdd={addPrize}
              onRemove={removePrize}
            />
          </div>
        )}

        {/* Game Selection */}
        <div className="mb-8">
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => setActiveGame('wheel')}
              className={`px-8 py-4 rounded-xl transition-all ${
                activeGame === 'wheel'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-2xl scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              🎡 Vòng Quay May Mắn
            </button>
          </div>
        </div>

        {/* Game Area */}
        <div className="mb-8">
          {activeGame === 'wheel' && (
            <LuckyWheel
              participants={participants}
              prizes={prizes}
              onWinner={addWinner}
            />
          )}
        </div>

        {/* Winner History */}
        <WinnerHistory winners={winners} onClear={clearHistory} onRemove={removeWinner} />
      </div>
    </div>
  );
}