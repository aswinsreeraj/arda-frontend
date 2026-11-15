/**
 * Returns the default role-based dashboard landing route for an authenticated user.
 */
export const getDefaultDashboard = (role?: string): string => {
  switch (role) {
    case 'super_admin':
      return '/platform';
    case 'company_admin':
      return '/org';
    case 'agent_developer':
      return '/agents';
    case 'reviewer':
      return '/reviews';
    default:
      return '/runs';
  }
};
