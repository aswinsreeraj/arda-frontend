import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { EndpointGroup, EndpointDoc, HttpMethod } from '../types';

interface EndpointSidebarProps {
  groups: EndpointGroup[];
  selectedEndpointId: string;
  onSelectEndpoint: (id: string) => void;
}

function getMethodBadgeClass(method: HttpMethod): string {
  switch (method) {
    case 'POST':
      return 'text-[#10B981] font-bold';
    case 'GET':
      return 'text-[#60A5FA] font-semibold';
    case 'PUT':
      return 'text-amber-400 font-semibold';
    case 'DELETE':
      return 'text-red-400 font-semibold';
    case 'PATCH':
      return 'text-purple-400 font-semibold';
    default:
      return 'text-[#888888] font-semibold';
  }
}

export const EndpointSidebar: React.FC<EndpointSidebarProps> = ({
  groups,
  selectedEndpointId,
  onSelectEndpoint,
}) => {
  const [filter, setFilter] = useState('');

  const filteredGroups = useMemo(() => {
    if (!filter.trim()) return groups;
    const term = filter.toLowerCase();

    return groups
      .map((group) => {
        const matchingEndpoints = group.endpoints.filter(
          (ep) =>
            ep.title.toLowerCase().includes(term) ||
            ep.path.toLowerCase().includes(term) ||
            ep.method.toLowerCase().includes(term) ||
            ep.category.toLowerCase().includes(term)
        );
        return {
          ...group,
          endpoints: matchingEndpoints,
        };
      })
      .filter((group) => group.endpoints.length > 0);
  }, [groups, filter]);

  return (
    <aside className="w-64 flex-shrink-0 bg-[#121214] border-r border-[#242424] flex flex-col h-full select-none">
      {/* Search Input Filter */}
      <div className="p-3 border-b border-[#242424]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-[#71717a]" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter endpoints"
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#18181b] border border-[#27272a] rounded text-white placeholder-[#71717a] focus:outline-none focus:border-[#2563eb] transition-colors"
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              type="button"
              className="absolute right-2 text-[#777777] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Categorized Endpoint Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5 text-xs">
        {filteredGroups.length === 0 ? (
          <div className="px-3 py-6 text-center text-[#777777] text-xs">
            No endpoints match "{filter}"
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-white tracking-wide">
                <span>{group.title}</span>
                <span className="text-[9px] uppercase tracking-wider text-[#737373] font-mono">
                  {group.authBadge}
                </span>
              </div>
              <div className="pt-1 space-y-0.5">
                {group.endpoints.map((ep: EndpointDoc) => {
                  const isActive = ep.id === selectedEndpointId;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => onSelectEndpoint(ep.id)}
                      type="button"
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors text-xs ${
                        isActive
                          ? 'bg-[#1e1e24] text-white border border-[#2e2e38] font-medium shadow-xs'
                          : 'text-[#9ca3af] hover:bg-[#18181b] hover:text-white border border-transparent'
                      }`}
                    >
                      <span className="truncate pr-1">{ep.title}</span>
                      <span className={`font-mono text-[10px] ml-2 ${getMethodBadgeClass(ep.method)}`}>
                        {ep.method}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
};
