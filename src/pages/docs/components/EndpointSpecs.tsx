import React, { useState } from 'react';
import { Copy, Check, Key, AlertTriangle } from 'lucide-react';
import type { EndpointDoc, HttpMethod } from '../types';

interface EndpointSpecsProps {
  endpoint: EndpointDoc;
  prevEndpoint?: EndpointDoc;
  nextEndpoint?: EndpointDoc;
  onNavigate: (id: string) => void;
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

function getResponseColorClass(color: string): string {
  switch (color) {
    case 'emerald':
      return 'text-emerald-400 font-semibold';
    case 'amber':
      return 'text-amber-400 font-semibold';
    case 'red':
      return 'text-red-400 font-semibold';
    default:
      return 'text-blue-400 font-semibold';
  }
}

export const EndpointSpecs: React.FC<EndpointSpecsProps> = ({
  endpoint,
  prevEndpoint,
  nextEndpoint,
  onNavigate,
}) => {
  const [copiedPath, setCopiedPath] = useState(false);

  const handleCopyPath = () => {
    navigator.clipboard.writeText(endpoint.path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  return (
    <article className="xl:col-span-7 space-y-8 min-w-0" data-purpose="endpoint-specs">
      {/* Category Tracker & Title */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-[#888888] lowercase block">
          {endpoint.category}
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          {endpoint.title}
        </h1>
      </div>

      {/* Method & Endpoint Strip */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center bg-[#181818] border border-[#282828] rounded px-2.5 py-1 font-mono text-xs">
          <span className={`mr-2 text-[11px] ${getMethodBadgeClass(endpoint.method)}`}>
            {endpoint.method}
          </span>
          <span className="text-white select-all font-mono">{endpoint.path}</span>
          <button
            onClick={handleCopyPath}
            type="button"
            className="ml-2 text-[#777777] hover:text-white transition-colors"
            title="Copy path"
          >
            {copiedPath ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c1c1c] border border-[#282828] text-[11px] text-[#A0A0A0]">
          <Key className="w-3 h-3 text-[#777777]" />
          <span>{endpoint.auth}</span>
        </div>
      </div>

      {/* Narrative Description Section */}
      <div
        className="text-xs text-[#BCBCBC] leading-relaxed space-y-3 prose-invert"
        dangerouslySetInnerHTML={{
          __html: endpoint.description
            .split('\n\n')
            .map((p) => `<p>${p}</p>`)
            .join(''),
        }}
      />

      {/* Optional Warning Callout */}
      {(endpoint.hasWarning || endpoint.warningCallout) && endpoint.warningCallout && (
        <div className="border border-[#D97706]/40 bg-[#D97706]/10 rounded-lg p-3 text-xs text-[#FBBF24]">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white block">
                {endpoint.warningCallout.title}
              </span>
              <p className="text-[#E0E0E0] text-[11px] leading-normal">
                {endpoint.warningCallout.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Parameters Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white">
          {endpoint.method === 'GET' ? 'Path & Query parameters' : 'Body & Path parameters'}
        </h2>
        <div className="border border-[#282828] rounded-lg divide-y divide-[#222222] bg-[#181818] overflow-hidden text-xs">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-3.5 py-2.5 font-mono text-[11px] text-[#777777] bg-[#141414]">
            <div className="col-span-4">Parameter</div>
            <div className="col-span-3">Type</div>
            <div className="col-span-5">Description</div>
          </div>
          {/* Parameter Rows */}
          <div className="divide-y divide-[#222222]">
            {endpoint.params.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-[#777777] text-xs">
                No request parameters required.
              </div>
            ) : (
              endpoint.params.map((param) => (
                <div key={param.name} className="grid grid-cols-12 px-3.5 py-3 gap-2">
                  <div className="col-span-4 font-mono font-medium text-white">
                    {param.name}
                    <span
                      className={`block text-[10px] font-mono ${
                        param.req === 'required' ? 'text-amber-500' : 'text-[#777777]'
                      }`}
                    >
                      {param.req}
                    </span>
                  </div>
                  <div className="col-span-3 font-mono text-[#888888] text-[11px]">
                    {param.type}
                  </div>
                  <div
                    className="col-span-5 text-[#AAAAAA] text-[11px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: param.desc }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Responses Table */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white">Responses</h2>
        <div className="border border-[#282828] rounded-lg divide-y divide-[#222222] bg-[#181818] overflow-hidden text-xs">
          {/* Response Table Header */}
          <div className="grid grid-cols-12 px-3.5 py-2.5 font-mono text-[11px] text-[#777777] bg-[#141414]">
            <div className="col-span-2">Code</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-7">Description</div>
          </div>
          {/* Response Rows */}
          <div className="divide-y divide-[#222222]">
            {endpoint.responses.map((resp) => (
              <div key={resp.code} className="grid grid-cols-12 px-3.5 py-3 gap-2 items-start">
                <div className={`col-span-2 font-mono ${getResponseColorClass(resp.color)}`}>
                  {resp.code}
                </div>
                <div className="col-span-3 font-mono text-white text-[11px]">{resp.label}</div>
                <div
                  className="col-span-7 text-[#AAAAAA] text-[11px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: resp.text }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Pagination Controls */}
      <div className="pt-6 border-t border-[#282828] flex justify-between items-center text-xs text-[#888888]">
        {prevEndpoint ? (
          <button
            onClick={() => onNavigate(prevEndpoint.id)}
            type="button"
            className="hover:text-white transition-colors flex flex-col items-start gap-1 text-left"
          >
            <span className="text-[10px]">← Previous</span>
            <span className="text-white font-medium">{prevEndpoint.title}</span>
          </button>
        ) : (
          <div />
        )}

        {nextEndpoint && (
          <button
            onClick={() => onNavigate(nextEndpoint.id)}
            type="button"
            className="hover:text-white transition-colors flex flex-col items-end gap-1 ml-auto text-right"
          >
            <span className="text-[10px]">Next →</span>
            <span className="text-blue-400 font-medium hover:underline">
              {nextEndpoint.title}
            </span>
          </button>
        )}
      </div>
    </article>
  );
};
