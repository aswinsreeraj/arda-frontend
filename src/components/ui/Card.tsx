import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-xl border border-[#282828] p-6 transition-all',
        elevated ? 'bg-[#1f1f1f] shadow-2xl' : 'bg-[#181818]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
