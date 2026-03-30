import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage() {
    const { login, loading, error, clearError } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        clearError();
    }, [username, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) return;
        await login(username.trim(), password);
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: 'var(--space-4)',
        }}>
            <div className="animate-slide-up" style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo / Branding */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '72px',
                        height: '72px',
                        borderRadius: 'var(--radius-2xl)',
                        background: 'var(--color-accent-gradient-subtle)',
                        border: '1px solid var(--color-border-accent)',
                        marginBottom: 'var(--space-6)',
                        boxShadow: 'var(--shadow-glow)',
                    }}>
                        <span style={{ fontSize: '2rem' }}>🛡️</span>
                    </div>
                    <h1 style={{
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: '800',
                        background: 'var(--color-accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: 'var(--space-2)',
                    }}>
                        Sentinel Monitor
                    </h1>
                    <p style={{
                        color: 'var(--color-text-tertiary)',
                        fontSize: 'var(--font-size-sm)',
                    }}>
                        Secure Infrastructure Monitoring
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="card card--accent" style={{
                    padding: 'var(--space-8)',
                }}>
                    {error && (
                        <div style={{
                            background: 'var(--color-danger-bg)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-3) var(--space-4)',
                            marginBottom: 'var(--space-6)',
                            color: 'var(--color-danger)',
                            fontSize: 'var(--font-size-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                        }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                        <label htmlFor="username">Nom d'utilisateur</label>
                        <input
                            id="username"
                            className="input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            autoComplete="username"
                            autoFocus
                            required
                            maxLength={30}
                        />
                    </div>

                    <div className="input-group" style={{ marginBottom: 'var(--space-8)' }}>
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            maxLength={128}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={loading || !username.trim() || !password.trim()}
                        style={{ width: '100%', padding: 'var(--space-4)' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                                Connexion...
                            </>
                        ) : (
                            <>🔐 Se connecter</>
                        )}
                    </button>
                </form>

                {/* Security note */}
                <p style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-6)',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-xs)',
                }}>
                    🔒 Connexion sécurisée · Chiffrement JWT · Rate Limited
                </p>
            </div>
        </div>
    );
}
