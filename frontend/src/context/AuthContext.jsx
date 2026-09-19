import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as loginApi, register as registerApi, logout as logoutApi, googleAuth as googleAuthApi } from '../services/authService';
import { getCurrentUser } from '../services/userService';
import { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => window.localStorage.getItem('ais_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (token) {
        setAuthToken(token);
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          // Token invalid/expired - clear it silently.
          window.localStorage.removeItem('ais_token');
          setToken(null);
          setAuthToken(null);
        }
      }
      setLoading(false);
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await loginApi(credentials);
    window.localStorage.setItem('ais_token', data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await registerApi(payload);
    window.localStorage.setItem('ais_token', data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const data = await googleAuthApi(idToken);
    window.localStorage.setItem('ais_token', data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (err) {
      // Ignore network errors on logout - clear local state regardless.
    }
    window.localStorage.removeItem('ais_token');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const updateUserLocal = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated: !!token, login, register, loginWithGoogle, logout, updateUserLocal }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
