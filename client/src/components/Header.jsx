import { useAuth } from '../contexts/AuthContext.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';

export default function Header() {
    const { logout, user } = useAuth();
    const { connected } = useSocket();

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-6)',
            background: 'var(--color-bg-card)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--color-border)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                <h1 style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: '700',
                    background: 'var(--color-accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Sentinel Monitor
                </h1>
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
                {/* Connection status */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-tertiary)',
                }}>
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: connected ? 'var(--color-success)' : 'var(--color-danger)',
                        boxShadow: connected
                            ? '0 0 8px rgba(16, 185, 129, 0.5)'
                            : '0 0 8px rgba(239, 68, 68, 0.5)',
                        animation: connected ? 'pulse-dot 2s infinite' : 'none',
                    }}></span>
                    {connected ? 'Live' : 'Déconnecté'}
                </div>

                {/* User */}
                <span style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                }}>
                    👤 {user?.username || 'admin'}
                </span>

                {/* Logout */}
                <button
                    className="btn btn--ghost btn--sm"
                    onClick={logout}
                    style={{ color: 'var(--color-danger)' }}
                >
                    Déconnexion
                </button>
            </div>
        </header>
    );
}
