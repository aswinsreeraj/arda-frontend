import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/app/layouts/AppLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { ProtectedRoute, RoleGuard } from './guards';
import { LandingPage } from '@/pages/landing/LandingPage';
import { GuidePage } from '@/pages/guide/GuidePage';
import { DocsPage } from '@/pages/docs/DocsPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { ReviewQueuePage } from '@/features/reviews/ReviewQueuePage';
import { AgentRegistryPage } from '@/features/agents/AgentRegistryPage';
import { RunsPage } from '@/features/runs/RunsPage';
import { AuditTrailPage } from '@/features/audit/AuditTrailPage';
import { OrgPage } from '@/features/organization/OrgPage';
import { PlatformPage } from '@/features/platform/PlatformPage';
import { ForbiddenPage } from '@/features/resilience/ForbiddenPage';
import { NotFoundPage } from '@/features/resilience/NotFoundPage';
import { ServerErrorPage } from '@/features/resilience/ServerErrorPage';
import { ErrorBoundary } from '@/features/resilience/ErrorBoundary';

export const router = createBrowserRouter([
  // Public Landing Page as Root Route
  {
    path: '/',
    element: <LandingPage />,
  },

  // Documentation & Getting Started Guide
  {
    path: '/guide',
    element: <GuidePage />,
  },
  {
    path: '/getting-started',
    element: <GuidePage />,
  },

  // API Reference & Documentation
  {
    path: '/docs',
    element: <DocsPage />,
  },
  {
    path: '/api-reference',
    element: <DocsPage />,
  },

  // Authentication Flow (Sign In, Accept Invite & Org Registration)
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <AuthPage />,
      },
    ],
  },
  {
    path: '/accept-invite',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <AuthPage />,
      },
    ],
  },
  {
    path: '/invite',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <AuthPage />,
      },
    ],
  },
  {
    path: '/signup',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <AuthPage />,
      },
    ],
  },
  {
    path: '/register',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <AuthPage />,
      },
    ],
  },

  // Governance App Console Routes (Strictly bound to backend RBAC policy)
  {
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <AppLayout />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/reviews',
        element: (
          <RoleGuard allowedRoles={['reviewer', 'company_admin']}>
            <ReviewQueuePage />
          </RoleGuard>
        ),
      },
      {
        path: '/reviews/:caseId',
        element: (
          <RoleGuard allowedRoles={['reviewer', 'company_admin']}>
            <ReviewQueuePage />
          </RoleGuard>
        ),
      },
      {
        path: '/agents',
        element: (
          <RoleGuard allowedRoles={['agent_developer', 'company_admin']}>
            <AgentRegistryPage />
          </RoleGuard>
        ),
      },
      {
        path: '/runs',
        element: <RunsPage />,
      },
      {
        path: '/audit',
        element: (
          <RoleGuard allowedRoles={['company_admin', 'reviewer', 'agent_developer']}>
            <AuditTrailPage />
          </RoleGuard>
        ),
      },
      {
        path: '/org',
        element: (
          <RoleGuard allowedRoles={['company_admin']}>
            <OrgPage />
          </RoleGuard>
        ),
      },
      {
        path: '/admin',
        element: (
          <RoleGuard allowedRoles={['company_admin']}>
            <OrgPage />
          </RoleGuard>
        ),
      },
      {
        path: '/platform',
        element: (
          <RoleGuard allowedRoles={['company_admin', 'super_admin']}>
            <PlatformPage />
          </RoleGuard>
        ),
      },
      {
        path: '/super-admin',
        element: (
          <RoleGuard allowedRoles={['company_admin', 'super_admin']}>
            <PlatformPage />
          </RoleGuard>
        ),
      },
    ],
  },

  // Resilience & Error Routes
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '/500',
    element: <ServerErrorPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
