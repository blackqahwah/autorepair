<template>
  <div class="px-4 py-5">

    <div class="mb-4">
      <div class="d-flex align-items-center gap-2 mb-1">
        <i class="bi bi-tools fs-4 text-primary"></i>
        <h1 class="h3 fw-bold mb-0">Auto Repair Workshop</h1>
      </div>
      <p class="text-secondary mb-0">
        Manage bookings, jobs, repairs, and invoices.
      </p>
    </div>

    <div class="row g-3 mt-2">

      <div class="col-12 col-md-6 col-lg-4">
        <NuxtLink to="/bookings" class="card nav-card h-100 text-decoration-none border rounded-3 p-3 d-flex flex-row align-items-start gap-3">
          <div class="icon-box rounded-2 d-flex align-items-center justify-content-center flex-shrink-0">
            <i class="bi bi-calendar-check fs-5 text-primary"></i>
          </div>
          <div>
            <div class="fw-semibold mb-1">Book appointment</div>
            <div class="small text-secondary">Schedule a new service or repair visit.</div>
          </div>
        </NuxtLink>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <NuxtLink to="/dashboard" class="card nav-card h-100 text-decoration-none border rounded-3 p-3 d-flex flex-row align-items-start gap-3">
          <div class="icon-box rounded-2 d-flex align-items-center justify-content-center flex-shrink-0" style="background: #ecfdf5;">
            <i class="bi bi-speedometer2 fs-5" style="color: #059669;"></i>
          </div>
          <div>
            <div class="fw-semibold mb-1">Dashboard</div>
            <div class="small text-secondary">View active jobs and daily operations.</div>
          </div>
        </NuxtLink>
      </div>

      <div class="col-12 col-md-6 col-lg-4">
        <NuxtLink to="/insights" class="card nav-card h-100 text-decoration-none border rounded-3 p-3 d-flex flex-row align-items-start gap-3">
          <div class="icon-box rounded-2 d-flex align-items-center justify-content-center flex-shrink-0" style="background: #fdf4ff;">
            <i class="bi bi-bar-chart-line fs-5" style="color: #9333ea;"></i>
          </div>
          <div>
            <div class="fw-semibold mb-1">Workshop insights</div>
            <div class="small text-secondary">Analyse performance, revenue, and trends.</div>
          </div>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>


<style scoped>
.nav-card {
  transition: border-color 0.15s, background 0.15s;
  color: inherit;
}
.nav-card:hover {
  border-color: #adb5bd !important;
  background: #f8f9fa;
}
.icon-box {
  width: 44px;
  height: 44px;
  background: #e8f0fe;
}
</style>

