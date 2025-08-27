import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // Check localStorage safely for immediate authentication check
  const getStoredUser = () => {
    if (typeof window === 'undefined') return null;
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem('user'); // Clear corrupted data
      return null;
    }
  };

  const initialUser = getStoredUser();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    initialData: initialUser,
    staleTime: 0, // Always check with server
  });

  // If there's a 401 error, clear localStorage
  if (error && error.message?.includes('401')) {
    localStorage.removeItem('user');
  }

  return {
    user: user as User | null,
    isLoading,
    isAuthenticated: !!user && !error,
    logout: async () => {
      try {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include'
        });
      } catch (e) {
        console.error('Logout API failed:', e);
      } finally {
        localStorage.removeItem('user');
        window.location.href = '/auth';
      }
    }
  };
}