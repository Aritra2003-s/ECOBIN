import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('wms_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('wms_token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/auth/me');
      
      const userData = data.data.user;

      // DEBUG: Check your console to see exactly what the API returns
      console.log("AuthContext: Current User Data fetched:", userData);

      if (userData && userData.role) {
        // We force the role to lowercase here to prevent casing bugs throughout the app
        userData.role = userData.role.toLowerCase();
        setUser(userData);
      } else {
        console.error("AuthContext: User object missing 'role' property!");
        setUser(userData);
      }
    } catch (error) {
      console.error("AuthContext: Auth session expired or invalid", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchCurrentUser]);

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await axiosInstance.post('/auth/login', { email, password });
      
      // Ensure your backend response matches this destructuring path: data.data.token/user
      const { token: newToken, user: newUser } = data.data;

      if (!newUser.role) {
        console.error("Login Success, but NO ROLE found in user object:", newUser);
      }

      // Standardize role to lowercase
      if (newUser.role) newUser.role = newUser.role.toLowerCase();

      localStorage.setItem('wms_token', newToken);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(newUser);
      
      return newUser; 
    } catch (error) {
      // Re-throw the error so the Login component can catch it and show a toast
      throw error;
    }
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await axiosInstance.post('/auth/register', payload);
    const { token: newToken, user: newUser } = data.data;
    
    if (newUser.role) newUser.role = newUser.role.toLowerCase();

    localStorage.setItem('wms_token', newToken);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      if (updated.role) updated.role = updated.role.toLowerCase();
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};