import React from 'react';
import clsx from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'healthy' | 'review' | 'blocked' | 'neutral' | 'info' | 'durable' | 'realtime';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  className,
}) => {
  const variantStyles = {
    healthy: 'bg-[#064e3b]/30 text-[#34d399] border-[#059669]/40',
    review: 'bg-amber-950/40 text-amber-400 border-amber-800/50',
    blocked: 'bg-red-950/40 text-red-400 border-red-800/50',
    neutral: 'bg-[#1f1f1f] text-gray-300 border-[#2a2a2a]',
    info: 'bg-[#16233d] text-[#b4c5ff] border-[#263b6b]',
    durable: 'bg-[#1e293b] text-[#93c5fd] border-[#2563eb]/40',
    realtime: 'bg-[#27272a] text-gray-300 border-[#3f3f46]',
  };

  const dotColors = {
    healthy: 'bg-[#10b981]',
    review: 'bg-[#f59e0b]',
    blocked: 'bg-[#ef4444]',
    neutral: 'bg-gray-400',
    info: 'bg-[#2563eb]',
    durable: 'bg-[#3b82f6]',
    realtime: 'bg-gray-400',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border leading-tight select-none',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full mr-1.5 shrink-0',
            dotColors[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};
