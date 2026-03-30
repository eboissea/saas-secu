import { Router } from 'express';
import { getLatestMetrics, getMetricsHistory } from '../services/linux-metrics.service.js';

const router = Router();

// GET /api/metrics/system
router.get('/system', (req, res) => {
    const metrics = getLatestMetrics();
    if (!metrics) {
        return res.status(503).json({ error: 'Metrics not yet available' });
    }
    res.json(metrics);
});

// GET /api/metrics/history
router.get('/history', (req, res) => {
    const history = getMetricsHistory();
    res.json(history);
});

export { router as metricsRoutes };
