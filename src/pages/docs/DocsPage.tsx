import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { TopNav } from '@/components/shared/TopNav';
import { ENDPOINT_GROUPS, ALL_ENDPOINTS, getEndpointById } from './docsData';
import { DocsHeader } from './components/DocsHeader';
import { AuthCalloutBanner } from './components/AuthCalloutBanner';
import { EndpointSidebar } from './components/EndpointSidebar';
import { EndpointSpecs } from './components/EndpointSpecs';
import { CodeConsole } from './components/CodeConsole';
import { ApiKeyModal } from './components/ApiKeyModal';

export const DocsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Read endpoint from URL hash (e.g. #create-execution) or query parameter (?endpoint=create-execution)
  const hashEndpoint = location.hash ? location.hash.replace('#', '') : '';
  const searchEndpoint = new URLSearchParams(location.search).get('endpoint') || '';

  const [overrideEndpointId, setOverrideEndpointId] = useState<string>('');

  const activeEndpointId =
    overrideEndpointId && getEndpointById(overrideEndpointId)
      ? overrideEndpointId
      : hashEndpoint && getEndpointById(hashEndpoint)
      ? hashEndpoint
      : searchEndpoint && getEndpointById(searchEndpoint)
      ? searchEndpoint
      : 'create-execution';

  const { isAuthenticated } = useAuthStore();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const handleSelectEndpoint = (id: string) => {
    setOverrideEndpointId(id);
    navigate(`/docs#${id}`, { replace: true });
    // Scroll content to top on endpoint switch
    const mainEl = document.querySelector('[data-purpose="documentation-workspace"]');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  };

  const selectedEndpoint = getEndpointById(activeEndpointId) || ALL_ENDPOINTS[0];

  // Calculate previous and next endpoints for pagination controls
  const currentIndex = ALL_ENDPOINTS.findIndex((ep) => ep.id === selectedEndpoint.id);
  const prevEndpoint = currentIndex > 0 ? ALL_ENDPOINTS[currentIndex - 1] : undefined;
  const nextEndpoint =
    currentIndex < ALL_ENDPOINTS.length - 1 ? ALL_ENDPOINTS[currentIndex + 1] : undefined;

  return (
    <div className="min-h-screen flex flex-col font-sans text-[var(--text-secondary)] bg-[var(--surface-canvas)] transition-colors duration-150">
      {/* Top Application Header */}
      {isAuthenticated ? (
        <TopNav />
      ) : (
        <DocsHeader onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
      )}

      {/* Main 3-Column API Reference Workspace */}
      <div className="flex flex-1 w-full max-w-[1920px] mx-auto overflow-hidden">
        {/* Left Sticky Sidebar */}
        <EndpointSidebar
          groups={ENDPOINT_GROUPS}
          selectedEndpointId={selectedEndpoint.id}
          onSelectEndpoint={handleSelectEndpoint}
        />

        {/* Center & Right Documentation Workspace */}
        <main
          className="flex-1 flex flex-col min-w-0 overflow-y-auto"
          data-purpose="documentation-workspace"
        >
          {/* Top Auth Mode Callout */}
          <AuthCalloutBanner onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />

          {/* Center Technical Specifications & Right Code Console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 lg:p-6 flex-1 items-start">
            <EndpointSpecs
              endpoint={selectedEndpoint}
              prevEndpoint={prevEndpoint}
              nextEndpoint={nextEndpoint}
              onNavigate={handleSelectEndpoint}
            />

            <CodeConsole key={selectedEndpoint.id} endpoint={selectedEndpoint} />
          </div>
        </main>
      </div>

      {/* Modal for Tenant API Keys & Session Tokens */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
};
