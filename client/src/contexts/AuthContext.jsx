import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = '/api';

// Axios instance with interceptors
const api = axios.create({
    baseURL: API_BASE,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('accessToken'));
    const [refreshToken, setRefreshToken] = useState(() => sessionStorage.getItem('refreshToken'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const refreshTimeoutRef = useRef(null);

    const isAuthenticated = !!accessToken;

    // Setup axios auth header
    useEffect(() => {
        if (accessToken) {
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [accessToken]);

    // Schedule token refresh (refresh at 80% of lifetime)
    const scheduleRefresh = useCallback((token) => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiresIn = (payload.exp * 1000) - Date.now();
            const refreshAt = expiresIn * 0.8;

            if (refreshAt > 0) {
                refreshTimeoutRef.current = setTimeout(async () => {
                    await refreshAccessToken();
                }, refreshAt);
            }
        } catch {
            // Invalid token, ignore
        }
    }, []);

    const refreshAccessToken = useCallback(async () => {
        const currentRefreshToken = sessionStorage.getItem('refreshToken');
        if (!currentRefreshToken) return;

        try {
            const response = await axios.post(`${API_BASE}/auth/refresh`, {
                refreshToken: currentRefreshToken,
            });

            const { accessToken: newAccess, refreshToken: newRefresh } = response.data;

            sessionStorage.setItem('accessToken', newAccess);
            sessionStorage.setItem('refreshToken', newRefresh);
            setAccessToken(newAccess);
            setRefreshToken(newRefresh);
            scheduleRefresh(newAccess);
        } catch {
            // Refresh failed, logout
            logout();
        }
    }, [scheduleRefresh]);

    // Setup refresh on mount if token exists
    useEffect(() => {
        if (accessToken) {
            scheduleRefresh(accessToken);
        }
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    const login = useCallback(async (username, password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_BASE}/auth/login`, {
                username,
                password,
            });

            const { accessToken: access, refreshToken: refresh } = response.data;

            sessionStorage.setItem('accessToken', access);
            sessionStorage.setItem('refreshToken', refresh);
            setAccessToken(access);
            setRefreshToken(refresh);
            setUser({ username });
            scheduleRefresh(access);

            return true;
        } catch (err) {
            const msg = err.response?.data?.error || 'Login failed. Please try again.';
            setError(msg);
            return false;
        } finally {
            setLoading(false);
        }
    }, [scheduleRefresh]);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Best effort
        }

        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);

        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return (
        <AuthContext.Provider value={{
            user,
            accessToken,
            isAuthenticated,
            loading,
            error,
            login,
            logout,
            clearError,
            api,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

export { api };
