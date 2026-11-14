import React from 'react';
import { ServerCrash } from 'lucide-react';

export const ServerErrorPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#131313] select-none">
      <div className="rounded-lg border border-[#282828] bg-[#161616] p-8 flex flex-col items-center justify-center text-center max-w-md w-full shadow-2xl">
        <div className="w-10 h-10 rounded-lg bg-red-950/30 border border-red-800/40 flex items-center justify-center text-red-500 mb-3 shadow-inner">
          <ServerCrash className="w-5 h-5" />
        </div>

        <span className="text-gray-500 font-mono text-[11px] font-semibold">500</span>
        <h3 className="text-sm font-medium text-white tracking-tight mt-1">Platform operational failure</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-[280px] leading-relaxed">
          The upstream ARDA service encountered an unhandled exception. Outbox relays and temporal state remain preserved.
        </p>

        <div className="mt-5 flex items-center space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="px-3.5 py-1.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium shadow transition-colors"
          >
            Reconnect
          </button>
        </div>
      </div>
    </div>
  );
};
