import React from 'react';
import type { ChainVerificationResult } from '../types';
import { ShieldCheck, CheckCircle2, AlertTriangle, X, Download, RefreshCw, Hash } from 'lucide-react';

interface ChainVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ChainVerificationResult | null;
  isVerifying: boolean;
  onReverify: () => void;
}

export const ChainVerificationModal: React.FC<ChainVerificationModalProps> = ({
  isOpen,
  onClose,
  result,
  isVerifying,
  onReverify,
}) => {
  if (!isOpen || !result) return null;

  const handleDownloadProof = () => {
    const proofData = {
      verification_standard: 'ARDA-SHA256-HASHCHAIN-v1',
      verified_at: new Date().toISOString(),
      is_valid: result.isValid,
      total_blocks_verified: result.verifiedCount,
      chain_head_seq: result.headSeq,
      chain_head_hash: result.headHash,
      checkpoint_root_hash: result.rootHash,
      verification_duration_ms: result.durationMs,
      blocks: result.blocks,
    };

    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arda-audit-proof-${result.headSeq}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chain-verification-title"
    >
      <div className="bg-[#141414] border border-[#262626] rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222222] bg-[#161616]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="chain-verification-title"
                className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2"
              >
                <span>Chain Integrity Verification</span>
                <span className="text-[10px] font-mono font-normal px-1.5 py-0.5 rounded bg-[#1f2227] text-neutral-400 border border-[#2b303c]">
                  SHA-256 Proof
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Cryptographic sequential block audit from checkpoint root to chain head.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-[#222] transition-colors"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scroll text-xs">
          {/* Status Banner */}
          {result.isValid ? (
            <div className="p-3.5 rounded-lg bg-emerald-950/25 border border-emerald-800/40 flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-emerald-300 font-medium text-[12px] flex items-center space-x-2">
                  <span>Chain Status: Intact — 100% Cryptographically Validated</span>
                </div>
                <p className="text-[11px] text-emerald-400/80 leading-relaxed">
                  All {result.verifiedCount} sequential ledger entries match their cryptographic
                  predecessor hashes. No deletions, out-of-order records, or payload mutations
                  detected.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-rose-950/25 border border-rose-800/40 flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-rose-300 font-medium text-[12px]">
                  Integrity Discrepancy Detected
                </div>
                <p className="text-[11px] text-rose-400/80">
                  One or more blocks failed hash verification. The chain linkage appears altered.
                </p>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-lg bg-[#181818] border border-[#242424]">
              <span className="text-[10px] uppercase font-mono text-neutral-500">
                Verified Blocks
              </span>
              <div className="text-sm font-semibold text-white font-mono mt-0.5">
                {result.verifiedCount}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#181818] border border-[#242424]">
              <span className="text-[10px] uppercase font-mono text-neutral-500">
                Head Sequence
              </span>
              <div className="text-sm font-semibold text-emerald-400 font-mono mt-0.5">
                #{result.headSeq}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#181818] border border-[#242424]">
              <span className="text-[10px] uppercase font-mono text-neutral-500">Verify Time</span>
              <div className="text-sm font-semibold text-neutral-200 font-mono mt-0.5">
                {result.durationMs} ms
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#181818] border border-[#242424]">
              <span className="text-[10px] uppercase font-mono text-neutral-500">Algorithm</span>
              <div className="text-sm font-semibold text-neutral-200 font-mono mt-0.5">
                SHA-256
              </div>
            </div>
          </div>

          {/* Hashes Detail Box */}
          <div className="p-3 rounded-lg bg-[#181818] border border-[#242424] space-y-2 font-mono text-[11px]">
            <div>
              <div className="text-neutral-500 flex items-center space-x-1.5">
                <Hash className="w-3 h-3 text-neutral-400" />
                <span>Genesis Checkpoint Root Hash:</span>
              </div>
              <div className="text-neutral-300 select-all break-all bg-[#121212] px-2 py-1 rounded mt-1 border border-[#202020]">
                {result.rootHash}
              </div>
            </div>
            <div>
              <div className="text-neutral-500 flex items-center space-x-1.5">
                <Hash className="w-3 h-3 text-emerald-400" />
                <span>Chain Head Hash:</span>
              </div>
              <div className="text-emerald-400 select-all break-all bg-[#121212] px-2 py-1 rounded mt-1 border border-[#202020]">
                {result.headHash}
              </div>
            </div>
          </div>

          {/* Sequential Block Proof List */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1.5 text-neutral-400">
              <span className="font-medium text-neutral-300">Sequential Block Linkages</span>
              <span className="font-mono text-[10px] text-neutral-500">Showing all verified blocks</span>
            </div>
            <div className="max-h-56 overflow-y-auto custom-scroll border border-[#222222] rounded-lg divide-y divide-[#1e1e1e] bg-[#121212] text-[11px] font-mono">
              {result.blocks.map((block) => (
                <div
                  key={block.seq}
                  className="px-3 py-2 flex items-center justify-between hover:bg-[#161616] transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-neutral-400 font-semibold w-14">#{block.seq}</span>
                    <span className="text-neutral-500">prev:</span>
                    <span className="text-neutral-400 truncate max-w-[90px]">
                      {block.prev_hash.slice(0, 8)}...
                    </span>
                    <span className="text-neutral-600">→</span>
                    <span className="text-emerald-400 font-medium truncate max-w-[90px]">
                      {block.hash.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-neutral-500 text-[10px]">
                      {block.timestamp.slice(11, 19)} UTC
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      Valid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#222222] bg-[#161616] flex items-center justify-between">
          <button
            onClick={onReverify}
            disabled={isVerifying}
            className="px-3 py-1.5 rounded text-xs bg-[#222] hover:bg-[#282828] text-neutral-300 border border-[#303030] flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Re-verify Chain</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadProof}
              className="px-3 py-1.5 rounded text-xs bg-[#1f2937] hover:bg-[#263548] text-blue-300 border border-[#2b3d56] flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Proof (.json)</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs bg-[#242424] hover:bg-[#2c2c2c] text-white border border-[#383838] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
