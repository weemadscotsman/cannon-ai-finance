
import React from 'react';

interface Props {
  used: number;
  limit: number;
  onUpgrade: () => void;
}

export const UsageWidget: React.FC<Props> = ({ used, limit, onUpgrade }) => {
  const percentage = Math.min((used / limit) * 100, 100);
  const remaining = Math.max(limit - used, 0);
  const isLow = percentage > 80;
  const isOut = used >= limit;

  return (
    <div className={`p-3 rounded-xl border ${
      isOut 
        ? 'bg-red-950/30 border-red-500/50' 
        : isLow 
        ? 'bg-amber-950/30 border-amber-500/50' 
        : 'bg-gray-900/50 border-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-xs font-bold uppercase tracking-widest ${
          isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
        }`}>
          {isOut ? '⚠️ Limit Reached' : 'AI Credits'}
        </span>
        <span className="text-xs text-gray-500">
          {remaining} remaining
        </span>
      </div>
      
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full transition-all duration-500 ${
            isOut 
              ? 'bg-red-500' 
              : isLow 
              ? 'bg-amber-500' 
              : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {used} / {limit} used
        </span>
        {(isLow || isOut) && (
          <button 
            onClick={onUpgrade}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Unlock $4.99 →
          </button>
        )}
      </div>
    </div>
  );
};
