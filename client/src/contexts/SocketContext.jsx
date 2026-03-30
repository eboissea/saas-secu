import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { accessToken, isAuthenticated } = useAuth();
    const [connected, setConnected] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [pods, setPods] = useState([]);
    const [metricsHistory, setMetricsHistory] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) {
            // Disconnect if not authenticated
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnected(false);
            }
            return;
        }

        // Connect with JWT
        const socket = io(window.location.origin, {
            auth: { token: accessToken },
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        socket.on('metrics:update', (data) => {
            setMetrics(data);
            // Keep local history for charts (last 60 data points = 5 min)
            setMetricsHistory((prev) => {
                const next = [...prev, {
                    timestamp: data.timestamp,
                    cpu: data.cpu?.usage || 0,
                    memory: data.memory?.usagePercent || 0,
                    swap: data.memory?.swapPercent || 0,
                }];
                return next.slice(-60);
            });
        });

        socket.on('k8s:pods', (data) => {
            setPods(data);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
            setConnected(false);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, accessToken]);

    return (
        <SocketContext.Provider value={{ connected, metrics, pods, metricsHistory }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) throw new Error('useSocket must be used within SocketProvider');
    return context;
}
