/* =====================================================
   0G Chain - Real-Time Metrics & Sparkline Charts
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initChainMetrics();
});

/* ==================== Configuration ==================== */
const METRICS_CONFIG = {
    updateInterval: 2500,
    chartPoints: 20,
    animationDuration: 400
};

/* ==================== Metrics State ==================== */
const metricsState = {
    tps: {
        current: 0,
        history: [],
        min: 8000,
        max: 11500,
        unit: 'TPS',
        decimals: 0
    },
    blockTime: {
        current: 0,
        history: [],
        min: 0.7,
        max: 0.98,
        unit: 'seconds',
        decimals: 2
    }
};

/* ==================== Chart Instances ==================== */
let charts = {};

/* ==================== Initialize Metrics ==================== */
function initChainMetrics() {
    // Initialize with random starting values
    Object.keys(metricsState).forEach(key => {
        const metric = metricsState[key];
        metric.current = randomInRange(metric.min, metric.max);

        if (metric.history !== undefined) {
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

    // TPS Chart
    const tpsCtx = document.getElementById('tpsChart');
    if (tpsCtx) {
        charts.tps = new Chart(tpsCtx, {
            ...chartConfig,
            data: {
                labels: Array(METRICS_CONFIG.chartPoints).fill(''),
                datasets: [{
                    data: metricsState.tps.history,
                    borderColor: '#9200E1',
                    backgroundColor: createGradient(tpsCtx, '#9200E1'),
                    fill: true
                }]
            }
        });
    }

    // Block Time Chart
    const blockTimeCtx = document.getElementById('blockTimeChart');
    if (blockTimeCtx) {
        charts.blockTime = new Chart(blockTimeCtx, {
            ...chartConfig,
            data: {
                labels: Array(METRICS_CONFIG.chartPoints).fill(''),
                datasets: [{
                    data: metricsState.blockTime.history,
                    borderColor: '#B75FFF',
                    backgroundColor: createGradient(blockTimeCtx, '#B75FFF'),
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
        if (key !== 'totalStaked') {
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
    if (charts.tps) {
        charts.tps.data.datasets[0].data = metricsState.tps.history;
        charts.tps.update('none');
    }

    if (charts.blockTime) {
        charts.blockTime.data.datasets[0].data = metricsState.blockTime.history;
        charts.blockTime.update('none');
    }
}

/* ==================== Update Display ==================== */
function updateMetricsDisplay() {
    // TPS
    const tpsEl = document.getElementById('currentTps');
    if (tpsEl) {
        animateValue(tpsEl, metricsState.tps.current, metricsState.tps.decimals);
    }

    const tpsChangeEl = document.getElementById('tpsChange');
    if (tpsChangeEl) {
        updateChangeIndicator(tpsChangeEl, metricsState.tps.change || Math.random() * 5);
    }

    // Block Time
    const blockTimeEl = document.getElementById('blockTime');
    if (blockTimeEl) {
        animateValue(blockTimeEl, metricsState.blockTime.current, metricsState.blockTime.decimals);
    }

    const blockTimeChangeEl = document.getElementById('blockTimeChange');
    if (blockTimeChangeEl) {
        // For block time, lower is better, so we invert the indicator
        const change = metricsState.blockTime.change || Math.random() * 3;
        updateChangeIndicator(blockTimeChangeEl, -change, true);
    }
}

/* ==================== Animate Value ==================== */
function animateValue(element, targetValue, decimals) {
    const currentValue = parseFloat(element.textContent.replace(/,/g, '')) || 0;
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

        if (decimals === 0) {
            element.textContent = Math.round(value).toLocaleString();
        } else {
            element.textContent = value.toFixed(decimals);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.classList.remove('updating');
        }
    }

    requestAnimationFrame(update);
}

/* ==================== Update Change Indicator ==================== */
function updateChangeIndicator(element, change, invertColors = false) {
    const isPositive = change >= 0;
    const absChange = Math.abs(change).toFixed(1);

    // For block time, lower is better, so positive change is "negative" (bad)
    const colorClass = invertColors
        ? (isPositive ? 'negative' : 'positive')
        : (isPositive ? 'positive' : 'negative');

    element.className = `metric-change ${colorClass}`;
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
window.chainMetrics = {
    getState: () => metricsState,
    refresh: updateMetrics
};
