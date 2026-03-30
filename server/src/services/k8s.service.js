import * as k8s from '@kubernetes/client-node';
import { logger } from '../utils/logger.js';

let k8sApi = null;
let k8sAvailable = false;
let k8sCheckDone = false;

function initK8sClient() {
    if (k8sCheckDone) return;
    k8sCheckDone = true;

    try {
        const kc = new k8s.KubeConfig();

        if (process.env.KUBECONFIG_PATH) {
            kc.loadFromFile(process.env.KUBECONFIG_PATH);
        } else {
            // Try default locations
            try {
                kc.loadFromDefault();
            } catch {
                logger.info('⚠️  No kubeconfig found. K8S monitoring disabled.');
                k8sAvailable = false;
                return;
            }
        }

        k8sApi = kc.makeApiClient(k8s.CoreV1Api);
        k8sAvailable = true;
        logger.info('☸️  Kubernetes client initialized');
    } catch (err) {
        logger.info('⚠️  Kubernetes not available:', { error: err.message });
        k8sAvailable = false;
    }
}

export async function isK8sAvailable() {
    initK8sClient();

    if (!k8sAvailable || !k8sApi) return false;

    // Actual connectivity check (cached for 30s)
    if (isK8sAvailable._lastCheck && Date.now() - isK8sAvailable._lastCheck < 30000) {
        return isK8sAvailable._lastResult;
    }

    try {
        await k8sApi.listNamespace({ limit: 1 });
        isK8sAvailable._lastCheck = Date.now();
        isK8sAvailable._lastResult = true;
        return true;
    } catch {
        isK8sAvailable._lastCheck = Date.now();
        isK8sAvailable._lastResult = false;
        return false;
    }
}

export async function getNamespaces() {
    initK8sClient();
    const response = await k8sApi.listNamespace();
    return response.items.map((ns) => ({
        name: ns.metadata.name,
        status: ns.status.phase,
        createdAt: ns.metadata.creationTimestamp,
        labels: ns.metadata.labels || {},
    }));
}

export async function getPodsStatus(namespace = null) {
    initK8sClient();

    let response;
    if (namespace) {
        response = await k8sApi.listNamespacedPod({ namespace });
    } else {
        response = await k8sApi.listPodForAllNamespaces();
    }

    return response.items.map((pod) => {
        const containerStatuses = pod.status.containerStatuses || [];
        const containers = containerStatuses.map((cs) => ({
            name: cs.name,
            ready: cs.ready,
            restartCount: cs.restartCount,
            state: cs.state ? Object.keys(cs.state)[0] : 'unknown',
            image: cs.image,
        }));

        return {
            name: pod.metadata.name,
            namespace: pod.metadata.namespace,
            status: pod.status.phase,
            podIP: pod.status.podIP,
            nodeName: pod.spec.nodeName,
            containers,
            restarts: containers.reduce((sum, c) => sum + c.restartCount, 0),
            createdAt: pod.metadata.creationTimestamp,
            labels: pod.metadata.labels || {},
            ready: `${containers.filter((c) => c.ready).length}/${containers.length}`,
        };
    });
}

export async function getPodDetails(namespace, name) {
    initK8sClient();

    const pod = await k8sApi.readNamespacedPod({ name, namespace });

    const containerStatuses = pod.status.containerStatuses || [];
    const containers = pod.spec.containers.map((c) => {
        const status = containerStatuses.find((cs) => cs.name === c.name);
        return {
            name: c.name,
            image: c.image,
            ports: (c.ports || []).map((p) => ({
                containerPort: p.containerPort,
                protocol: p.protocol,
            })),
            resources: c.resources || {},
            ready: status?.ready || false,
            restartCount: status?.restartCount || 0,
            state: status?.state ? Object.keys(status.state)[0] : 'unknown',
            stateDetails: status?.state
                ? Object.values(status.state)[0]
                : null,
        };
    });

    return {
        name: pod.metadata.name,
        namespace: pod.metadata.namespace,
        status: pod.status.phase,
        podIP: pod.status.podIP,
        hostIP: pod.status.hostIP,
        nodeName: pod.spec.nodeName,
        serviceAccount: pod.spec.serviceAccountName,
        containers,
        conditions: (pod.status.conditions || []).map((c) => ({
            type: c.type,
            status: c.status,
            lastTransitionTime: c.lastTransitionTime,
            reason: c.reason,
            message: c.message,
        })),
        volumes: (pod.spec.volumes || []).map((v) => ({
            name: v.name,
            type: Object.keys(v).filter((k) => k !== 'name')[0],
        })),
        createdAt: pod.metadata.creationTimestamp,
        labels: pod.metadata.labels || {},
        annotations: pod.metadata.annotations || {},
    };
}

export async function getPodLogs(namespace, name, container, tailLines = 100) {
    initK8sClient();

    const params = { name, namespace, tailLines };
    if (container) {
        params.container = container;
    }

    const response = await k8sApi.readNamespacedPodLog(params);
    // Truncate logs for safety
    const maxChars = 100000;
    const logs = typeof response === 'string' ? response : String(response);
    return logs.length > maxChars ? logs.substring(logs.length - maxChars) : logs;
}
