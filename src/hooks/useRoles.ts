import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useRoles = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRole();
    } else {
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default to user role if not found
      } else {
        setUserRole(data.role as UserRole);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    if (!userRole) return false;
    
    // Admin has all permissions
    if (userRole === 'admin') return true;
    
    // Moderator has moderator and user permissions
    if (userRole === 'moderator' && (role === 'moderator' || role === 'user')) return true;
    
    // User has only user permissions
    if (userRole === 'user' && role === 'user') return true;
    
    return false;
  };

  const isAdmin = () => hasRole('admin');
  const isModerator = () => hasRole('moderator') || isAdmin();
  const isUser = () => hasRole('user') || isModerator();

  return {
    userRole,
    loading,
    hasRole,
    isAdmin,
    isModerator,
    isUser,
    refetch: fetchUserRole
  };
};
