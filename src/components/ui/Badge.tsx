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
    healthy:
      'bg-emerald-500/10 dark:bg-[#064e3b]/30 text-emerald-700 dark:text-[#34d399] border-emerald-500/30 dark:border-[#059669]/40',
    review:
      'bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-500/30 dark:border-amber-800/50',
    blocked:
      'bg-red-500/10 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-500/30 dark:border-red-800/50',
    neutral:
      'bg-neutral-200/60 dark:bg-[#1f1f1f] text-neutral-700 dark:text-gray-300 border-neutral-300 dark:border-[#2a2a2a]',
    info:
      'bg-blue-500/10 dark:bg-[#16233d] text-blue-700 dark:text-[#b4c5ff] border-blue-500/30 dark:border-[#263b6b]',
    durable:
      'bg-sky-500/10 dark:bg-[#1e293b] text-sky-700 dark:text-[#93c5fd] border-sky-500/30 dark:border-[#2563eb]/40',
    realtime:
      'bg-neutral-200/70 dark:bg-[#27272a] text-neutral-700 dark:text-gray-300 border-neutral-300 dark:border-[#3f3f46]',
  };

  const dotColors = {
    healthy: 'bg-emerald-500 dark:bg-[#10b981]',
    review: 'bg-amber-500 dark:bg-[#f59e0b]',
    blocked: 'bg-red-500 dark:bg-[#ef4444]',
    neutral: 'bg-neutral-500 dark:bg-gray-400',
    info: 'bg-blue-500 dark:bg-[#2563eb]',
    durable: 'bg-sky-500 dark:bg-[#3b82f6]',
    realtime: 'bg-neutral-500 dark:bg-gray-400',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono border leading-tight select-none font-medium',
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
