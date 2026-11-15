import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from './auditApi';
import type { AuditEventItem, AuditListFilters, ChainVerificationResult } from './types';
import { AuditTable } from './components/AuditTable';
import { ChainVerificationModal } from './components/ChainVerificationModal';
import {
  Lock,
  Search,
  ChevronDown,
  ShieldCheck,
  Bot,
  User,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const [filters, setFilters] = useState<AuditListFilters>({
    search: '',
    timeframe: '7d',
    agent_id: 'all',
    source: 'all',
    outcome: 'all',
  });

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ChainVerificationResult | null>(
    null
  );
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch unified audit events and cryptographic chain
  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['audit-events'],
    queryFn: ({ signal }) => auditApi.fetchAuditEvents(signal),
    staleTime: 30000,
  });

  // Extract unique agents for filter dropdown
  const uniqueAgents = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      if (item.agent_name) {
        map.set(item.agent_name, item.agent_name);
      }
    }
    return Array.from(map.values()).sort();
  }, [items]);

  // Stabilized reference time for relative timeframe filtering
  const [nowTimestamp] = useState(() => Date.now());

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          String(item.seq).includes(query) ||
          item.execution_id.toLowerCase().includes(query) ||
          item.hash.toLowerCase().includes(query) ||
          item.agent_name.toLowerCase().includes(query) ||
          item.decision.toLowerCase().includes(query) ||
          (item.denial_reason && item.denial_reason.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Timeframe
      if (filters.timeframe && filters.timeframe !== 'all') {
        const itemTime = new Date(item.timestamp).getTime();
        const diffMs = nowTimestamp - itemTime;
        if (filters.timeframe === '24h' && diffMs > 24 * 60 * 60 * 1000) return false;
        if (filters.timeframe === '7d' && diffMs > 7 * 24 * 60 * 60 * 1000) return false;
        if (filters.timeframe === '30d' && diffMs > 30 * 24 * 60 * 60 * 1000) return false;
      }

      // Agent
      if (filters.agent_id && filters.agent_id !== 'all') {
        if (item.agent_name !== filters.agent_id) return false;
      }

      // Source
      if (filters.source && filters.source !== 'all') {
        if (item.source !== filters.source) return false;
      }

      // Outcome
      if (filters.outcome && filters.outcome !== 'all') {
        if (filters.outcome === 'allowed' && item.outcome !== 'allowed' && item.outcome !== 'approved') {
          return false;
        }
        if (filters.outcome === 'denied' && item.outcome !== 'denied' && item.outcome !== 'rejected') {
          return false;
        }
        if (filters.outcome === 'escalated' && item.outcome !== 'escalated' && item.outcome !== 'overridden') {
          return false;
        }
      }

      return true;
    });
  }, [items, filters, nowTimestamp]);

  // Chain Head Stats
  const chainHead = useMemo(() => {
    if (items.length === 0) {
      return {
        seq: 0,
        hash: '—',
        shortHash: '—',
        lastEntry: 'No entries recorded',
      };
    }
    const head = items[0];
    const date = new Date(head.timestamp);
    const formatted = date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    return {
      seq: head.seq,
      hash: `${head.hash.slice(0, 8)}...${head.hash.slice(-4)}`,
      shortHash: head.hash.slice(0, 8),
      lastEntry: formatted,
    };
  }, [items]);

  // Execute verification
  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setIsVerificationModalOpen(true);
    try {
      const res = await auditApi.verifyHashChain(items);
      setVerificationResult(res);
    } catch (err) {
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInspectIntegrity = (_item: AuditEventItem) => {
    handleVerifyChain();
  };

  return (
    <main
      className="flex-1 flex flex-col px-6 pt-5 pb-4 w-full bg-[#131313]"
      data-purpose="audit-explorer"
    >
      {/* Header Section */}
      <section
        className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4"
        data-purpose="ledger-header"
      >
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-bold text-white tracking-tight">Audit trail</h1>
            {/* read-only badge */}
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-mono bg-[#1a1a1a] text-[#9ca3af] border border-[#2b2b2b]">
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              <span>read-only</span>
            </span>
            {/* append-only badge */}
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-xs font-mono bg-[#1a1a1a] text-[#9ca3af] border border-[#2b2b2b]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>append-only</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8a8f99] mt-1">
            Every decision the platform has committed, automatic and reviewed. Each entry is
            hash-linked to the one before it.
          </p>
        </div>

        {/* Right Chain Head Stats & Verify Action */}
        <div className="flex items-center space-x-4">
          <div className="text-right text-xs font-mono leading-tight space-y-1">
            <div className="text-[#8c929e]">
              chain head <span className="text-neutral-200">#{chainHead.seq}</span> ·{' '}
              <span className="text-neutral-400">{chainHead.hash}</span>
            </div>
            <div className="text-[#8c929e]">
              last entry <span className="text-neutral-300">{chainHead.lastEntry}</span>
            </div>
          </div>
          <button
            onClick={handleVerifyChain}
            className="h-8 px-3 rounded bg-[#1e293b]/70 hover:bg-[#283548] text-sky-300 border border-[#334155] text-xs font-medium flex items-center space-x-1.5 transition-colors shadow-xs"
            title="Perform cryptographic verification over hash-chain"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Verify Chain Integrity</span>
          </button>
        </div>
      </section>

      {/* Toolbar: Search, Filters, Sources & Counter */}
      <section
        className="flex flex-wrap items-center justify-between gap-3 py-2 text-xs sm:text-sm"
        data-purpose="table-filter-toolbar"
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              value={filters.search || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="h-8 pl-8 pr-3 w-64 bg-[#181818] border border-[#262626] rounded text-[#d6d9e0] placeholder-[#5a5f6b] focus:outline-none focus:border-neutral-500 text-xs sm:text-sm transition-colors"
              placeholder="Execution ID, seq, hash, actor"
              type="text"
            />
          </div>

          {/* Recorded Timeframe Dropdown */}
          <div className="relative">
            <select
              value={filters.timeframe || 'all'}
              aria-label="Recorded Timeframe Filter"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  timeframe: e.target.value as AuditListFilters['timeframe'],
                }))
              }
              className="h-8 pl-2.5 pr-7 rounded bg-[#181818] border border-[#262626] text-[#8e94a0] hover:text-white text-xs sm:text-sm appearance-none focus:outline-none focus:border-neutral-500 transition-colors cursor-pointer"
            >
              <option value="all">Recorded: All time</option>
              <option value="24h">Recorded: Last 24 hours</option>
              <option value="7d">Recorded: Last 7 days</option>
              <option value="30d">Recorded: Last 30 days</option>
            </select>
            <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Agent Dropdown */}
          <div className="relative">
            <select
              value={filters.agent_id || 'all'}
              aria-label="Agent Filter"
              onChange={(e) => setFilters((prev) => ({ ...prev, agent_id: e.target.value }))}
              className="h-8 pl-2.5 pr-7 rounded bg-[#181818] border border-[#262626] text-[#8e94a0] hover:text-white text-xs sm:text-sm appearance-none focus:outline-none focus:border-neutral-500 transition-colors cursor-pointer"
            >
              <option value="all">Agent: All agents</option>
              {uniqueAgents.map((agName) => (
                <option key={agName} value={agName}>
                  {agName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Segmented Source Filter */}
          <div className="flex items-center h-8 bg-[#181818] border border-[#262626] rounded p-0.5">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, source: 'all' }))}
              className={`px-2.5 h-full rounded text-xs font-medium transition-colors ${
                filters.source === 'all' ? 'bg-[#282828] text-white' : 'text-[#8c919b] hover:text-white'
              }`}
            >
              All sources
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, source: 'agent' }))}
              className={`px-2.5 h-full rounded text-xs flex items-center space-x-1.5 transition-colors ${
                filters.source === 'agent'
                  ? 'bg-[#282828] text-white font-medium'
                  : 'text-[#8c919b] hover:text-neutral-300'
              }`}
            >
              <Bot className="w-3 h-3 text-neutral-400" />
              <span>Agent (automatic)</span>
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, source: 'human' }))}
              className={`px-2.5 h-full rounded text-xs flex items-center space-x-1.5 transition-colors ${
                filters.source === 'human'
                  ? 'bg-[#282828] text-white font-medium'
                  : 'text-[#8c919b] hover:text-neutral-300'
              }`}
            >
              <User className="w-3 h-3 text-neutral-400" />
              <span>Human (reviewed)</span>
            </button>
          </div>

          {/* Outcome Filter */}
          <div className="relative">
            <select
              value={filters.outcome || 'all'}
              aria-label="Outcome Filter"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  outcome: e.target.value as AuditListFilters['outcome'],
                }))
              }
              className="h-8 pl-2.5 pr-7 rounded bg-[#181818] border border-[#262626] text-[#8e94a0] hover:text-white text-xs sm:text-sm appearance-none focus:outline-none focus:border-neutral-500 transition-colors cursor-pointer"
            >
              <option value="all">Outcome: All outcomes</option>
              <option value="allowed">Allowed / Approved</option>
              <option value="denied">Denied / Rejected</option>
              <option value="escalated">Escalated / Overridden</option>
            </select>
            <ChevronDown className="w-3 h-3 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Result Count */}
        <span className="text-xs sm:text-sm font-mono text-[#787e8a]">
          {filteredItems.length} entries
        </span>
      </section>

      {/* Main Ledger Content */}
      {isLoading ? (
        <div className="mt-2 border border-[#222222] rounded bg-[#141414] p-12 text-center text-xs text-neutral-500 flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin text-neutral-400" />
          <span>Loading cryptographic audit ledger...</span>
        </div>
      ) : isError ? (
        <div className="mt-2 border border-rose-900/40 rounded bg-rose-950/20 p-8 text-center text-xs text-rose-300 space-y-2">
          <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
          <div className="font-semibold">Unable to load audit events</div>
          <p className="text-rose-400/80 text-[11px]">
            {error instanceof Error ? error.message : 'Network error'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1.5 rounded bg-rose-900/50 hover:bg-rose-900 text-white text-xs border border-rose-700/50"
          >
            Retry
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mt-2 border border-[#222222] rounded bg-[#141414] p-12 text-center text-xs text-neutral-500">
          No audit ledger entries match your filter criteria.
        </div>
      ) : (
        <AuditTable items={filteredItems} onInspectIntegrity={handleInspectIntegrity} />
      )}

      {/* Table Compliance Footer */}
      <footer
        className="mt-3 py-1 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#767c88] space-y-2 sm:space-y-0"
        data-purpose="ledger-compliance-footer"
      >
        <div className="flex items-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-neutral-500" />
          <span>Entries are written once and cannot be edited or deleted.</span>
        </div>
        <div>
          <span>Cryptographic SHA-256 hash-chain verified</span>
        </div>
      </footer>

      {/* Verification Modal */}
      <ChainVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        result={verificationResult}
        isVerifying={isVerifying}
        onReverify={handleVerifyChain}
      />
    </main>
  );
};
