import { Router } from 'express';
import { getPodsStatus, getPodDetails, getPodLogs, getNamespaces, isK8sAvailable } from '../services/k8s.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Check K8S availability middleware
async function checkK8s(req, res, next) {
    const available = await isK8sAvailable();
    if (!available) {
        return res.status(503).json({
            error: 'Kubernetes cluster not available',
            message: 'No kubeconfig found or cluster is unreachable',
        });
    }
    next();
}

router.use(checkK8s);

// GET /api/k8s/namespaces
router.get('/namespaces', async (req, res) => {
    try {
        const namespaces = await getNamespaces();
        res.json(namespaces);
    } catch (err) {
        logger.error('Error fetching namespaces:', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch namespaces' });
    }
});

// GET /api/k8s/pods
router.get('/pods', async (req, res) => {
    try {
        const namespace = req.query.namespace || null;
        // Validate namespace format if provided
        if (namespace && !/^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/.test(namespace)) {
            return res.status(400).json({ error: 'Invalid namespace format' });
        }
        const pods = await getPodsStatus(namespace);
        res.json(pods);
    } catch (err) {
        logger.error('Error fetching pods:', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch pods' });
    }
});

// GET /api/k8s/pods/:namespace/:name
router.get('/pods/:namespace/:name', async (req, res) => {
    try {
        const { namespace, name } = req.params;
        // Validate inputs
        if (!/^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/.test(namespace) ||
            !/^[a-z0-9]([a-z0-9\-\.]*[a-z0-9])?$/.test(name)) {
            return res.status(400).json({ error: 'Invalid namespace or pod name format' });
        }
        const pod = await getPodDetails(namespace, name);
        res.json(pod);
    } catch (err) {
        logger.error('Error fetching pod details:', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch pod details' });
    }
});

// GET /api/k8s/pods/:namespace/:name/logs
router.get('/pods/:namespace/:name/logs', async (req, res) => {
    try {
        const { namespace, name } = req.params;
        const { container, tailLines = 100 } = req.query;

        // Validate inputs
        if (!/^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/.test(namespace) ||
            !/^[a-z0-9]([a-z0-9\-\.]*[a-z0-9])?$/.test(name)) {
            return res.status(400).json({ error: 'Invalid namespace or pod name format' });
        }

        const lines = Math.min(Math.max(parseInt(tailLines) || 100, 1), 1000);
        const logs = await getPodLogs(namespace, name, container, lines);
        res.json({ logs });
    } catch (err) {
        logger.error('Error fetching pod logs:', { error: err.message });
        res.status(500).json({ error: 'Failed to fetch pod logs' });
    }
});

export { router as k8sRoutes };
