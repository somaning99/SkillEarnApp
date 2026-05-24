import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: any) => Promise<void>;
  updateUser: (newUser: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser({ ...userData, id: userData.id || userData._id });
          } else {
            console.warn(`Auth check failed with status ${res.status}`);
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (err) {
          console.error('Auth check error:', err);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      let errorMessage = 'Login failed';
      try {
        const text = await res.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server Error (${res.status}): ${text.substring(0, 100)}`;
        }
      } catch (e) {
        errorMessage = `Server Error (${res.status})`;
      }
      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await res.json();
    } catch (e) {
      throw new Error('Server returned OK but invalid JSON. This might be a server-side redirect or misconfiguration.');
    }
    
    const { user: userData, token } = result;
    localStorage.setItem('token', token);
    setUser({ ...userData, id: userData.id || userData._id });
  };

  const signup = async (data: any) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      let errorMessage = 'Signup failed';
      try {
        const text = await res.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server Error (${res.status}): ${text.substring(0, 100)}`;
        }
      } catch (e) {
        errorMessage = `Server Error (${res.status})`;
      }
      throw new Error(errorMessage);
    }

    let result;
    try {
      result = await res.json();
    } catch (e) {
      throw new Error('Server returned OK but invalid JSON. This might be a server-side redirect or misconfiguration.');
    }
    
    const { user: userData, token } = result;
    localStorage.setItem('token', token);
    setUser({ ...userData, id: userData.id || userData._id });
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser({ ...updatedUser, id: updatedUser.id || updatedUser._id });
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      login,
      signup,
      updateUser, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
