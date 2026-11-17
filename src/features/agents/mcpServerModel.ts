import type { ToolDefinition, Credential } from './types';

export type McpTransport = 'streamable_http' | 'sse' | 'inprocess';

export interface McpServerDefinition {
  id: string; // Stable identifier, e.g. "mcp-tx-conn"
  name: string; // Friendly display name, e.g. "Transaction MCP Gateway"
  description: string;
  transport: McpTransport;
  endpoint: string; // URL or "inprocess"
  status: 'CONNECTED' | 'DISCONNECTED' | 'FAILED';
  created_at: string;
  updated_at?: string;
}

export interface RegisterMcpServerRequest {
  id: string;
  name: string;
  description: string;
  transport: McpTransport;
  endpoint: string;
  authToken?: string;
}

export const MCP_SERVER_META_TOOL_SUFFIX = '__server_meta__';
const STORAGE_PREFIX = 'arda_mcp_servers_';

export const parseMcpHandlerId = (handlerId: string): { serverId: string; toolName: string } | null => {
  if (!handlerId.startsWith('mcp:')) return null;
  const parts = handlerId.slice(4).split(':');
  if (parts.length < 2) return null;
  return {
    serverId: parts[0],
    toolName: parts.slice(1).join(':'),
  };
};

export const formatMcpHandlerId = (serverId: string, toolName: string): string => {
  return `mcp:${serverId.trim().toLowerCase()}:${toolName.trim()}`;
};

export const formatMcpServerMetaHandlerId = (serverId: string): string => {
  return formatMcpHandlerId(serverId, MCP_SERVER_META_TOOL_SUFFIX);
};

export const formatMcpServerMetaToolName = (serverId: string): string => {
  return `mcp_server_${serverId.trim().toLowerCase()}`;
};

export const isMcpServerMetaTool = (tool: Pick<ToolDefinition, 'handler_id' | 'name'>): boolean => {
  const parsed = parseMcpHandlerId(tool.handler_id);
  return parsed !== null && parsed.toolName === MCP_SERVER_META_TOOL_SUFFIX;
};

export const serializeMcpServerMeta = (
  server: Pick<McpServerDefinition, 'name' | 'description' | 'transport' | 'endpoint'>
): string => {
  return JSON.stringify({
    name: server.name,
    description: server.description,
    transport: server.transport,
    endpoint: server.endpoint,
  });
};

const parseMcpServerMeta = (
  raw: string
): Partial<Pick<McpServerDefinition, 'name' | 'description' | 'transport' | 'endpoint'>> => {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return {
        name: typeof parsed.name === 'string' ? parsed.name : undefined,
        description: typeof parsed.description === 'string' ? parsed.description : undefined,
        transport:
          parsed.transport === 'streamable_http' ||
          parsed.transport === 'sse' ||
          parsed.transport === 'inprocess'
            ? parsed.transport
            : undefined,
        endpoint: typeof parsed.endpoint === 'string' ? parsed.endpoint : undefined,
      };
    }
  } catch {
    // Fallback to defaults if description is not valid JSON
  }
  return {};
};

const getLegacyCachedServers = (tenantId: string): Map<string, McpServerDefinition> => {
  const map = new Map<string, McpServerDefinition>();
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tenantId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const s of parsed) {
          if (s && typeof s.id === 'string') {
            map.set(s.id.toLowerCase(), s as McpServerDefinition);
          }
        }
      }
    }
  } catch {
    // Ignore malformed cache
  }
  return map;
};

/**
 * Derives the tenant's MCP servers strictly from backend-persisted records:
 * 1. Backend sentinel metadata tools (`mcp:<id>:__server_meta__`)
 * 2. Registered MCP tool handlers (`mcp:<id>:<tool>`)
 * 3. Vaulted MCP credentials (`category === 'mcp'`)
 *
 * Unpersisted browser-local entries are ignored so all tenant users see the
 * exact same authoritative MCP server list across sessions.
 */
export const getStoredMcpServers = (
  tenantId: string,
  tools: ToolDefinition[] = [],
  credentials: Credential[] = []
): McpServerDefinition[] => {
  const serverMap = new Map<string, McpServerDefinition>();
  const legacyCache = getLegacyCachedServers(tenantId);

  // 1. Authoritative backend sentinel metadata records
  for (const t of tools) {
    if (!isMcpServerMetaTool(t)) continue;
    const parsed = parseMcpHandlerId(t.handler_id);
    if (!parsed) continue;
    const serverId = parsed.serverId.toLowerCase();
    const meta = parseMcpServerMeta(t.description);
    serverMap.set(serverId, {
      id: serverId,
      name: meta.name || `${serverId.charAt(0).toUpperCase() + serverId.slice(1)} MCP`,
      description: meta.description || 'Custom Model Context Protocol server',
      transport: meta.transport || 'streamable_http',
      endpoint: meta.endpoint || `http://${serverId}.internal:8080/mcp`,
      status: 'CONNECTED',
      created_at: t.created_at || new Date().toISOString(),
      updated_at: t.updated_at,
    });
  }

  // 2. Discover any server IDs found in regular tool handlers
  for (const t of tools) {
    if (isMcpServerMetaTool(t)) continue;
    const parsed = parseMcpHandlerId(t.handler_id);
    if (!parsed) continue;
    const serverId = parsed.serverId.toLowerCase();
    if (!serverMap.has(serverId)) {
      const cached = legacyCache.get(serverId);
      serverMap.set(serverId, {
        id: serverId,
        name: cached?.name || `${serverId.charAt(0).toUpperCase() + serverId.slice(1)} MCP`,
        description: cached?.description || `Discovered from registered tool handler ${t.handler_id}`,
        transport: cached?.transport || 'streamable_http',
        endpoint: cached?.endpoint || `http://${serverId}.internal:8080/mcp`,
        status: 'CONNECTED',
        created_at: t.created_at || new Date().toISOString(),
      });
    }
  }

  // 3. Discover any server IDs found in credentials with category 'mcp'
  for (const c of credentials) {
    if (c.category !== 'mcp') continue;
    const serverId = c.provider.toLowerCase();
    if (!serverMap.has(serverId)) {
      const cached = legacyCache.get(serverId);
      serverMap.set(serverId, {
        id: serverId,
        name: cached?.name || `${serverId.charAt(0).toUpperCase() + serverId.slice(1)} Server`,
        description: cached?.description || 'Vault-secured MCP server endpoint',
        transport: cached?.transport || 'streamable_http',
        endpoint: cached?.endpoint || `https://${serverId}.internal.acme.com/mcp`,
        status: 'CONNECTED',
        created_at: c.created_at || new Date().toISOString(),
      });
    }
  }

  return Array.from(serverMap.values());
};

export const deleteMcpServerFromStorage = (tenantId: string, serverId: string): void => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tenantId}`);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    const updated = parsed.filter(
      (s: { id?: string }) =>
        typeof s?.id === 'string' && s.id.toLowerCase() !== serverId.toLowerCase()
    );
    localStorage.setItem(`${STORAGE_PREFIX}${tenantId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete MCP server from storage:', err);
  }
};
