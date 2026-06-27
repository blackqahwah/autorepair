<template>
  <div class="px-3 py-4">
     <button class="btn btn-link text-muted p-0 small" @click="router.back()">
  <i class="bi bi-arrow-left me-1"></i>Back
</button>
    <h1 class="fw-bold mb-4">Dashboard</h1>

    <!-- Summary stats — 2-col on mobile, 4-col on md+ -->
    <div class="row g-2 mb-4">
      <div class="col-6 col-md-3">
        <div class="stat-card bg-light">
          <div class="fs-3 fw-bold">{{ bookings.length }}</div>
          <div class="text-muted small">Total bookings</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card stat-warning">
          <div class="fs-3 fw-bold">{{ pending.length }}</div>
          <div class="text-muted small">Pending</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card stat-success">
          <div class="fs-3 fw-bold">{{ accepted.length }}</div>
          <div class="text-muted small">Accepted</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card stat-info">
          <div class="fs-3 fw-bold">{{ paymentNotification.length }}</div>
          <div class="text-muted small">Paid online</div>
        </div>
      </div>
    </div>

    <!-- Onsite payments -->
    <div v-if="onsitePayments.length" class="mb-4">
      <h2 class="section-title">
        <i class="bi bi-house-door me-1"></i>Pending onsite payments
      </h2>
      <div class="card border-warning border-2">
        <div class="table-responsive">
          <table class="table table-hover mb-0 small">
            <thead class="table-warning">
              <tr>
                <th>Customer</th>
                <th class="d-none d-sm-table-cell">Car</th>
                <th class="d-none d-md-table-cell">Date</th>
                <th class="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in onsitePayments" :key="b.id">
                <td>
                  <div class="fw-semibold">{{ b.customerName }}</div>
                  <!-- collapsed details shown only on xs -->
                  <div class="text-muted d-sm-none" style="font-size:11px;">
                    {{ b.car }} · {{ b.date }}
                  </div>
                </td>
                <td class="d-none d-sm-table-cell">{{ b.car }}</td>
                <td class="d-none d-md-table-cell">{{ b.date }}</td>
                <td class="text-end fw-bold">₦{{ b.invoiceTotal?.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Online payments -->
    <div v-if="paymentNotification.length" class="mb-4">
      <h2 class="section-title">
        <i class="bi bi-credit-card me-1"></i>Online payments received
      </h2>
      <div class="d-flex flex-column gap-2">
        <div
          v-for="b in paymentNotification"
          :key="b.id"
          class="alert alert-success d-flex justify-content-between align-items-center mb-0 py-2 px-3"
        >
          <div>
            <strong>{{ b.customerName }}</strong>
            <div class="small">{{ b.car }} · {{ b.date }}</div>
          </div>
          <span class="fw-bold text-nowrap ms-2">₦{{ b.invoiceTotal?.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- All bookings -->
    <h2 class="section-title">All bookings</h2>
    <div class="d-flex flex-column gap-3">
      <div v-for="b in bookings" :key="b.id" class="card booking-card">
        <div class="card-body">

          <!-- Header row -->
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div class="fw-bold" style="font-size:15px;">{{ b.customerName }}</div>
              <div class="text-muted small">{{ b.car }} · {{ b.date }}</div>
            </div>
            <span class="badge-status" :class="statusBadge(b.status)">{{ b.status }}</span>
          </div>

          <!-- Accept / Decline — stacks to full-width on xs -->
          <div v-if="b.status === 'PENDING'" class="d-flex flex-wrap gap-2 mb-2">
            <button class="btn btn-sm btn-success flex-fill flex-sm-grow-0" @click="updateStatus(b, 'ACCEPTED')">
              <i class="bi bi-check-lg me-1"></i>Accept
            </button>
            <button class="btn btn-sm btn-outline-danger flex-fill flex-sm-grow-0" @click="updateStatus(b, 'DECLINED')">
              <i class="bi bi-x-lg me-1"></i>Decline
            </button>
          </div>

          <!-- Invoice section -->
          <div v-if="b.status === 'ACCEPTED'">
            <hr class="my-2">
            <div class="fw-semibold mb-2 small">Invoice</div>

            <div v-if="b.invoiceItems?.length" class="mb-3">
              <div class="table-responsive">
                <table class="table table-sm mb-0 small">
                  <thead class="table-light">
                    <tr>
                      <th>Item</th>
                      <th class="text-end">Qty</th>
                      <!-- hide unit price on xs, show on sm+ -->
                      <th class="text-end d-none d-sm-table-cell">Price</th>
                      <th class="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in b.invoiceItems" :key="item.id">
                      <td>{{ item.name }}</td>
                      <td class="text-end">{{ item.quantity }}</td>
                      <td class="text-end d-none d-sm-table-cell">₦{{ item.price.toLocaleString() }}</td>
                      <td class="text-end">₦{{ (item.price * item.quantity).toLocaleString() }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="fw-bold">
                      <td colspan="2">Total</td>
                      <td class="text-end d-none d-sm-table-cell"></td>
                      <td class="text-end">₦{{ b.invoiceTotal?.toLocaleString() }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div class="mt-2">
                <span v-if="b.paymentStatus === 'PAID'" class="badge-status badge-paid">
                  <i class="bi bi-credit-card me-1"></i>Paid online
                </span>
                <span v-else-if="b.paymentStatus === 'PAY_ONSITE'" class="badge-status badge-onsite">
                  <i class="bi bi-house-door me-1"></i>Pay onsite
                </span>
                <span v-else class="badge-status badge-awaiting">Awaiting payment</span>
              </div>
            </div>

            <!-- Invoice form -->
            <div class="bg-light rounded p-3">
              <div class="fw-semibold mb-2" style="font-size:12px;">
                {{ b.invoiceItems?.length ? 'Update invoice' : 'Add invoice items' }}
              </div>
              <div
                v-for="(item, index) in invoiceForms[b.id]"
                :key="index"
                class="row g-2 mb-2"
              >
                <!-- name: full-width on xs, 5/12 on sm+ -->
                <div class="col-12 col-sm-5">
                  <input v-model="item.name" class="form-control form-control-sm" placeholder="Part / service">
                </div>
                <div class="col-6 col-sm-4">
                  <input v-model.number="item.price" class="form-control form-control-sm" type="number" placeholder="Price">
                </div>
                <div class="col-4 col-sm-2">
                  <input v-model.number="item.quantity" class="form-control form-control-sm" type="number" placeholder="Qty" min="1">
                </div>
                <div class="col-2 col-sm-1">
                  <button class="btn btn-sm btn-outline-danger w-100" @click="removeItem(b.id, index)">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2 mt-2">
                <button class="btn btn-sm btn-outline-secondary" @click="addItem(b.id)">
                  <i class="bi bi-plus me-1"></i>Add item
                </button>
                <button
                  class="btn btn-sm btn-dark"
                  :disabled="!invoiceForms[b.id]?.length"
                  @click="sendInvoice(b)"
                >
                  Send invoice
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <p v-if="!bookings.length" class="text-muted small">No bookings yet.</p>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  border-radius: 10px;
  padding: 1rem;
  text-align: center;
}
.stat-warning { background: #fff8e1; }
.stat-warning .fs-3 { color: #b45309; }
.stat-success { background: #f0fdf4; }
.stat-success .fs-3 { color: #166534; }
.stat-info { background: #eff6ff; }
.stat-info .fs-3 { color: #1d4ed8; }

.booking-card { border-radius: 12px; }

.section-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; }

.badge-status {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
  white-space: nowrap;
}
.badge-paid    { background: #dcfce7; color: #166534; }
.badge-onsite  { background: #fef9c3; color: #854d0e; }
.badge-awaiting{ background: #f3f4f6; color: #4b5563; }
</style>

<script setup>
  const router = useRouter()
const bookings = ref([])
const invoiceForms = ref({})

async function fetchBookings() {
  bookings.value = await $fetch('/api/bookings')
  // init invoice form for each booking
  bookings.value.forEach(b => {
    if (!invoiceForms.value[b.id]) {
      invoiceForms.value[b.id] = []
    }
  })
}

onMounted(fetchBookings)

const pending = computed(() => bookings.value.filter(b => b.status === 'PENDING'))
const accepted = computed(() => bookings.value.filter(b => b.status === 'ACCEPTED'))
const onsitePayments = computed(() => bookings.value.filter(b => b.paymentStatus === 'PAY_ONSITE'))
const paymentNotification = computed(() => bookings.value.filter(b => b.paymentStatus === 'PAID'))

async function updateStatus(booking, status) {
  const updated = await $fetch(`/api/bookings/${booking.id}`, {
    method: 'PATCH',
    body: { status },
  })
  const index = bookings.value.findIndex(b => b.id === booking.id)
  bookings.value[index] = updated
}

function addItem(bookingId) {
  if (!invoiceForms.value[bookingId]) invoiceForms.value[bookingId] = []
  invoiceForms.value[bookingId].push({ name: '', price: 0, quantity: 1 })
}

function removeItem(bookingId, index) {
  invoiceForms.value[bookingId].splice(index, 1)
}

async function sendInvoice(booking) {
  const items = invoiceForms.value[booking.id]
  if (!items?.length) return

  const updated = await $fetch(`/api/bookings/${booking.id}`, {
    method: 'PATCH',
    body: { invoiceItems: items },
  })

  const index = bookings.value.findIndex(b => b.id === booking.id)
  bookings.value[index] = updated
  invoiceForms.value[booking.id] = []
}

function statusBadge(status) {
  return {
    PENDING: 'bg-warning text-dark',
    ACCEPTED: 'bg-success text-white',
    DECLINED: 'bg-danger text-white',
  }[status] || 'bg-secondary text-white'
}
</script>