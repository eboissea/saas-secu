import { useState, useEffect } from 'react';

function timeAgo(dateStr) {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}j`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
}

const statusMap = {
    Running: 'running',
    Succeeded: 'succeeded',
    Pending: 'pending',
    Failed: 'failed',
    Unknown: 'error',
    CrashLoopBackOff: 'error',
};

export default function KubernetesPods({ pods, available, onSelectPod, api }) {
    const [namespaces, setNamespaces] = useState([]);
    const [selectedNs, setSelectedNs] = useState('');
    const [fetchedPods, setFetchedPods] = useState([]);
    const [loading, setLoading] = useState(false);

    // Use websocket pods if available, otherwise fetch
    const displayPods = pods?.length > 0 ? pods : fetchedPods;
    const filteredPods = selectedNs
        ? displayPods.filter((p) => p.namespace === selectedNs)
        : displayPods;

    useEffect(() => {
        if (available) {
            fetchNamespaces();
            fetchPods();
        }
    }, [available]);

    async function fetchNamespaces() {
        try {
            const res = await api.get('/k8s/namespaces');
            setNamespaces(res.data);
        } catch {
            // handled gracefully
        }
    }

    async function fetchPods() {
        setLoading(true);
        try {
            const res = await api.get('/k8s/pods');
            setFetchedPods(res.data);
        } catch {
            // handled gracefully
        } finally {
            setLoading(false);
        }
    }

    // K8S not available state
    if (available === false) {
        return (
            <div className="card">
                <div className="empty-state">
                    <div className="empty-state__icon">☸️</div>
                    <p className="empty-state__title">Kubernetes non disponible</p>
                    <p className="empty-state__text">
                        Aucun cluster Kubernetes n'est configuré ou accessible.
                        Configurez <code style={{
                            fontFamily: 'var(--font-mono)',
                            background: 'var(--color-bg-glass)',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--font-size-xs)',
                        }}>KUBECONFIG_PATH</code> dans le fichier <code style={{
                            fontFamily: 'var(--font-mono)',
                            background: 'var(--color-bg-glass)',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--font-size-xs)',
                        }}>.env</code> du serveur.
                    </p>
                </div>
            </div>
        );
    }

    // Loading state
    if (available === null) {
        return (
            <div className="card">
                <div className="empty-state">
                    <div className="spinner" style={{ width: '32px', height: '32px', marginBottom: 'var(--space-4)' }}></div>
                    <p className="empty-state__text">Vérification de la connexion Kubernetes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            {/* Filters */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-5)',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <select
                        className="select"
                        value={selectedNs}
                        onChange={(e) => setSelectedNs(e.target.value)}
                    >
                        <option value="">Tous les namespaces</option>
                        {namespaces.map((ns) => (
                            <option key={ns.name} value={ns.name}>{ns.name}</option>
                        ))}
                    </select>
                    <span style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-tertiary)',
                    }}>
                        {filteredPods.length} pod{filteredPods.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <button
                    className="btn btn--ghost btn--sm"
                    onClick={fetchPods}
                    disabled={loading}
                >
                    {loading ? <span className="spinner" style={{ width: '14px', height: '14px' }}></span> : '🔄'} Rafraîchir
                </button>
            </div>

            {/* Pods Table */}
            {filteredPods.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                    <p className="empty-state__text">Aucun pod trouvé</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Statut</th>
                                <th>Nom</th>
                                <th>Namespace</th>
                                <th>Ready</th>
                                <th>Restarts</th>
                                <th>Âge</th>
                                <th>Node</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPods.map((pod, i) => (
                                <tr key={`${pod.namespace}-${pod.name}`} style={{ cursor: 'pointer' }}
                                    onClick={() => onSelectPod(pod)}>
                                    <td>
                                        <span className={`badge badge--${statusMap[pod.status] || 'pending'}`}>
                                            <span className="badge__dot"></span>
                                            {pod.status}
                                        </span>
                                    </td>
                                    <td style={{
                                        fontWeight: '500',
                                        color: 'var(--color-text-primary)',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--font-size-xs)',
                                        maxWidth: '300px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {pod.name}
                                    </td>
                                    <td>
                                        <span style={{
                                            background: 'var(--color-bg-glass)',
                                            padding: '2px 8px',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: 'var(--font-size-xs)',
                                            fontFamily: 'var(--font-mono)',
                                        }}>
                                            {pod.namespace}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
                                        {pod.ready || '—'}
                                    </td>
                                    <td style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 'var(--font-size-xs)',
                                        color: pod.restarts > 0 ? 'var(--color-warning)' : 'inherit',
                                        fontWeight: pod.restarts > 0 ? '600' : '400',
                                    }}>
                                        {pod.restarts ?? '—'}
                                    </td>
                                    <td style={{ fontSize: 'var(--font-size-xs)' }}>
                                        {timeAgo(pod.createdAt)}
                                    </td>
                                    <td style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-tertiary)',
                                    }}>
                                        {pod.nodeName || '—'}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn--ghost btn--sm"
                                            onClick={(e) => { e.stopPropagation(); onSelectPod(pod); }}
                                        >
                                            Détails →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
