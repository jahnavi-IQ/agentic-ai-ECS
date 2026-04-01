// Path:\src\components\providers\AuthProvider.tsx

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, fetchUserAttributes, signOut as amplifySignOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { configureAmplify } from '@/lib/amplify-config';

interface User {
  id: string;
  email?: string;
  phone_number?: string;
  email_verified?: boolean;
  phone_number_verified?: boolean;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

if (typeof window !== 'undefined') {
  configureAmplify();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (): Promise<User | null> => {
    console.log('🔍 AuthProvider: Loading user...');
    try {
      const currentUser = await getCurrentUser();
      console.log('✅ getCurrentUser succeeded:', currentUser);
      
      // Try to fetch attributes, but handle Identity Pool errors gracefully
      let attributes;
      try {
        attributes = await fetchUserAttributes();
        console.log('✅ fetchUserAttributes succeeded:', attributes);
      } catch (attrError: unknown) {
        const err = attrError as { name?: string; message?: string };
        
        // Ignore Identity Pool errors - we don't need it
        if (err.message?.includes('identity pool') || 
            err.message?.includes('IAM roles') ||
            err.name === 'InvalidIdentityPoolConfigurationException') {
          console.warn('⚠️ Identity Pool error (ignored):', err.message);
          
          // Return user with just the ID if we can't get attributes
          const basicUser: User = {
            id: currentUser.userId,
            name: currentUser.username || 'User',
          };
          
          console.log('✅ User loaded (basic info only):', basicUser);
          setUser(basicUser);
          setLoading(false);
          return basicUser;
        }
        
        // Re-throw if it's a different error
        throw attrError;
      }
      
      const userData: User = {
        id: currentUser.userId,
        email: attributes.email,
        phone_number: attributes.phone_number,
        email_verified: attributes.email_verified === 'true',
        phone_number_verified: attributes.phone_number_verified === 'true',
        name: attributes.name || attributes.email?.split('@')[0] || attributes.phone_number || 'User',
      };
      
      console.log('✅ User loaded successfully:', userData);
      setUser(userData);
      setLoading(false);
      return userData;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      
      console.log('ℹ️ Load user error:', err.name, err.message);
      
      if (err.name === 'UserUnAuthenticatedException') {
        console.log('ℹ️ No authenticated user');
      } else {
        console.error('❌ Unexpected error loading user:', err);
      }
      
      setUser(null);
      setLoading(false);
      return null;
    }
  };

  const refreshUser = async (): Promise<void> => {
    await loadUserData();
  };

  // Initial load on mount
  useEffect(() => {
    console.log('🚀 AuthProvider mounted - loading user...');
    
    let isMounted = true;
    
    const initAuth = async () => {
      if (isMounted) {
        await loadUserData();
      }
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for auth Hub events
  useEffect(() => {
    console.log('👂 Setting up Auth Hub listener...');
    
    const hubListener = Hub.listen('auth', async ({ payload }) => {
      const { event } = payload;
      console.log('🔔 Auth Hub Event:', event);
      
      switch (event) {
        case 'signedIn':
          console.log('✅ SignedIn event received - loading user...');
          await new Promise(resolve => setTimeout(resolve, 500));
          await loadUserData();
          break;
          
        case 'signedOut':
          console.log('🚪 SignedOut event received - clearing user...');
          setUser(null);
          break;
          
        case 'tokenRefresh':
          console.log('🔄 Token refreshed');
          break;
          
        case 'tokenRefresh_failure':
          console.log('❌ Token refresh failed - signing out');
          setUser(null);
          break;
      }
    });

    return () => {
      console.log('🔇 Removing Auth Hub listener');
      hubListener();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      console.log('🚪 Signing out...');
      await amplifySignOut({ global: true });
      setUser(null);
      console.log('✅ Signed out successfully');
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      console.error('❌ Sign out error:', err.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signOut: handleSignOut,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}