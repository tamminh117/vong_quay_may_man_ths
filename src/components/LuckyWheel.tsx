import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, X, ArrowRight } from 'lucide-react';
import type { Participant, Prize } from '../App';

interface LuckyWheelProps {
  participants: Participant[];
  prizes: Prize[];
  onWinner: (participantName: string, participantId: string, prizeName: string, prizeId: string, gameType: string) => void;
}

type WheelSize = 'small' | 'medium' | 'large' | 'xlarge';

export function LuckyWheel({ participants, prizes, onWinner }: LuckyWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<{ participant: Participant; prize: Prize; winnerId: string } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [wheelSize, setWheelSize] = useState<WheelSize>('medium');
  const [showHorse, setShowHorse] = useState(false);
  const [shuffledSegments, setShuffledSegments] = useState<any[]>([]);
  
  // ========================================
  // CRITICAL: SINGLE SOURCE OF TRUTH FOR RESULT
  // This is set ONCE when spin starts, then reused everywhere
  // ========================================
  const [resultPrize, setResultPrize] = useState<any | null>(null);
  const [resultSegmentIndex, setResultSegmentIndex] = useState<number | null>(null);

  const wheelSizes = {
    small: { size: 320, textDistance: 105, centerSize: 60, fontSize: { normal: '13px', small: '11px' } },
    medium: { size: 400, textDistance: 135, centerSize: 70, fontSize: { normal: '15px', small: '12px' } },
    large: { size: 480, textDistance: 165, centerSize: 80, fontSize: { normal: '16px', small: '13px' } },
    xlarge: { size: 560, textDistance: 195, centerSize: 90, fontSize: { normal: '18px', small: '14px' } },
  };

  const currentSize = wheelSizes[wheelSize];

  // Create individual segments from prizes based on available quantity
  // Then arrange them so that non-200k prizes are never adjacent
  useEffect(() => {
    const segments = prizes.flatMap(prize => {
      const availableCount = prize.quantity - prize.wonCount;
      return Array(availableCount).fill(null).map((_, idx) => ({
        ...prize,
        // Each segment gets unique temp id
        segmentId: `${prize.id}-${idx}`,
      }));
    });
    
    // Separate into 200k and non-200k groups
    const prize200k: any[] = [];
    const prizeNon200k: any[] = [];
    
    segments.forEach(seg => {
      if (seg.name.includes('200k') || seg.name.includes('200,000') || seg.name.includes('200.000')) {
        prize200k.push(seg);
      } else {
        prizeNon200k.push(seg);
      }
    });
    
    // Shuffle each group
    const shuffle = (arr: any[]) => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    const shuffled200k = shuffle(prize200k);
    const shuffledNon200k = shuffle(prizeNon200k);
    
    // Interleave: alternate between non-200k and 200k
    const result: any[] = [];
    const maxLength = Math.max(shuffled200k.length, shuffledNon200k.length);
    
    for (let i = 0; i < maxLength; i++) {
      // First add non-200k (if available)
      if (i < shuffledNon200k.length) {
        result.push(shuffledNon200k[i]);
      }
      // Then add 200k (if available)
      if (i < shuffled200k.length) {
        result.push(shuffled200k[i]);
      }
    }
    
    setShuffledSegments(result);
  }, [prizes]);

  const segments = shuffledSegments;

  // Auto hide horse after 3 seconds
  useEffect(() => {
    if (showHorse) {
      const timer = setTimeout(() => {
        setShowHorse(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showHorse]);

  const startSpin = () => {
    if (isSpinning || !selectedParticipant || segments.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setWinner(null);
    setShowHorse(false);

    // Get selected participant
    const participant = participants.find(p => p.id === selectedParticipant);
    if (!participant) return;

    // ========================================
    // STEP 1: RANDOMLY SELECT THE PRIZE FIRST
    // ========================================
    const randomIndex = Math.floor(Math.random() * segments.length);
    const selectedPrize = segments[randomIndex];
    
    console.log('=== DETERMINISTIC SPIN ===');
    console.log('1. Selected prize:', selectedPrize.name);
    console.log('2. Prize at segment index:', randomIndex);
    console.log('3. Total segments:', segments.length);

    // ========================================
    // STEP 2: CALCULATE EXACT ROTATION TO LAND ON THAT PRIZE
    // ========================================
    const segmentAngle = 360 / segments.length;
    
    // IMPORTANT GEOMETRY FIX:
    // - Arrow points at 0 degrees (horizontal right →)
    // - Segment i has center at angle: i * segmentAngle (measured from 0° going CCW in SVG)
    // - Motion rotate() appears to be CLOCKWISE, so we need to NEGATE the rotation
    // - When wheel rotates by -R degrees (CW), segment i moves to: (i * segmentAngle) + R
    // - For arrow to point at center of segment randomIndex: (randomIndex * segmentAngle) + R = 0 (mod 360)
    // - Therefore: R = -(randomIndex * segmentAngle) = -randomIndex * segmentAngle
    
    const targetAngleForSegmentCenter = -randomIndex * segmentAngle;
    
    // Add multiple full spins for visual effect (12-18 full rotations)
    const fullSpins = 12 + Math.floor(Math.random() * 7); // 12 to 18 spins
    const extraRotation = fullSpins * 360;
    
    // Continue from current rotation (don't reset to 0)
    const currentNormalized = rotation % 360;
    const targetNormalized = (targetAngleForSegmentCenter % 360 + 360) % 360;
    
    // Calculate rotation needed
    let deltaRotation = targetNormalized - currentNormalized;
    
    const finalRotation = rotation + deltaRotation + extraRotation;
    
    console.log('=== GEOMETRY DEBUG (FIXED) ===');
    console.log('Arrow position: 0° (pointing right →)');
    console.log('Selected segment index:', randomIndex);
    console.log('Selected prize:', selectedPrize.name);
    console.log('Segment center angle (static):', randomIndex * segmentAngle, '°');
    console.log('Target rotation (negated):', targetAngleForSegmentCenter, '°');
    console.log('Current wheel rotation:', rotation, '°');
    console.log('Final rotation:', finalRotation, '°');
    console.log('Final normalized:', finalRotation % 360, '°');
    console.log('==============================');
    
    // ========================================
    // STEP 3: ANIMATE TO EXACT ROTATION
    // ========================================
    setRotation(finalRotation);

    // ========================================
    // STEP 4: SHOW THE SAME PRIZE IN MODAL
    // ========================================
    setTimeout(() => {
      const winnerId = Date.now().toString();
      setWinner({
        participant,
        prize: selectedPrize, // Use the SAME prize we selected in step 1
        winnerId,
      });
      setShowResult(true);
      setShowHorse(true);
      setIsSpinning(false);
      
      console.log('=== SPIN COMPLETE ===');
      console.log('Winner displayed:', selectedPrize.name);
      console.log('=====================');
    }, 10000); // 10 seconds for animation

    // ========================================
    // CRITICAL: SET RESULT ONCE
    // This is set ONCE when spin starts, then reused everywhere
    // ========================================
    setResultPrize(selectedPrize);
    setResultSegmentIndex(randomIndex);
  };

  const reset = () => {
    setRotation(0);
    setWinner(null);
    setShowResult(false);
    setSelectedParticipant('');
    setShowHorse(false);
  };

  const closeResult = () => {
    setShowResult(false);
    setShowHorse(false);
    // Only call onWinner when user closes the popup
    if (winner) {
      onWinner(winner.participant.name, winner.participant.id, winner.prize.name, winner.prize.id, 'Vòng Quay May Mắn');
      setWinner(null);
    }
  };

  if (participants.length === 0 || prizes.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 text-center">
        <p className="text-white/70">
          Vui lòng thêm ít nhất 1 người tham gia và 1 giải thưởng để bắt đầu
        </p>
      </div>
    );
  }

  // Helper function to create SVG path for a segment
  const createSegmentPath = (index: number, total: number, radius: number) => {
    const segmentAngle = 360 / total;
    // Offset by half segment so that segment 0 is centered at 0 degrees (where arrow points)
    const startAngle = index * segmentAngle - segmentAngle / 2;
    const endAngle = (index + 1) * segmentAngle - segmentAngle / 2;
    
    // Convert to radians and adjust for SVG coordinate system (0° is right, clockwise)
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);
    
    const largeArcFlag = segmentAngle > 180 ? 1 : 0;
    
    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const segmentAngle = 360 / segments.length;
  const radius = currentSize.size / 2;
  const borderWidth = 8; // Border thickness in pixels

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
      <div className="flex flex-col items-center gap-8">
        {/* Controls Row */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
          {/* Participant Selection */}
          <div>
            <label className="block text-white mb-2 text-center">Chọn người tham gia:</label>
            <select
              value={selectedParticipant}
              onChange={(e) => setSelectedParticipant(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              disabled={isSpinning}
            >
              <option value="" className="bg-gray-800">-- Chọn người tham gia --</option>
              {participants.map((participant) => (
                <option key={participant.id} value={participant.id} className="bg-gray-800">
                  {participant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Wheel Size Selection */}
          <div>
            <label className="block text-white mb-2 text-center">Kích thước vòng quay:</label>
            <select
              value={wheelSize}
              onChange={(e) => setWheelSize(e.target.value as WheelSize)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              disabled={isSpinning}
            >
              <option value="small" className="bg-gray-800">Nhỏ (320px)</option>
              <option value="medium" className="bg-gray-800">Trung bình (400px)</option>
              <option value="large" className="bg-gray-800">Lớn (480px)</option>
              <option value="xlarge" className="bg-gray-800">Rất lớn (560px)</option>
            </select>
          </div>
        </div>

        {/* Wheel Container */}
        <div className="relative" style={{ width: `${currentSize.size}px`, height: `${currentSize.size}px` }}>
          
          {/* Wheel */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{
              duration: 10,
              ease: [0.05, 0.7, 0.1, 0.99], // Extreme ease out - very slow at the end
            }}
            className="rounded-full shadow-2xl relative overflow-hidden w-full h-full"
            style={{
              padding: `${borderWidth}px`,
              background: '#facc15', // Yellow border color
            }}
          >
            {/* SVG for precise segments and text */}
            <svg
              width={currentSize.size - borderWidth * 2}
              height={currentSize.size - borderWidth * 2}
              className="rounded-full"
            >
              {/* Draw segments */}
              {segments.map((segment, index) => (
                <path
                  key={`segment-${segment.segmentId}`}
                  d={createSegmentPath(index, segments.length, (currentSize.size - borderWidth * 2) / 2)}
                  fill={segment.color}
                />
              ))}
              
              {/* Draw text */}
              {segments.map((segment, index) => {
                // Calculate the middle angle of this segment
                // Since segments are offset by -segmentAngle/2, segment i is centered at i * segmentAngle
                const midAngle = index * segmentAngle;
                const midRad = (midAngle * Math.PI) / 180;
                
                // Calculate position (textDistance from center)
                const adjustedRadius = (currentSize.size - borderWidth * 2) / 2;
                const textRadius = currentSize.textDistance;
                const x = adjustedRadius + textRadius * Math.cos(midRad);
                const y = adjustedRadius + textRadius * Math.sin(midRad);
                
                // Text rotation: keep it horizontal readable
                // If text is on left side of wheel (90-270 degrees), flip it to avoid upside down
                let textRotation = midAngle;
                if (midAngle > 90 && midAngle < 270) {
                  textRotation = midAngle + 180;
                }
                
                return (
                  <text
                    key={`text-${segment.segmentId}`}
                    x={x}
                    y={y}
                    fill="white"
                    fontSize={segments.length > 6 ? currentSize.fontSize.small : currentSize.fontSize.normal}
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation}, ${x}, ${y})`}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                    }}
                  >
                    {segment.name.split('-')[0].trim()}
                  </text>
                );
              })}
            </svg>
          </motion.div>

          {/* Center Circle with Arrow Pointer - Fixed, doesn't rotate */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              width: `${currentSize.centerSize}px`,
              height: `${currentSize.centerSize}px`,
            }}
          >
            {/* Shorter arrow - stops before text */}
            <div 
              className="absolute top-1/2 left-1/2 h-1 bg-gradient-to-r from-red-500 to-red-600 origin-left"
              style={{
                // Shorter length - about 50-60% of radius
                width: `${(radius - currentSize.centerSize / 2) * 0.55}px`,
                transform: 'translateY(-50%)',
              }}
            />
            
            {/* Triangle Arrow tip - positioned at END of line */}
            <div 
              className="absolute top-1/2 -translate-y-1/2"
              style={{
                // Position at the END of the line (left = line width)
                left: `${currentSize.centerSize / 2 + (radius - currentSize.centerSize / 2) * 0.55}px`,
              }}
            >
              <div 
                className="w-0 h-0"
                style={{
                  borderTop: '14px solid transparent',
                  borderBottom: '14px solid transparent',
                  borderLeft: '20px solid #dc2626',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                }}
              />
            </div>
            
            {/* Center Circle */}
            <div 
              className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 border-4 border-white shadow-lg"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={startSpin}
            disabled={isSpinning || !selectedParticipant}
            className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            {isSpinning ? 'Đang Quay...' : 'Bắt Đầu Quay'}
          </button>
          <button
            onClick={reset}
            disabled={isSpinning}
            className="px-6 py-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white rounded-xl transition-all border border-white/20 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>

        {/* Horse Animation */}
        {showHorse && (
          <>
            {/* Left Horse */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="fixed left-0 top-1/2 -translate-y-1/2 z-50"
              style={{ fontSize: '120px' }}
            >
              🎠
            </motion.div>
            
            {/* Right Horse */}
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
              style={{ fontSize: '120px', transform: 'scaleX(-1) translateY(-50%)' }}
            >
              🎠
            </motion.div>

            {/* Confetti effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 pointer-events-none z-40"
            >
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    y: -50, 
                    x: Math.random() * window.innerWidth,
                    rotate: Math.random() * 360,
                    opacity: 1
                  }}
                  animate={{ 
                    y: window.innerHeight + 100,
                    rotate: Math.random() * 720,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    ease: "linear",
                    delay: Math.random() * 0.5
                  }}
                  style={{
                    position: 'absolute',
                    fontSize: '24px',
                  }}
                >
                  {['🎉', '🎊', '⭐', '✨', '🌟'][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {/* Result */}
        {showResult && winner && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-center relative"
          >
            <p className="text-white text-2xl mb-2">🎉 Chúc Mừng! 🎉</p>
            
            {/* Prize Image */}
            {winner.prize.image && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "backOut" }}
                className="mb-4"
              >
                <img 
                  src={winner.prize.image} 
                  alt={winner.prize.name}
                  className="max-w-md mx-auto rounded-lg shadow-2xl"
                  style={{ maxHeight: '300px', width: 'auto' }}
                />
              </motion.div>
            )}
            
            <p className="text-white mb-1">
              <span className="opacity-90">Người trúng thưởng:</span>
            </p>
            <p className="text-white text-xl mb-3">{winner.participant.name}</p>
            <p className="text-white mb-1">
              <span className="opacity-90">Giải thưởng:</span>
            </p>
            <p className="text-white text-xl mb-4">{winner.prize.name}</p>
            <button
              onClick={closeResult}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all flex items-center gap-2 mx-auto"
            >
              <X className="w-4 h-4" />
              Đóng
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}