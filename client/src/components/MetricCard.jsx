export default function MetricCard({ title, icon, value, unit, percent, status, children, className = '' }) {
    const getGaugeClass = () => {
        if (!percent && percent !== 0) return '';
        if (percent >= 90) return 'gauge--danger';
        if (percent >= 75) return 'gauge--warning';
        return '';
    };

    return (
        <div className={`card ${className}`}>
            <div className="card__title">
                <span className="icon">{icon}</span>
                {title}
            </div>

            {value !== undefined && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
                    <span className="metric-value">{value}</span>
                    {unit && <span className="metric-unit">{unit}</span>}
                </div>
            )}

            {percent !== undefined && (
                <div className={`gauge ${getGaugeClass()}`}>
                    <div className="gauge__fill" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                </div>
            )}

            {status && (
                <div style={{
                    marginTop: 'var(--space-3)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-tertiary)',
                }}>
                    {status}
                </div>
            )}

            {children}
        </div>
    );
}
