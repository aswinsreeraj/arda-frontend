import React from 'react';

export const OrgPage: React.FC = () => {
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold text-white tracking-tight">Organization & Access Management</h1>
      <p className="text-xs text-neutral-400">
        Multi-tenant membership, RBAC role assignment, and SSO identity provider settings.
      </p>
      <div className="rounded-lg border border-[#282828] bg-[#181818] p-12 text-center text-xs text-neutral-500 font-mono">
        Organization & Access management ready for Phase 2 integration.
      </div>
    </main>
  );
};
