import React from 'react';

interface BetaSlotsProps {
  /** Total beta slots available */
  totalSlots: number;
  /** Number of slots claimed/paid */
  usedSlots: number;
}

const BetaSlots: React.FC<BetaSlotsProps> = ({ totalSlots, usedSlots }) => {
  const leftSlots = totalSlots - usedSlots;
  const percentage = Math.min((usedSlots / totalSlots) * 100, 100);

  return (
    <div className="mt-6 w-full max-w-md">
      <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
        <span>Beta Slots</span>
        <span>{usedSlots}/{totalSlots} taken</span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#ff4500] h-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-1">{leftSlots} left</p>
    </div>
  );
};

export default BetaSlots;
