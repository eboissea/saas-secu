import { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import MetricCard from './MetricCard.jsx';

function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
}

function formatUptime(seconds) {
    if (!seconds) return '—';
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}j ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            fontSize: 'var(--font-size-xs)',
        }}>
            <p style={{ color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-1)' }}>
                {formatTime(label)}
            </p>
            {payload.map((entry, i) => (
                <p key={i} style={{ color: entry.color }}>
                    {entry.name}: {entry.value?.toFixed(1)}%
                </p>
            ))}
        </div>
    );
};

function MiniChart({ data, dataKey, color = '#00d4ff', height = 80 }) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={1.5}
                    fill={`url(#gradient-${dataKey})`}
                    isAnimationActive={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export default function SystemMetrics({ metrics, history }) {
    if (!metrics) {
        return (
            <div className="empty-state">
                <div className="spinner" style={{ width: '32px', height: '32px', marginBottom: 'var(--space-4)' }}></div>
                <p className="empty-state__text">Chargement des métriques...</p>
            </div>
        );
    }

    const mainNetwork = metrics.network?.find(n => n.rxPerSec > 0 || n.txPerSec > 0) || metrics.network?.[0];

    return (
        <>
            {/* Top Metric Cards */}
            <div className="grid grid--metrics" style={{ marginBottom: 'var(--space-6)' }}>
                <MetricCard
                    title="CPU"
                    icon="⚡"
                    value={metrics.cpu?.usage?.toFixed(1)}
                    unit="%"
                    percent={metrics.cpu?.usage}
                    status={`${metrics.cpu?.cores || '—'} cores · ${metrics.cpu?.speed || '—'} GHz`}
                    className="animate-fade-in delay-1"
                >
                    {history.length > 2 && (
                        <div style={{ marginTop: 'var(--space-3)' }}>
                            <MiniChart data={history} dataKey="cpu" color="#00d4ff" />
                        </div>
                    )}
                </MetricCard>

                <MetricCard
                    title="RAM"
                    icon="🧠"
                    value={metrics.memory?.usagePercent?.toFixed(1)}
                    unit="%"
                    percent={metrics.memory?.usagePercent}
                    status={`${formatBytes(metrics.memory?.used)} / ${formatBytes(metrics.memory?.total)}`}
                    className="animate-fade-in delay-2"
                >
                    {history.length > 2 && (
                        <div style={{ marginTop: 'var(--space-3)' }}>
                            <MiniChart data={history} dataKey="memory" color="#7c3aed" />
                        </div>
                    )}
                </MetricCard>

                <MetricCard
                    title="Swap"
                    icon="💾"
                    value={metrics.memory?.swapPercent?.toFixed(1)}
                    unit="%"
                    percent={metrics.memory?.swapPercent}
                    status={`${formatBytes(metrics.memory?.swapUsed)} / ${formatBytes(metrics.memory?.swapTotal)}`}
                    className="animate-fade-in delay-3"
                />

                <MetricCard
                    title="Uptime"
                    icon="⏱️"
                    value={formatUptime(metrics.system?.uptime)}
                    status={metrics.system?.os || '—'}
                    className="animate-fade-in delay-4"
                />
            </div>

            {/* Charts Row */}
            {history.length > 5 && (
                <div className="grid grid--2" style={{ marginBottom: 'var(--space-6)' }}>
                    {/* CPU & RAM History */}
                    <div className="card animate-fade-in delay-3">
                        <div className="card__title">
                            <span className="icon">📈</span>
                            Historique CPU & RAM (5 min)
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={formatTime}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    axisLine={{ stroke: 'rgba(148,163,184,0.08)' }}
                                    tickLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={35}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="cpu"
                                    name="CPU"
                                    stroke="#00d4ff"
                                    strokeWidth={2}
                                    fill="url(#cpuGrad)"
                                    isAnimationActive={false}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="memory"
                                    name="RAM"
                                    stroke="#7c3aed"
                                    strokeWidth={2}
                                    fill="url(#memGrad)"
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Disk & Network */}
                    <div className="card animate-fade-in delay-4">
                        <div className="card__title">
                            <span className="icon">💽</span>
                            Disque & Réseau
                        </div>

                        {/* Disk usage */}
                        <div style={{ marginBottom: 'var(--space-5)' }}>
                            <div style={{
                                fontSize: 'var(--font-size-xs)',
                                fontWeight: '600',
                                color: 'var(--color-text-tertiary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: 'var(--space-3)',
                            }}>
                                Partitions
                            </div>
                            {metrics.disk?.filesystems?.slice(0, 5).map((fs, i) => (
                                <div key={i} style={{ marginBottom: 'var(--space-3)' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: 'var(--space-1)',
                                    }}>
                                        <span style={{ fontFamily: 'var(--font-mono)' }}>{fs.mount}</span>
                                        <span>{fs.usagePercent?.toFixed(1)}% · {formatBytes(fs.used)} / {formatBytes(fs.size)}</span>
                                    </div>
                                    <div className={`gauge ${fs.usagePercent >= 90 ? 'gauge--danger' : fs.usagePercent >= 75 ? 'gauge--warning' : ''}`}
                                        style={{ marginTop: 0 }}>
                                        <div className="gauge__fill" style={{ width: `${fs.usagePercent}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Network */}
                        {mainNetwork && (
                            <div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: '600',
                                    color: 'var(--color-text-tertiary)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: 'var(--space-3)',
                                }}>
                                    Réseau ({mainNetwork.interface})
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                                    <div>
                                        <div style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-tertiary)',
                                            marginBottom: 'var(--space-1)',
                                        }}>
                                            ↓ Réception
                                        </div>
                                        <span className="metric-value metric-value--sm">
                                            {formatBytes(mainNetwork.rxPerSec || 0)}
                                        </span>
                                        <span className="metric-unit">/s</span>
                                    </div>
                                    <div>
                                        <div style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-tertiary)',
                                            marginBottom: 'var(--space-1)',
                                        }}>
                                            ↑ Envoi
                                        </div>
                                        <span className="metric-value metric-value--sm">
                                            {formatBytes(mainNetwork.txPerSec || 0)}
                                        </span>
                                        <span className="metric-unit">/s</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Top Processes */}
            {metrics.processes?.top?.length > 0 && (
                <div className="card animate-fade-in delay-5">
                    <div className="card__title">
                        <span className="icon">⚙️</span>
                        Top 10 Processus (par CPU)
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>PID</th>
                                    <th>Processus</th>
                                    <th>CPU %</th>
                                    <th>RAM %</th>
                                    <th>État</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metrics.processes.top.map((p, i) => (
                                    <tr key={p.pid || i}>
                                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)' }}>
                                            {p.pid}
                                        </td>
                                        <td style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>
                                            {p.name}
                                        </td>
                                        <td>
                                            <span style={{
                                                color: p.cpu > 50 ? 'var(--color-danger)' : p.cpu > 20 ? 'var(--color-warning)' : 'var(--color-success)',
                                                fontWeight: '600',
                                                fontFamily: 'var(--font-mono)',
                                            }}>
                                                {p.cpu?.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'var(--font-mono)' }}>{p.mem?.toFixed(1)}%</td>
                                        <td>
                                            <span className={`badge badge--${p.state === 'running' ? 'running' : 'pending'}`}>
                                                {p.state}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
