import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#131313] select-none">
      <div className="rounded-lg border border-[#282828] bg-[#161616] p-8 flex flex-col items-center justify-center text-center max-w-md w-full shadow-2xl">
        <div className="w-10 h-10 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-center justify-center text-amber-500 mb-3 shadow-inner">
          <ShieldAlert className="w-5 h-5" />
        </div>

        <span className="text-gray-500 font-mono text-[11px] font-semibold">403</span>
        <h3 className="text-sm font-medium text-white tracking-tight mt-1">Access restricted</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-[280px] leading-relaxed">
          Your current role does not have authorization to view this resource. Contact your organization administrator to request access.
        </p>

        <div className="mt-5 flex items-center space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3.5 py-1.5 rounded-md bg-[#202020] hover:bg-[#282828] border border-[#333333] text-gray-300 text-xs font-medium transition-colors"
          >
            Go back
          </button>
          <button
            onClick={() => navigate('/reviews')}
            className="px-3.5 py-1.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium shadow transition-colors"
          >
            Review Queue
          </button>
        </div>
      </div>
    </div>
  );
};
