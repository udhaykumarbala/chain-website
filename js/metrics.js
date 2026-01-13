/* =====================================================
   0G Storage - Real-Time Metrics & Sparkline Charts
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMetrics();
});

/* ==================== Configuration ==================== */
const METRICS_CONFIG = {
    updateInterval: 2500, // 2.5 seconds for smoother updates
    chartPoints: 20,      // Number of data points in sparkline
    animationDuration: 400 // Faster animation for linear feel
};

/* ==================== Metrics State ==================== */
const metricsState = {
    uploadSpeed: {
        current: 0,
        history: [],
        min: 0.8,
        max: 1.5,
        unit: 'Gbps',
        decimals: 2
    },
    downloadSpeed: {
        current: 0,
        history: [],
        min: 700,
        max: 950,
        unit: 'Mbps',
        decimals: 0
    },
    totalStorage: {
        current: 0,
        history: [],
        min: 2.2,
        max: 2.8,
        unit: 'PB',
        decimals: 1
    },
    filesCount: {
        current: 0,
        min: 1100000,
        max: 1300000
    }
};

/* ==================== Chart Instances ==================== */
let charts = {};

/* ==================== Initialize Metrics ==================== */
function initMetrics() {
    // Initialize with random starting values
    Object.keys(metricsState).forEach(key => {
        const metric = metricsState[key];
        metric.current = randomInRange(metric.min, metric.max);

        if (metric.history !== undefined) {
            // Initialize history with slight variations
            for (let i = 0; i < METRICS_CONFIG.chartPoints; i++) {
                metric.history.push(randomInRange(metric.min, metric.max));
            }
        }
    });

    // Create sparkline charts
    createSparklineCharts();

    // Update display
    updateMetricsDisplay();

    // Start real-time updates
    setInterval(updateMetrics, METRICS_CONFIG.updateInterval);
}

/* ==================== Create Sparkline Charts ==================== */
function createSparklineCharts() {
    const chartConfig = {
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            elements: {
                point: { radius: 0 },
                line: {
                    borderWidth: 2,
                    tension: 0.4
                }
            },
            animation: {
                duration: METRICS_CONFIG.animationDuration,
                easing: 'easeOutQuart'
            }
        }
    };

    // Upload Speed Chart
    const uploadCtx = document.getElementById('uploadChart');
    if (uploadCtx) {
        charts.upload = new Chart(uploadCtx, {
            ...chartConfig,
            data: {
                labels: Array(METRICS_CONFIG.chartPoints).fill(''),
                datasets: [{
                    data: metricsState.uploadSpeed.history,
                    borderColor: '#9200E1',
                    backgroundColor: createGradient(uploadCtx, '#9200E1'),
                    fill: true
                }]
            }
        });
    }

    // Download Speed Chart
    const downloadCtx = document.getElementById('downloadChart');
    if (downloadCtx) {
        charts.download = new Chart(downloadCtx, {
            ...chartConfig,
            data: {
                labels: Array(METRICS_CONFIG.chartPoints).fill(''),
                datasets: [{
                    data: metricsState.downloadSpeed.history,
                    borderColor: '#B75FFF',
                    backgroundColor: createGradient(downloadCtx, '#B75FFF'),
                    fill: true
                }]
            }
        });
    }

    // Storage Chart
    const storageCtx = document.getElementById('storageChart');
    if (storageCtx) {
        charts.storage = new Chart(storageCtx, {
            ...chartConfig,
            data: {
                labels: Array(METRICS_CONFIG.chartPoints).fill(''),
                datasets: [{
                    data: metricsState.totalStorage.history,
                    borderColor: '#CB8AFF',
                    backgroundColor: createGradient(storageCtx, '#CB8AFF'),
                    fill: true
                }]
            }
        });
    }
}

/* ==================== Create Gradient ==================== */
function createGradient(canvas, color) {
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 48);
    gradient.addColorStop(0, hexToRgba(color, 0.3));
    gradient.addColorStop(1, hexToRgba(color, 0.02));
    return gradient;
}

