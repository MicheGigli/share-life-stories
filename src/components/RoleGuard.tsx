import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRoles, UserRole } from '@/hooks/useRoles';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole: UserRole;
  fallbackPath?: string;
}

export const RoleGuard = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/' 
}: RoleGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, loading: roleLoading } = useRoles();

  // Show loading state while checking authentication and roles
  if (authLoading || roleLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if user doesn't have required role
  if (!hasRole(requiredRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};
