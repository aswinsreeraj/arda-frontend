import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export interface ResilienceBannerProps {
  isDisconnected?: boolean;
  onRetry?: () => void;
}

export const ResilienceBanner: React.FC<ResilienceBannerProps> = ({
  isDisconnected = false,
  onRetry,
}) => {
  const [countdown, setCountdown] = useState(3);
  const [attempt, setAttempt] = useState(2);

  useEffect(() => {
    if (!isDisconnected) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 4));
    }, 1000);
    return () => clearInterval(timer);
  }, [isDisconnected]);

  if (!isDisconnected) return null;

  return (
    <div className="w-full bg-[#14120e] border-b border-[#3b2b11] text-xs">
      <div className="px-4 py-2 bg-[#20180a] flex items-center justify-between">
        {/* Left Status Text */}
        <div className="flex items-center space-x-2 text-[#fbbf24]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="text-gray-300">
            <strong className="font-medium text-[#fbbf24]">Live connection lost.</strong>{' '}
            Queue updates are paused — the list may be out of date.
          </span>
        </div>

        {/* Right Retry Actions & Meta */}
        <div className="flex items-center space-x-4 text-[11px]">
          <span className="text-gray-400 font-mono text-[10px]">Last event 15:57:24</span>
          <div className="flex items-center space-x-1 text-amber-400">
            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            <span>
              Retrying in {countdown}s ·{' '}
              <span className="text-gray-400">attempt {attempt}/5</span>
            </span>
          </div>
          <button
            onClick={() => {
              setCountdown(3);
              setAttempt((a) => Math.min(a + 1, 5));
              onRetry?.();
            }}
            className="px-2.5 py-0.5 rounded bg-[#2b2110] hover:bg-[#382b15] text-amber-200 border border-[#523e1b] font-medium text-[11px] transition-colors"
            type="button"
          >
            Retry now
          </button>
        </div>
      </div>
    </div>
  );
};