/* ==================== Update Metrics ==================== */
function updateMetrics() {
    Object.keys(metricsState).forEach(key => {
        const metric = metricsState[key];
        const oldValue = metric.current;

        // Generate new value with small variation
        const variation = (metric.max - metric.min) * 0.1;
        let newValue = metric.current + randomInRange(-variation, variation);

        // Clamp to min/max
        newValue = Math.max(metric.min, Math.min(metric.max, newValue));
        metric.current = newValue;

        // Update history if exists
        if (metric.history !== undefined) {
            metric.history.shift();
            metric.history.push(newValue);
        }

        // Calculate percentage change
        if (metric.change !== undefined || key !== 'filesCount') {
            metric.change = ((newValue - oldValue) / oldValue) * 100;
        }
    });

    // Update charts
    updateCharts();

    // Update display
    updateMetricsDisplay();
}

/* ==================== Update Charts ==================== */
function updateCharts() {
    if (charts.upload) {
        charts.upload.data.datasets[0].data = metricsState.uploadSpeed.history;
        charts.upload.update('none');
    }

    if (charts.download) {
        charts.download.data.datasets[0].data = metricsState.downloadSpeed.history;
        charts.download.update('none');
    }

    if (charts.storage) {
        charts.storage.data.datasets[0].data = metricsState.totalStorage.history;
        charts.storage.update('none');
    }
}

/* ==================== Update Display ==================== */
function updateMetricsDisplay() {
    // Upload Speed
    const uploadEl = document.getElementById('uploadSpeed');
    if (uploadEl) {
        animateValue(uploadEl, metricsState.uploadSpeed.current, metricsState.uploadSpeed.decimals);
    }

    const uploadChangeEl = document.getElementById('uploadChange');
    if (uploadChangeEl) {
        updateChangeIndicator(uploadChangeEl, metricsState.uploadSpeed.change || Math.random() * 10);
    }

    // Download Speed
    const downloadEl = document.getElementById('downloadSpeed');
    if (downloadEl) {
        animateValue(downloadEl, metricsState.downloadSpeed.current, metricsState.downloadSpeed.decimals);
    }

    const downloadChangeEl = document.getElementById('downloadChange');
    if (downloadChangeEl) {
        updateChangeIndicator(downloadChangeEl, metricsState.downloadSpeed.change || Math.random() * 8);
    }

    // Total Storage
    const storageEl = document.getElementById('totalStorage');
    if (storageEl) {
        animateValue(storageEl, metricsState.totalStorage.current, metricsState.totalStorage.decimals);
    }

    // Files Count
    const filesEl = document.getElementById('filesCount');
    if (filesEl) {
        const count = Math.round(metricsState.filesCount.current / 1000000 * 10) / 10;
        filesEl.textContent = count.toFixed(1) + 'M';
    }
}

/* ==================== Animate Value ==================== */
function animateValue(element, targetValue, decimals) {
    const currentValue = parseFloat(element.textContent) || 0;
    const difference = targetValue - currentValue;
    const duration = METRICS_CONFIG.animationDuration;
    const startTime = performance.now();

    element.classList.add('updating');

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const value = currentValue + (difference * easeOutQuart);

        element.textContent = value.toFixed(decimals);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.remove('updating');
        }
    }

    requestAnimationFrame(update);
}

/* ==================== Update Change Indicator ==================== */
function updateChangeIndicator(element, change) {
    const isPositive = change >= 0;
    const absChange = Math.abs(change).toFixed(1);

    element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
    element.innerHTML = `
        <i class="fa-solid fa-arrow-${isPositive ? 'up' : 'down'}"></i>
        <span>${isPositive ? '+' : '-'}${absChange}%</span>
    `;
}

/* ==================== Utility Functions ==================== */
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Export for external use
window.metrics = {
    getState: () => metricsState,
    refresh: updateMetrics
};
