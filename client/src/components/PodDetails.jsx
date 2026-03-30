import { useState, useEffect } from 'react';

export default function PodDetails({ pod, api, onClose }) {
    const [details, setDetails] = useState(null);
    const [logs, setLogs] = useState('');
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [selectedContainer, setSelectedContainer] = useState('');

    useEffect(() => {
        fetchDetails();
    }, [pod]);

    async function fetchDetails() {
        setLoading(true);
        try {
            const res = await api.get(`/k8s/pods/${pod.namespace}/${pod.name}`);
            setDetails(res.data);
        } catch {
            // handled gracefully
        } finally {
            setLoading(false);
        }
    }

    async function fetchLogs(container) {
        setLogsLoading(true);
        try {
            const params = container ? `?container=${container}&tailLines=200` : '?tailLines=200';
            const res = await api.get(`/k8s/pods/${pod.namespace}/${pod.name}/logs${params}`);
            setLogs(res.data.logs || 'Aucun log disponible.');
        } catch (err) {
            setLogs(`Erreur lors de la récupération des logs: ${err.response?.data?.error || err.message}`);
        } finally {
            setLogsLoading(false);
        }
    }

    useEffect(() => {
        if (activeTab === 'logs' && !logs) {
            fetchLogs(selectedContainer);
        }
    }, [activeTab]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const data = details || pod;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal__header">
                    <div>
                        <h2 className="modal__title" style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--font-size-md)',
                            wordBreak: 'break-all',
                        }}>
                            {pod.name}
                        </h2>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            marginTop: 'var(--space-2)',
                        }}>
                            <span className={`badge badge--${pod.status === 'Running' ? 'running' : pod.status === 'Pending' ? 'pending' : 'failed'}`}>
                                <span className="badge__dot"></span>
                                {pod.status}
                            </span>
                            <span style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-tertiary)',
                            }}>
                                {pod.namespace}
                            </span>
                        </div>
                    </div>
                    <button className="btn btn--ghost btn--sm" onClick={onClose}>✕</button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-1)',
                    marginBottom: 'var(--space-6)',
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: 'var(--space-1)',
                }}>
                    {['info', 'containers', 'logs'].map((tab) => (
                        <button
                            key={tab}
                            className="btn btn--ghost btn--sm"
                            onClick={() => setActiveTab(tab)}
                            style={{
                                borderBottom: activeTab === tab ? '2px solid var(--color-accent-primary)' : '2px solid transparent',
                                borderRadius: 0,
                                color: activeTab === tab ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
                            }}
                        >
                            {tab === 'info' ? '📋 Info' : tab === 'containers' ? '📦 Containers' : '📄 Logs'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                        <div className="spinner" style={{ width: '32px', height: '32px', margin: '0 auto' }}></div>
                    </div>
                ) : (
                    <>
                        {/* Info Tab */}
                        {activeTab === 'info' && (
                            <div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: 'var(--space-4)',
                                }}>
                                    {[
                                        ['Pod IP', data.podIP],
                                        ['Host IP', data.hostIP],
                                        ['Node', data.nodeName],
                                        ['Service Account', data.serviceAccount],
                                        ['Restarts', pod.restarts],
                                        ['Ready', pod.ready],
                                    ].map(([label, value]) => (
                                        <div key={label}>
                                            <div style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-text-tertiary)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                marginBottom: 'var(--space-1)',
                                            }}>
                                                {label}
                                            </div>
                                            <div style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: 'var(--font-size-sm)',
                                                color: 'var(--color-text-primary)',
                                            }}>
                                                {value ?? '—'}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Conditions */}
                                {data.conditions?.length > 0 && (
                                    <div style={{ marginTop: 'var(--space-6)' }}>
                                        <h3 style={{
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: '600',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: 'var(--space-3)',
                                        }}>
                                            Conditions
                                        </h3>
                                        <div className="table-container">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Type</th>
                                                        <th>Statut</th>
                                                        <th>Raison</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.conditions.map((c, i) => (
                                                        <tr key={i}>
                                                            <td>{c.type}</td>
                                                            <td>
                                                                <span style={{
                                                                    color: c.status === 'True' ? 'var(--color-success)' : 'var(--color-danger)',
                                                                    fontWeight: '600',
                                                                }}>
                                                                    {c.status}
                                                                </span>
                                                            </td>
                                                            <td>{c.reason || '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Labels */}
                                {data.labels && Object.keys(data.labels).length > 0 && (
                                    <div style={{ marginTop: 'var(--space-6)' }}>
                                        <h3 style={{
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: '600',
                                            color: 'var(--color-text-secondary)',
                                            marginBottom: 'var(--space-3)',
                                        }}>
                                            Labels
                                        </h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                            {Object.entries(data.labels).map(([k, v]) => (
                                                <span key={k} style={{
                                                    background: 'var(--color-bg-glass)',
                                                    border: '1px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    padding: '2px 8px',
                                                    fontSize: 'var(--font-size-xs)',
                                                    fontFamily: 'var(--font-mono)',
                                                }}>
                                                    {k}={v}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Containers Tab */}
                        {activeTab === 'containers' && (
                            <div>
                                {data.containers?.map((c, i) => (
                                    <div key={c.name} className="card" style={{ marginBottom: 'var(--space-4)' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: 'var(--space-3)',
                                        }}>
                                            <h4 style={{ fontWeight: '600', fontSize: 'var(--font-size-base)' }}>
                                                📦 {c.name}
                                            </h4>
                                            <span className={`badge badge--${c.ready ? 'running' : c.state === 'waiting' ? 'pending' : 'failed'}`}>
                                                {c.state}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: 'var(--space-3)',
                                            fontSize: 'var(--font-size-xs)',
                                        }}>
                                            <div>
                                                <span style={{ color: 'var(--color-text-tertiary)' }}>Image: </span>
                                                <span style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{c.image}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--color-text-tertiary)' }}>Restarts: </span>
                                                <span style={{
                                                    fontWeight: c.restartCount > 0 ? '600' : '400',
                                                    color: c.restartCount > 0 ? 'var(--color-warning)' : 'inherit',
                                                }}>
                                                    {c.restartCount}
                                                </span>
                                            </div>
                                            {c.ports?.map((port, pi) => (
                                                <div key={pi}>
                                                    <span style={{ color: 'var(--color-text-tertiary)' }}>Port: </span>
                                                    <span>{port.containerPort}/{port.protocol}</span>
                                                </div>
                                            ))}
                                            {c.resources?.requests && (
                                                <div>
                                                    <span style={{ color: 'var(--color-text-tertiary)' }}>Requests: </span>
                                                    <span>CPU: {c.resources.requests.cpu || '—'}, Mem: {c.resources.requests.memory || '—'}</span>
                                                </div>
                                            )}
                                            {c.resources?.limits && (
                                                <div>
                                                    <span style={{ color: 'var(--color-text-tertiary)' }}>Limits: </span>
                                                    <span>CPU: {c.resources.limits.cpu || '—'}, Mem: {c.resources.limits.memory || '—'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Logs Tab */}
                        {activeTab === 'logs' && (
                            <div>
                                <div style={{
                                    display: 'flex',
                                    gap: 'var(--space-3)',
                                    marginBottom: 'var(--space-4)',
                                    alignItems: 'center',
                                }}>
                                    {data.containers?.length > 1 && (
                                        <select
                                            className="select"
                                            value={selectedContainer}
                                            onChange={(e) => {
                                                setSelectedContainer(e.target.value);
                                                fetchLogs(e.target.value);
                                            }}
                                        >
                                            <option value="">Tous les containers</option>
                                            {data.containers.map((c) => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    )}
                                    <button
                                        className="btn btn--ghost btn--sm"
                                        onClick={() => fetchLogs(selectedContainer)}
                                        disabled={logsLoading}
                                    >
                                        {logsLoading ? <span className="spinner" style={{ width: '14px', height: '14px' }}></span> : '🔄'} Rafraîchir
                                    </button>
                                </div>
                                <div className="log-viewer">
                                    {logsLoading ? 'Chargement des logs...' : logs || 'Aucun log disponible.'}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
