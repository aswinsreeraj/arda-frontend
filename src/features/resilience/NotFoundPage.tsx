import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#131313] select-none">
      <div className="rounded-lg border border-[#282828] bg-[#161616] p-8 flex flex-col items-center justify-center text-center max-w-md w-full shadow-2xl">
        {/* 404 Identifier */}
        <span className="text-gray-500 font-mono text-[11px] font-semibold">404</span>
        <h3 className="text-sm font-medium text-white tracking-tight mt-1">Resource not found</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-[280px] leading-relaxed">
          The requested path may have been resolved, archived, or you may not have access to it.
        </p>

        {/* Monospace URL Path */}
        <div className="my-4 px-3 py-1 rounded bg-[#202020] border border-[#2d2d2d] text-gray-300 font-mono text-[11px] break-all">
          {location.pathname}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3.5 py-1.5 rounded-md bg-[#202020] hover:bg-[#282828] border border-[#333333] text-gray-300 text-xs font-medium transition-colors"
            type="button"
          >
            Go back
          </button>
          <button
            onClick={() => navigate('/reviews')}
            className="px-3.5 py-1.5 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium shadow transition-colors"
            type="button"
          >
            Go to Review queue
          </button>
        </div>
      </div>
    </div>
  );
};
