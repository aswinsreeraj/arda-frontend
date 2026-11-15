import React, { useState } from 'react';
import { Copy, Check, Play, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import type { EndpointDoc } from '../types';
import { apiClient } from '@/services/api';

type CodeLanguage = 'curl' | 'go' | 'python' | 'typescript' | 'try-it';

interface CodeConsoleProps {
  endpoint: EndpointDoc;
}

export const CodeConsole: React.FC<CodeConsoleProps> = ({ endpoint }) => {
  const [activeLang, setActiveLang] = useState<CodeLanguage>('curl');
  const [selectedResponseCode, setSelectedResponseCode] = useState<string>(
    endpoint.responses[0]?.code || '200'
  );
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Try-It interactive playground state initialized per endpoint
  const [requestBodyInput, setRequestBodyInput] = useState<string>(
    endpoint.tryItConfig?.defaultBody || '{}'
  );
  const [pathParamInput, setPathParamInput] = useState<string>(
    endpoint.tryItConfig?.defaultPathParams?.id || ''
  );
  const [isRunning, setIsRunning] = useState(false);
  const [liveResponse, setLiveResponse] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    data: unknown;
  } | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);

  const activeResponse =
    endpoint.responses.find((r) => r.code === selectedResponseCode) || endpoint.responses[0];

  const handleCopySnippet = () => {
    let textToCopy = '';
    if (activeLang === 'curl') textToCopy = endpoint.snippets.curl;
    else if (activeLang === 'go') textToCopy = endpoint.snippets.go;
    else if (activeLang === 'python') textToCopy = endpoint.snippets.python;
    else if (activeLang === 'typescript') textToCopy = endpoint.snippets.typescript;

    navigator.clipboard.writeText(textToCopy);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyResponse = () => {
    if (activeResponse) {
      navigator.clipboard.writeText(activeResponse.body);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  const handleExecuteTryIt = async () => {
    setIsRunning(true);
    setLiveError(null);
    setLiveResponse(null);

    const startTime = performance.now();
    try {
      // Resolve path
      let resolvedPath = endpoint.path.replace('/api/v1', '');
      if (pathParamInput && resolvedPath.includes(':id')) {
        resolvedPath = resolvedPath.replace(':id', pathParamInput);
      } else if (pathParamInput && resolvedPath.includes(':versionId')) {
        resolvedPath = resolvedPath.replace(':versionId', pathParamInput);
      } else if (pathParamInput && resolvedPath.includes(':tenantId')) {
        resolvedPath = resolvedPath.replace(':tenantId', pathParamInput);
      }

      let parsedBody = undefined;
      if (endpoint.method !== 'GET' && requestBodyInput.trim()) {
        try {
          parsedBody = JSON.parse(requestBodyInput);
        } catch {
          throw new Error('Invalid JSON payload in request body');
        }
      }

      // Execute request via configured apiClient (or fallback gracefully)
      const res = await apiClient.request({
        url: resolvedPath,
        method: endpoint.method,
        data: parsedBody,
      });

      const durationMs = Math.round(performance.now() - startTime);
      setLiveResponse({
        status: res.status,
        statusText: res.statusText || 'OK',
        durationMs,
        data: res.data,
      });
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - startTime);
      const axiosErr = err as { response?: { status: number; statusText: string; data: unknown }; message?: string };
      if (axiosErr.response) {
        setLiveResponse({
          status: axiosErr.response.status,
          statusText: axiosErr.response.statusText || 'Error',
          durationMs,
          data: axiosErr.response.data,
        });
      } else {
        setLiveError(axiosErr.message || 'Request failed. Is the API gateway online?');
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="xl:col-span-5 space-y-4 sticky top-20 min-w-0" data-purpose="code-console">
      {/* Request Panel */}
      <div className="bg-[#141414] border border-[#282828] rounded-lg overflow-hidden shadow-xl">
        {/* Console Header Tabs */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#181818] border-b border-[#282828] text-xs">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveLang('curl')}
              type="button"
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] transition-colors ${
                activeLang === 'curl'
                  ? 'bg-[#242424] text-white font-medium border border-[#333333]'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveLang('go')}
              type="button"
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] transition-colors ${
                activeLang === 'go'
                  ? 'bg-[#242424] text-white font-medium border border-[#333333]'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              Go
            </button>
            <button
              onClick={() => setActiveLang('python')}
              type="button"
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] transition-colors ${
                activeLang === 'python'
                  ? 'bg-[#242424] text-white font-medium border border-[#333333]'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setActiveLang('typescript')}
              type="button"
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] transition-colors ${
                activeLang === 'typescript'
                  ? 'bg-[#242424] text-white font-medium border border-[#333333]'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              TypeScript
            </button>
            <button
              onClick={() => setActiveLang('try-it')}
              type="button"
              className={`px-2.5 py-0.5 rounded font-mono text-[11px] transition-colors flex items-center space-x-1 ${
                activeLang === 'try-it'
                  ? 'bg-[#2563EB] text-white font-medium shadow-xs'
                  : 'text-[#888888] hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Try it</span>
            </button>
          </div>

          {activeLang !== 'try-it' && (
            <button
              onClick={handleCopySnippet}
              type="button"
              className="flex items-center space-x-1 text-[#888888] hover:text-white text-[11px] transition-colors"
            >
              {copiedSnippet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Console Body: Code or Try It */}
        {activeLang === 'try-it' ? (
          <div className="p-3.5 space-y-3 text-xs bg-[#141414]">
            {endpoint.path.includes(':') && (
              <div>
                <label className="block text-[11px] font-mono text-[#888888] mb-1">
                  Path Parameter (ID / UUID)
                </label>
                <input
                  type="text"
                  value={pathParamInput}
                  onChange={(e) => setPathParamInput(e.target.value)}
                  placeholder="e.g. a8b1c2d3-e4f5-4a1b-9c2d-3e4f5a1b2c3d"
                  className="w-full bg-[#181818] border border-[#282828] rounded px-2.5 py-1.5 font-mono text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            )}

            {endpoint.method !== 'GET' && (
              <div>
                <label className="block text-[11px] font-mono text-[#888888] mb-1">
                  Request Payload (JSON)
                </label>
                <textarea
                  rows={6}
                  value={requestBodyInput}
                  onChange={(e) => setRequestBodyInput(e.target.value)}
                  className="w-full bg-[#181818] border border-[#282828] rounded p-2.5 font-mono text-[11px] text-[#dadada] leading-relaxed focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-[#777777] font-mono">
                Sends live call to local gateway
              </span>
              <button
                onClick={handleExecuteTryIt}
                disabled={isRunning}
                type="button"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white px-3 py-1.5 rounded font-medium transition-colors text-xs flex items-center space-x-1.5 shadow-sm"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 font-mono text-xs overflow-x-auto leading-relaxed max-h-[360px] bg-[#141414]">
            <pre className="text-[#DADADA] whitespace-pre">
              <code>
                {activeLang === 'curl' && endpoint.snippets.curl}
                {activeLang === 'go' && endpoint.snippets.go}
                {activeLang === 'python' && endpoint.snippets.python}
                {activeLang === 'typescript' && endpoint.snippets.typescript}
              </code>
            </pre>
          </div>
        )}
      </div>

      {/* Response Panel */}
      <div className="bg-[#141414] border border-[#282828] rounded-lg overflow-hidden shadow-xl">
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#181818] border-b border-[#282828] text-xs">
          <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
            {activeLang === 'try-it' && liveResponse ? (
              <span
                className={`px-2.5 py-0.5 rounded font-mono text-[11px] font-medium border ${
                  liveResponse.status < 300
                    ? 'bg-[#1F2E23] text-emerald-400 border-emerald-500/30'
                    : liveResponse.status < 400
                    ? 'bg-[#2A241A] text-amber-400 border-amber-500/30'
                    : 'bg-[#2E1A1A] text-red-400 border-red-500/30'
                }`}
              >
                {liveResponse.status} {liveResponse.statusText} · {liveResponse.durationMs}ms
              </span>
            ) : (
              endpoint.responses.map((resp) => {
                const isSelected = resp.code === selectedResponseCode;
                let activeStyle = 'bg-[#1F2E23] text-emerald-400 border border-emerald-500/30';
                if (resp.color === 'amber') {
                  activeStyle = 'bg-[#2A241A] text-amber-400 border border-amber-500/30';
                } else if (resp.color === 'red') {
                  activeStyle = 'bg-[#2E1A1A] text-red-400 border border-red-500/30';
                }

                return (
                  <button
                    key={resp.code}
                    onClick={() => setSelectedResponseCode(resp.code)}
                    type="button"
                    className={`px-2.5 py-0.5 rounded font-mono text-[11px] transition-colors whitespace-nowrap ${
                      isSelected
                        ? `${activeStyle} font-medium`
                        : 'text-[#888888] hover:bg-[#202020]'
                    }`}
                  >
                    {resp.code} {resp.label}
                  </button>
                );
              })
            )}
          </div>

          <button
            onClick={handleCopyResponse}
            type="button"
            className="flex items-center space-x-1 text-[#888888] hover:text-white text-[11px] transition-colors shrink-0 ml-2"
          >
            {copiedResponse ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Snippet Container */}
        <div className="p-3.5 font-mono text-xs overflow-x-auto leading-relaxed max-h-[380px] bg-[#141414]">
          {liveError ? (
            <div className="flex items-start space-x-2 text-red-400 text-xs py-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{liveError}</span>
            </div>
          ) : activeLang === 'try-it' && liveResponse ? (
            <pre className="text-[#DADADA] whitespace-pre">
              <code>{JSON.stringify(liveResponse.data, null, 2)}</code>
            </pre>
          ) : activeResponse ? (
            <pre className="text-[#DADADA] whitespace-pre">
              <code>{activeResponse.body}</code>
            </pre>
          ) : (
            <span className="text-[#777777]">No response schema recorded</span>
          )}
        </div>
      </div>
    </section>
  );
};
