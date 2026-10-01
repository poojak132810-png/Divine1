import React from 'react';
import { SevaItem } from '../types';

interface SevaPreviewCardsProps {
  sevas: SevaItem[];
  onBookSeva: (sevaId: string) => void;
  onViewAll: () => void;
}

export const SevaPreviewCards: React.FC<SevaPreviewCardsProps> = ({
  sevas,
  onBookSeva,
  onViewAll,
}) => {
  const preview = sevas.slice(0, 4);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-playfair text-lg font-bold text-[#fff4e8]">
          Sevas you can book online
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#ff9933] hover:underline cursor-pointer"
        >
          View all →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {preview.map((seva) => (
          <div
            key={seva.id}
            className="p-3.5 rounded-2xl bg-[#1a0806] border border-[#481a12] flex flex-col justify-between"
          >
            <div>
              <h4 className="text-sm font-bold text-[#fff4e8] leading-tight">{seva.name}</h4>
              <p className="text-[10px] text-[#998172] mb-2">{seva.sanskritName}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#ff9933]">₹{seva.price}</span>
              <button
                onClick={() => onBookSeva(seva.id)}
                className="text-[11px] font-bold text-[#ff9933] hover:underline cursor-pointer"
              >
                Book →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};