<script setup>
const route = useRoute()
 const router = useRouter()
const jobId = route.params.id

const { data: job, pending, error } = await useFetch(
  `/api/jobs/${route.params.id}`
)
const newStatus = ref('')
const partsInput = ref('')

async function updateStatus() {
  await $fetch(`/api/jobs/${jobId}`, {
    method: 'PATCH',
    body: {
      status: newStatus.value,
    },
  })

  refresh()
}
</script>

<template>
  <div v-if="job" class="px-3 py-4 job-page">

    <NuxtLink to="/jobs" class="back-link d-inline-flex align-items-center gap-1 mb-2 text-muted small text-decoration-none">
     <button class="btn btn-link text-muted p-0 small" @click="router.back()">
  <i class="bi bi-arrow-left me-1"></i>Back
</button>
      <i class="bi bi-arrow-left"></i> All jobs
    </NuxtLink>

    <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
      <h1 class="fw-bold mb-0">Job #{{ job.id }}</h1>
      <span class="badge-status" :class="statusBadge(job.status)">{{ job.status }}</span>
    </div>

    <!-- Status update -->
    <div class="section-card">
      <div class="fw-semibold mb-3 card-label">Update status</div>
      <div class="d-flex flex-column flex-sm-row gap-2">
        <select v-model="newStatus" class="form-select form-select-sm flex-grow-1">
          <option>BOOKED</option>
          <option>JOB_CARD_CREATED</option>
          <option>IN_PROGRESS</option>
          <option>AWAITING_PARTS</option>
          <option>ESTIMATE_SENT</option>
          <option>APPROVED</option>
          <option>READY_FOR_PICKUP</option>
          <option>COMPLETED</option>
        </select>
        <button class="btn btn-sm btn-dark text-nowrap" @click="updateStatus">
          <i class="bi bi-arrow-repeat me-1"></i>Update
        </button>
      </div>
    </div>

    <!-- Customer + Car -->
    <div class="section-card">
      <div class="fw-semibold mb-3 card-label">Customer and car</div>
      <div class="row g-3">
        <div class="col-12 col-sm-6">
          <div class="field-label">Customer</div>
          <div class="field-value">{{ job.customerName }}</div>
        </div>
        <div class="col-12 col-sm-6">
          <div class="field-label">Car</div>
          <div class="field-value">{{ job.car }}</div>
        </div>
        <div class="col-12 col-sm-6" v-if="job.date">
          <div class="field-label">Date booked</div>
          <div class="field-value">{{ job.date }}</div>
        </div>
        <div class="col-12 col-sm-6" v-if="job.plate">
          <div class="field-label">Plate</div>
          <div class="field-value">{{ job.plate }}</div>
        </div>
      </div>
    </div>

    <!-- Estimate -->
    <div class="section-card">
      <div class="fw-semibold mb-3 card-label">Estimate</div>
      <div class="d-flex align-items-baseline gap-2 mb-3">
        <span class="estimate-amount">₦{{ (job.estimate || 0).toLocaleString() }}</span>
        <span class="text-muted small">estimated total</span>
      </div>
      <div class="d-flex flex-column flex-sm-row gap-2">
        <input
          v-model.number="newEstimate"
          class="form-control form-control-sm flex-grow-1"
          type="number"
          placeholder="Update estimate (₦)"
        >
        <button class="btn btn-sm btn-outline-secondary text-nowrap" @click="saveEstimate">
          Save estimate
        </button>
      </div>
    </div>

    <!-- Parts -->
    <div class="section-card">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="fw-semibold card-label">Parts</div>
        <button class="btn btn-sm btn-outline-secondary" @click="addPart">
          <i class="bi bi-plus me-1"></i>Add part
        </button>
      </div>

      <div v-if="job.parts?.length" class="table-responsive">
        <table class="table table-sm mb-0 small">
          <thead class="table-light">
            <tr>
              <th class="ps-0">Part</th>
              <!-- unit price hidden on xs, shown sm+ -->
              <th class="text-end d-none d-sm-table-cell">Unit price</th>
              <th class="text-end">Qty</th>
              <th class="text-end pe-0">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in job.parts" :key="part.id">
              <td class="ps-0">
                {{ part.name }}
                <!-- unit price inline on xs -->
                <div class="text-muted d-sm-none" style="font-size:11px;">
                  ₦{{ part.price.toLocaleString() }} each
                </div>
              </td>
              <td class="text-end d-none d-sm-table-cell">₦{{ part.price.toLocaleString() }}</td>
              <td class="text-end">{{ part.quantity }}</td>
              <td class="text-end pe-0">₦{{ (part.price * part.quantity).toLocaleString() }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="fw-bold">
              <td class="ps-0" colspan="2">Total</td>
              <td class="d-none d-sm-table-cell"></td>
              <td class="text-end pe-0">₦{{ partsTotal.toLocaleString() }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p v-else class="text-muted small mb-0">No parts added yet.</p>
    </div>

  </div>
</template>

<style scoped>
.job-page { max-width: 600px; margin: 0 auto; }

.back-link { color: #6b7280; }
.back-link:hover { color: #111; }

.section-card {
  border-radius: 12px;
  border: 1px solid #dee2e6;
  padding: 1rem;
  margin-bottom: 1rem;
}
@media (min-width: 576px) {
  .section-card { padding: 1.25rem; }
}

.card-label  { font-size: 14px; }
.field-label { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
.field-value { font-size: 15px; font-weight: 500; }

.estimate-amount { font-size: 28px; font-weight: 700; }

.badge-status {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
  white-space: nowrap;
}
.badge-booked       { background: #dbeafe; color: #1e40af; }
.badge-in-progress  { background: #fef9c3; color: #854d0e; }
.badge-awaiting     { background: #fee2e2; color: #991b1b; }
.badge-completed    { background: #dcfce7; color: #166534; }
</style>

