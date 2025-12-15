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
            console.log('getCurrentUser response:', response);
            
            // Handle API response structure: check both response.data and response.content
            let userData: any = null;
            
            // Check for content structure (actual API format)
            if ((response as any).content) {
              userData = (response as any).content;
              console.log('User data found in response.content');
            }
            // Check for data structure (standard ResponseDTO format)
            else if (response.data) {
              userData = response.data;
              console.log('User data found in response.data');
            }
            // Check if response itself is the user data
            else if ((response as any).id || (response as any).email) {
              userData = response;
              console.log('User data found at root level');
            }
            
            if (userData) {
              // Only allow admin role to access
              const userRole = userData.role?.toLowerCase();
              console.log('User role:', userRole);
              
              if (userRole === 'admin') {
                setAdmin({
                  id: userData.id || userData.userId || '',
                  name: userData.name || 'Admin User',
                  email: userData.email || '',
                  role: 'admin',
                });
                console.log('Admin authenticated successfully');
              } else {
                // User is not an admin, clear token and deny access
                console.error('User is not admin, role:', userRole);
                localStorage.removeItem('adminToken');
                sessionStorage.removeItem('adminToken');
                setAdmin(null);
              }
            } else {
              // No user data found, check if response indicates success
              if (response.success || (response as any).code === '00') {
                console.warn('Response indicates success but no user data found');
              }
              // Invalid token, clear it
              localStorage.removeItem('adminToken');
              sessionStorage.removeItem('adminToken');
              setAdmin(null);
            }
          } catch (error) {
            console.error('Token validation failed:', error);
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