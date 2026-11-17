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

const STORAGE_PREFIX = 'arda_mcp_servers_';

const BASELINE_SERVERS: McpServerDefinition[] = [];

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

export const getStoredMcpServers = (
  tenantId: string,
  tools: ToolDefinition[] = [],
  credentials: Credential[] = []
): McpServerDefinition[] => {
  let customServers: McpServerDefinition[] = [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tenantId}`);
    if (raw) {
      customServers = JSON.parse(raw);
    }
  } catch {
    customServers = [];
  }

  // Merge baseline and custom servers
  const serverMap = new Map<string, McpServerDefinition>();
  for (const s of BASELINE_SERVERS) {
    serverMap.set(s.id, s);
  }
  for (const s of customServers) {
    serverMap.set(s.id, s);
  }

  // Also discover any server IDs found in tool handlers
  for (const t of tools) {
    const parsed = parseMcpHandlerId(t.handler_id);
    if (parsed && !serverMap.has(parsed.serverId)) {
      serverMap.set(parsed.serverId, {
        id: parsed.serverId,
        name: `${parsed.serverId.charAt(0).toUpperCase() + parsed.serverId.slice(1)} MCP`,
        description: `Discovered from registered tool handler ${t.handler_id}`,
        transport: 'streamable_http',
        endpoint: `http://${parsed.serverId}.internal:8080/mcp`,
        status: 'CONNECTED',
        created_at: t.created_at || new Date().toISOString(),
      });
    }
  }

  // Also discover any server IDs found in credentials with category 'mcp'
  for (const c of credentials) {
    if (c.category === 'mcp' && !serverMap.has(c.provider)) {
      serverMap.set(c.provider, {
        id: c.provider,
        name: `${c.provider.charAt(0).toUpperCase() + c.provider.slice(1)} Server`,
        description: 'Vault-secured MCP server endpoint',
        transport: 'streamable_http',
        endpoint: `https://${c.provider}.internal.acme.com/mcp`,
        status: 'CONNECTED',
        created_at: c.created_at || new Date().toISOString(),
      });
    }
  }

  return Array.from(serverMap.values());
};

export const saveMcpServer = (tenantId: string, server: McpServerDefinition): void => {
  try {
    const current = getStoredMcpServers(tenantId);
    const updated = current.filter((s) => s.id !== server.id);
    updated.push(server);
    localStorage.setItem(`${STORAGE_PREFIX}${tenantId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save MCP server to storage:', err);
  }
};

export const deleteMcpServerFromStorage = (tenantId: string, serverId: string): void => {
  try {
    const current = getStoredMcpServers(tenantId);
    const updated = current.filter((s) => s.id !== serverId);
    localStorage.setItem(`${STORAGE_PREFIX}${tenantId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete MCP server from storage:', err);
  }
};
