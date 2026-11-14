import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/app/layouts/AppLayout';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { ProtectedRoute, PublicOnlyRoute, RoleGuard } from './guards';
import { AuthPage } from '@/pages/auth/AuthPage';
import { ReviewQueuePage } from '@/features/reviews/ReviewQueuePage';
import { AgentRegistryPage } from '@/features/agents/AgentRegistryPage';
import { RunsPage } from '@/features/runs/RunsPage';
import { AuditTrailPage } from '@/features/audit/AuditTrailPage';
import { OrgPage } from '@/features/organization/OrgPage';
import { NotFoundPage } from '@/features/resilience/NotFoundPage';
import { ForbiddenPage } from '@/features/resilience/ForbiddenPage';
import { ServerErrorPage } from '@/features/resilience/ServerErrorPage';
import { ErrorBoundary } from '@/features/resilience/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <AuthLayout />
      </PublicOnlyRoute>
    ),
    children: [
      {
        index: true,
        element: <AuthPage />,
      },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <ErrorBoundary>
          <AppLayout />
        </ErrorBoundary>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/reviews" replace />,
      },
      {
        path: 'reviews',
        element: (
          <RoleGuard allowedRoles={['reviewer', 'company_admin', 'super_admin']}>
            <ReviewQueuePage />
          </RoleGuard>
        ),
      },
      {
        path: 'reviews/:caseId',
        element: (
          <RoleGuard allowedRoles={['reviewer', 'company_admin', 'super_admin']}>
            <ReviewQueuePage />
          </RoleGuard>
        ),
      },
      {
        path: 'agents',
        element: (
          <RoleGuard allowedRoles={['agent_developer', 'company_admin', 'super_admin']}>
            <AgentRegistryPage />
          </RoleGuard>
        ),
      },
      {
        path: 'runs',
        element: <RunsPage />,
      },
      {
        path: 'audit',
        element: (
          <RoleGuard allowedRoles={['company_admin', 'super_admin']}>
            <AuditTrailPage />
          </RoleGuard>
        ),
      },
      {
        path: 'org',
        element: (
          <RoleGuard allowedRoles={['company_admin', 'super_admin']}>
            <OrgPage />
          </RoleGuard>
        ),
      },
    ],
  },
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
