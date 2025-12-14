import { useState, useEffect } from 'react';
import { userServiceAPI } from '../services/api/userService';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated via token
    const checkAuth = async () => {
      try {
        // Check for token in localStorage or sessionStorage
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        
        if (token) {
          // Validate the token with the backend
          try {
            const response = await userServiceAPI.getCurrentUser();
            
            if (response.success && response.data) {
              const userData = response.data;
              // Only allow admin role to access
              const userRole = userData.role?.toLowerCase();
              if (userRole === 'admin') {
                setAdmin({
                  id: userData.id,
                  name: userData.name,
                  email: userData.email,
                  role: 'admin',
                });
              } else {
                // User is not an admin, clear token and deny access
                localStorage.removeItem('adminToken');
                sessionStorage.removeItem('adminToken');
                setAdmin(null);
              }
            } else {
              // Invalid token, clear it
              localStorage.removeItem('adminToken');
              sessionStorage.removeItem('adminToken');
              setAdmin(null);
            }
          } catch (error) {
            // Token validation failed, clear it
            localStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminToken');
            setAdmin(null);
          }
        } else {
          setAdmin(null);
        }
      } catch (error) {
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    setAdmin(null);
    // Clear tokens from storage
    localStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminToken');
  };

  return {
    admin,
    isAuthenticated: !!admin,
    isAdmin: admin?.role === 'admin',
    isLoading,
    logout,
  };
}