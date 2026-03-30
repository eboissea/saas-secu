import si from 'systeminformation';
import { logger } from '../utils/logger.js';

let latestMetrics = null;
const metricsHistory = [];
const MAX_HISTORY_POINTS = 17280; // 24h at 5s intervals

export function getLatestMetrics() {
    return latestMetrics;
}

export function getMetricsHistory() {
    return metricsHistory;
}

async function collectMetrics() {
    try {
        const [cpu, cpuLoad, mem, disk, fsSize, networkStats, processes, osInfo, time] =
            await Promise.all([
                si.cpu(),
                si.currentLoad(),
                si.mem(),
                si.disksIO().catch(() => null),
                si.fsSize(),
                si.networkStats(),
                si.processes(),
                si.osInfo(),
                si.time(),
            ]);

        // CPU Temperature (may not be available on all systems)
        let cpuTemp = null;
        try {
            const temp = await si.cpuTemperature();
            cpuTemp = temp.main;
        } catch {
            // Temperature not available
        }

        const metrics = {
            timestamp: new Date().toISOString(),
            cpu: {
                model: cpu.manufacturer + ' ' + cpu.brand,
                cores: cpu.cores,
                physicalCores: cpu.physicalCores,
                speed: cpu.speed,
                usage: Math.round(cpuLoad.currentLoad * 100) / 100,
                usagePerCore: cpuLoad.cpus?.map((c) => Math.round(c.load * 100) / 100) || [],
                temperature: cpuTemp,
            },
            memory: {
                total: mem.total,
                used: mem.used,
                free: mem.free,
                available: mem.available,
                usagePercent: Math.round((mem.used / mem.total) * 10000) / 100,
                swapTotal: mem.swaptotal,
                swapUsed: mem.swapused,
                swapPercent: mem.swaptotal > 0
                    ? Math.round((mem.swapused / mem.swaptotal) * 10000) / 100
                    : 0,
            },
            disk: {
                io: disk ? {
                    readPerSec: disk.rIO_sec || 0,
                    writePerSec: disk.wIO_sec || 0,
                    readBytesPerSec: disk.rWaitPercent || 0,
                    writeBytesPerSec: disk.wWaitPercent || 0,
                } : null,
                filesystems: fsSize.map((fs) => ({
                    fs: fs.fs,
                    type: fs.type,
                    mount: fs.mount,
                    size: fs.size,
                    used: fs.used,
                    available: fs.available,
                    usagePercent: Math.round(fs.use * 100) / 100,
                })),
            },
            network: networkStats.map((iface) => ({
                interface: iface.iface,
                rxBytes: iface.rx_bytes,
                txBytes: iface.tx_bytes,
                rxPerSec: iface.rx_sec,
                txPerSec: iface.tx_sec,
                operstate: iface.operstate,
            })),
            processes: {
                total: processes.all,
                running: processes.running,
                sleeping: processes.sleeping,
                top: processes.list
                    ?.sort((a, b) => b.cpu - a.cpu)
                    .slice(0, 10)
                    .map((p) => ({
                        pid: p.pid,
                        name: p.name?.substring(0, 50), // Truncate process names
                        cpu: Math.round(p.cpu * 100) / 100,
                        mem: Math.round(p.mem * 100) / 100,
                        state: p.state,
                    })) || [],
            },
            system: {
                os: `${osInfo.distro} ${osInfo.release}`,
                platform: osInfo.platform,
                arch: osInfo.arch,
                hostname: osInfo.hostname,
                kernel: osInfo.kernel,
                uptime: time.uptime,
            },
            loadAverage: cpuLoad.avgLoad || 0,
        };

        latestMetrics = metrics;

        // Store in history (keep last 24h)
        metricsHistory.push({
            timestamp: metrics.timestamp,
            cpu: metrics.cpu.usage,
            memory: metrics.memory.usagePercent,
            swap: metrics.memory.swapPercent,
            loadAvg: metrics.loadAverage,
            networkRx: networkStats.reduce((sum, i) => sum + (i.rx_sec || 0), 0),
            networkTx: networkStats.reduce((sum, i) => sum + (i.tx_sec || 0), 0),
        });

        if (metricsHistory.length > MAX_HISTORY_POINTS) {
            metricsHistory.shift();
        }
    } catch (err) {
        logger.error('Error collecting metrics:', { error: err.message });
    }
}

export function startMetricsCollection() {
    // Collect immediately, then every 5 seconds
    collectMetrics();
    setInterval(collectMetrics, 5000);
    logger.info('📊 Linux metrics collection started');
}
