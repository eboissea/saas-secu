import { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import SystemMetrics from '../components/SystemMetrics.jsx';
import KubernetesPods from '../components/KubernetesPods.jsx';
import PodDetails from '../components/PodDetails.jsx';
import { useSocket } from '../contexts/SocketContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function DashboardPage() {
    const { metrics, metricsHistory, pods } = useSocket();
    const { api } = useAuth();
    const [selectedPod, setSelectedPod] = useState(null);
    const [k8sAvailable, setK8sAvailable] = useState(null);

    // Check K8S availability
    useEffect(() => {
        async function checkK8s() {
            try {
                await api.get('/k8s/namespaces');
                setK8sAvailable(true);
            } catch {
                setK8sAvailable(false);
            }
        }
        checkK8s();
    }, []);

    return (
        <div className="dashboard-layout">
            <Header />

            <main className="dashboard-content">
                {/* System Metrics Section */}
                <section className="animate-fade-in" style={{ marginBottom: 'var(--space-8)' }}>
                    <h2 style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: '700',
                        marginBottom: 'var(--space-5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                    }}>
                        <span>📊</span> Métriques Système
                    </h2>
                    <SystemMetrics metrics={metrics} history={metricsHistory} />
                </section>

                {/* Kubernetes Section */}
                <section className="animate-fade-in delay-2" style={{ marginBottom: 'var(--space-8)' }}>
                    <h2 style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: '700',
                        marginBottom: 'var(--space-5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                    }}>
                        <span>☸️</span> Kubernetes Pods
                    </h2>
                    <KubernetesPods
                        pods={pods}
                        available={k8sAvailable}
                        onSelectPod={setSelectedPod}
                        api={api}
                    />
                </section>
            </main>

            {/* Pod Details Modal */}
            {selectedPod && (
                <PodDetails
                    pod={selectedPod}
                    api={api}
                    onClose={() => setSelectedPod(null)}
                />
            )}
        </div>
    );
}
