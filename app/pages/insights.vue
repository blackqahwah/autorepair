<template>
  <div class="px-3 py-4">

    <!-- Header — stacks on xs, inline on sm+ -->
    <div class="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-4">
        <button class="btn btn-link text-muted p-0 small" @click="router.back()">
  <i class="bi bi-arrow-left me-1"></i>Back
</button>
      <h1 class="fw-bold mb-0">Insights</h1>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <button class="btn btn-sm btn-outline-secondary px-2" @click="prevWeek">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="fw-semibold small">Week of {{ weekLabel }}</span>
        <button class="btn btn-sm btn-outline-secondary px-2" @click="nextWeek">
          <i class="bi bi-chevron-right"></i>
        </button>
        <span class="season-badge" :class="seasonBadge">{{ season }}</span>
      </div>
    </div>

    <!-- Stats: 2-col on mobile, 4-col on md+ -->
    <div class="row g-2 mb-4">
      <div class="col-6 col-md-3">
        <div class="stat-card bg-light">
          <div class="fs-3 fw-bold">{{ metrics.bookings }}</div>
          <div class="text-muted small">Bookings this week</div>
          <div class="trend-up small mt-1">+3 vs last week</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card bg-light">
          <div class="fs-3 fw-bold">₦{{ (metrics.revenue / 1000).toFixed(0) }}k</div>
          <div class="text-muted small">Est. revenue</div>
          <div class="trend-up small mt-1">+12%</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card bg-light">
          <div class="fs-3 fw-bold">{{ metrics.openInvoices }}</div>
          <div class="text-muted small">Open invoices</div>
          <div class="text-muted small mt-1">No change</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card stat-warning">
          <div class="fs-3 fw-bold">{{ metrics.onsitePending }}</div>
          <div class="text-muted small">Pending onsite pay</div>
          <div class="trend-down small mt-1">Chase up</div>
        </div>
      </div>
    </div>

    <!-- Bookings by day -->
    <div class="section-card mb-4">
      <h2 class="section-title">Bookings by day</h2>
      <canvas id="bookChart" height="130"></canvas>
    </div>

    <!-- Season + Likely repairs: stacked on mobile, side-by-side on md+ -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-5">
        <div class="section-card h-100">
          <h2 class="section-title">Season context</h2>
          <span class="season-badge mb-3 d-inline-block" :class="seasonBadge">{{ season }}</span>
          <p class="text-muted small">{{ seasonNote }}</p>
          <hr>
          <p class="text-muted small mb-0">Next season: {{ nextSeason }}. {{ nextSeasonNote }}</p>
        </div>
      </div>
      <div class="col-12 col-md-7">
        <div class="section-card h-100">
          <h2 class="section-title">Likely repairs incoming</h2>
          <table class="table table-sm table-borderless mb-0 small">
            <thead>
              <tr>
                <th class="text-muted fw-normal ps-0">Repair type</th>
                <th class="text-muted fw-normal text-end pe-0">Likelihood</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in likelyRepairs" :key="r.name">
                <td class="ps-0">{{ r.name }}</td>
                <td class="text-end pe-0">
                  <span class="likelihood-badge" :class="r.badge">{{ r.level }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Inventory: secondary columns hidden on xs -->
    <div class="section-card mb-4">
      <h2 class="section-title">Inventory suggestions — next 2 weeks</h2>
      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0 small">
          <thead>
            <tr>
              <th class="text-muted fw-normal ps-0">Item</th>
              <th class="text-muted fw-normal d-none d-sm-table-cell">Est. jobs</th>
              <th class="text-muted fw-normal">In stock</th>
              <th class="text-muted fw-normal d-none d-sm-table-cell" style="min-width:80px;">Level</th>
              <th class="text-muted fw-normal text-end pe-0">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inventory" :key="item.name">
              <td class="fw-semibold ps-0">{{ item.name }}</td>
              <td class="text-muted d-none d-sm-table-cell">{{ item.estJobs }}</td>
              <td>{{ item.stock }} {{ item.unit }}</td>
              <td class="d-none d-sm-table-cell">
                <div class="progress" style="height: 5px;">
                  <div class="progress-bar" :class="item.barClass" :style="{ width: item.pct + '%' }"></div>
                </div>
              </td>
              <td class="text-end pe-0">
                <span class="action-badge" :class="item.actionClass">{{ item.action }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Revenue trend -->
    <div class="section-card">
      <h2 class="section-title">Revenue trend — last 8 weeks</h2>
      <canvas id="revChart" height="110"></canvas>
    </div>

  </div>
</template>

<style scoped>
.stat-card {
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
}
.stat-warning { background: #fef9c3; }
.stat-warning .fs-3 { color: #854d0e; }

.trend-up   { color: #166534; }
.trend-down { color: #dc2626; }

.section-card {
  border-radius: 12px;
  border: 1px solid #dee2e6;
  padding: 1rem;
}
/* more room on sm+ */
@media (min-width: 576px) {
  .section-card { padding: 1.25rem; }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.season-badge,
.likelihood-badge,
.action-badge {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
}
.season-summer  { background: #dcfce7; color: #166534; }
.season-winter  { background: #dbeafe; color: #1e40af; }
.season-autumn  { background: #fef3c7; color: #92400e; }
.season-spring  { background: #fce7f3; color: #9d174d; }

.badge-high  { background: #fee2e2; color: #991b1b; }
.badge-med   { background: #fef9c3; color: #854d0e; }
.badge-low   { background: #dcfce7; color: #166534; }

.action-order { background: #fee2e2; color: #991b1b; }
.action-watch { background: #fef9c3; color: #854d0e; }
.action-ok    { background: #dcfce7; color: #166534; }
</style>

<script setup>
import { onMounted, ref, computed } from '#imports'
const router = useRouter()
const weekOffset = ref(0)

const weekLabel = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + weekOffset.value * 7)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
})

function prevWeek() { weekOffset.value-- }
function nextWeek() { weekOffset.value++ }

const month = new Date().getMonth()

const season = computed(() => {
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Autumn'
  return 'Winter'
})

const seasonBadge = computed(() => ({
  Spring: 'bg-success',
  Summer: 'bg-primary',
  Autumn: 'bg-warning text-dark',
  Winter: 'bg-secondary',
}[season.value]))

const seasonNote = computed(() => ({
  Spring: 'Post-winter checks common. Expect brake inspections, tyre changes (winter to summer), and suspension checks after pothole season.',
  Summer: 'Longer drives and heat stress. Expect AC faults, overheating, tyre wear from motorway trips.',
  Autumn: 'Pre-winter prep. Battery checks, wiper blades, tyre changes to winter. Busiest booking season.',
  Winter: 'Cold starts and road salt damage. Expect battery failures, corroded brake lines, and heating issues.',
}[season.value]))

const nextSeason = computed(() => {
  const seasons = ['Spring', 'Summer', 'Autumn', 'Winter']
  const i = seasons.indexOf(season.value)
  return seasons[(i + 1) % 4]
})

const nextSeasonNote = computed(() => ({
  Summer: 'Pre-summer AC checks typically spike in May.',
  Autumn: 'Pre-winter checks typically spike bookings from September.',
  Winter: 'Battery and heating prep bookings rise in October.',
  Spring: 'Post-winter tyre changes and suspension checks are common.',
}[nextSeason.value]))

const likelyRepairs = computed(() => {
  const map = {
    Summer: [
      { name: 'AC recharge / fault', level: 'High', badge: 'bg-danger' },
      { name: 'Tyre replacement', level: 'Medium', badge: 'bg-warning text-dark' },
      { name: 'Coolant / overheating', level: 'Medium', badge: 'bg-warning text-dark' },
      { name: 'Brake pads', level: 'Low', badge: 'bg-success' },
      { name: 'Oil service', level: 'Low', badge: 'bg-success' },
    ],
    Winter: [
      { name: 'Battery replacement', level: 'High', badge: 'bg-danger' },
      { name: 'Brake line inspection', level: 'High', badge: 'bg-danger' },
      { name: 'Heating / thermostat', level: 'Medium', badge: 'bg-warning text-dark' },
      { name: 'Tyre replacement (winter)', level: 'Medium', badge: 'bg-warning text-dark' },
      { name: 'Windscreen wipers', level: 'Low', badge: 'bg-success' },
    ],
    Autumn: [
      { name: 'Tyre change (summer→winter)', level: 'High', badge: 'bg-danger' },
      { name: 'Battery check', level: 'High', badge: 'bg-danger' },
      { name: 'Wiper blades', level: 'Medium', badge: 'bg-warning text-dark' },
      { name: 'Brake inspection', level: 'Medium', badge: 'bg-warning text-dark' },
      { name: 'Oil service', level: 'Low', badge: 'bg-success' },
    ],
    Spring: [
      { name: 'Tyre change (winter→summer)', level: 'High', badge: 'bg-danger' },
      { name: 'Suspension / alignment', level: 'Medium', badge: 'bg-warning text-dark' },
      { name: 'Brake inspection', level: 'Medium', badge: 'bg-warning text-dark' },
      { name: 'AC pre-season check', level: 'Low', badge: 'bg-success' },
      { name: 'Oil service', level: 'Low', badge: 'bg-success' },
    ],
  }
  return map[season.value]
})

const inventory = computed(() => {
  const map = {
    Summer: [
      { name: 'R134a refrigerant (AC)', estJobs: 8, stock: 2, unit: 'cans', pct: 25, barClass: 'bg-danger', action: 'Order 6+', actionClass: 'bg-danger' },
      { name: 'Tyres 205/55 R16', estJobs: 5, stock: 4, unit: 'units', pct: 50, barClass: 'bg-warning', action: 'Order 4', actionClass: 'bg-warning text-dark' },
      { name: 'Coolant (5L)', estJobs: 4, stock: 5, unit: 'units', pct: 80, barClass: 'bg-success', action: 'OK', actionClass: 'bg-success' },
      { name: 'Brake pads (front)', estJobs: 3, stock: 6, unit: 'sets', pct: 90, barClass: 'bg-success', action: 'OK', actionClass: 'bg-success' },
      { name: 'Engine oil 5W-30 5L', estJobs: 3, stock: 1, unit: 'units', pct: 15, barClass: 'bg-danger', action: 'Order 4+', actionClass: 'bg-danger' },
    ],
    Winter: [
      { name: 'Car batteries (063)', estJobs: 7, stock: 2, unit: 'units', pct: 20, barClass: 'bg-danger', action: 'Order 6+', actionClass: 'bg-danger' },
      { name: 'Winter tyres 205/55 R16', estJobs: 6, stock: 3, unit: 'units', pct: 35, barClass: 'bg-warning', action: 'Order 6', actionClass: 'bg-warning text-dark' },
      { name: 'Antifreeze (5L)', estJobs: 4, stock: 6, unit: 'units', pct: 85, barClass: 'bg-success', action: 'OK', actionClass: 'bg-success' },
      { name: 'Brake fluid (DOT4)', estJobs: 3, stock: 1, unit: 'units', pct: 20, barClass: 'bg-danger', action: 'Order 4+', actionClass: 'bg-danger' },
    ],
    Autumn: [
      { name: 'Winter tyres 205/55 R16', estJobs: 9, stock: 2, unit: 'units', pct: 15, barClass: 'bg-danger', action: 'Order 8+', actionClass: 'bg-danger' },
      { name: 'Car batteries (063)', estJobs: 5, stock: 3, unit: 'units', pct: 40, barClass: 'bg-warning', action: 'Order 4', actionClass: 'bg-warning text-dark' },
      { name: 'Wiper blades', estJobs: 5, stock: 8, unit: 'pairs', pct: 90, barClass: 'bg-success', action: 'OK', actionClass: 'bg-success' },
      { name: 'Engine oil 5W-30 5L', estJobs: 4, stock: 2, unit: 'units', pct: 30, barClass: 'bg-warning', action: 'Order 4', actionClass: 'bg-warning text-dark' },
    ],
    Spring: [
      { name: 'Summer tyres 205/55 R16', estJobs: 8, stock: 3, unit: 'units', pct: 25, barClass: 'bg-danger', action: 'Order 6+', actionClass: 'bg-danger' },
      { name: 'Alignment shims', estJobs: 4, stock: 5, unit: 'sets', pct: 70, barClass: 'bg-success', action: 'OK', actionClass: 'bg-success' },
      { name: 'R134a refrigerant (AC)', estJobs: 3, stock: 1, unit: 'cans', pct: 20, barClass: 'bg-danger', action: 'Order 4+', actionClass: 'bg-danger' },
      { name: 'Brake pads (front)', estJobs: 3, stock: 7, unit: 'sets', pct: 90, barClass: 'bg-success', action: 'OK', actionClass: 'bg-success' },
    ],
  }
  return map[season.value]
})

const metrics = { bookings: 14, revenue: 6240, openInvoices: 3, onsitePending: 2 }

onMounted(() => {
  if (typeof Chart === 'undefined') {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    s.onload = drawCharts
    document.head.appendChild(s)
  } else {
    drawCharts()
  }
})

function drawCharts() {
  const textCol = '#888780'
  const gridCol = 'rgba(0,0,0,0.06)'

  new Chart(document.getElementById('bookChart'), {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [{ label: 'Bookings', data: [3, 2, 4, 2, 3], backgroundColor: '#378ADD', borderRadius: 4, borderSkipped: false }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textCol } },
        y: { grid: { color: gridCol }, ticks: { color: textCol, stepSize: 1 }, beginAtZero: true }
      }
    }
  })

  new Chart(document.getElementById('revChart'), {
    type: 'line',
    data: {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'],
      datasets: [{
        label: 'Revenue (£)',
        data: [3800, 4100, 3600, 4800, 5200, 4900, 5800, 6240],
        borderColor: '#1D9E75',
        backgroundColor: 'rgba(29,158,117,0.08)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.35,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textCol } },
        y: { grid: { color: gridCol }, ticks: { color: textCol, callback: v => '£' + (v / 1000).toFixed(1) + 'k' } }
      }
    }
  })
}
</script>