<!-- app/pages/dashboard.vue -->
<template>
  <div class="container py-5">
    <h1 class="fw-bold mb-5">Dashboard</h1>

    <!-- Summary -->
    <div class="row g-3 mb-5">
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-light p-3 text-center">
          <div class="fs-2 fw-bold">{{ bookings.length }}</div>
          <div class="text-muted small">Total Bookings</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-warning bg-opacity-25 p-3 text-center">
          <div class="fs-2 fw-bold">{{ pending.length }}</div>
          <div class="text-muted small">Pending</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-success bg-opacity-25 p-3 text-center">
          <div class="fs-2 fw-bold">{{ accepted.length }}</div>
          <div class="text-muted small">Accepted</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 bg-info bg-opacity-25 p-3 text-center">
          <div class="fs-2 fw-bold">{{ paymentNotification.length }}</div>
          <div class="text-muted small">Paid Online</div>
        </div>
      </div>
    </div>

    <!-- Pending Payments (pay onsite) -->
    <div v-if="onsitePayments.length" class="mb-5">
      <h4 class="fw-semibold mb-3">🏠 Pending Payments (Onsite)</h4>
      <div class="card border-warning border-2">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-warning">
              <tr>
                <th>Customer</th>
                <th>Car</th>
                <th>Date</th>
                <th>Items</th>
                <th class="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in onsitePayments" :key="b.id">
                <td class="fw-semibold">{{ b.customerName }}</td>
                <td>{{ b.car }}</td>
                <td>{{ b.date }}</td>
                <td>
                  <ul class="list-unstyled mb-0 small">
                    <li v-for="item in b.invoiceItems" :key="item.id">
                      {{ item.name }} × {{ item.quantity }} — ₦{{ (item.price * item.quantity).toLocaleString() }}
                    </li>
                  </ul>
                </td>
                <td class="text-end fw-bold">₦{{ b.invoiceTotal?.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Online payment notifications -->
    <div v-if="paymentNotification.length" class="mb-5">
      <h4 class="fw-semibold mb-3">💳 Online Payments Received</h4>
      <div class="d-flex flex-column gap-2">
        <div
          v-for="b in paymentNotification"
          :key="b.id"
          class="alert alert-success d-flex justify-content-between align-items-center mb-0"
        >
          <span>
            <strong>{{ b.customerName }}</strong> — {{ b.car }} on {{ b.date }}
          </span>
          <span class="fw-bold">₦{{ b.invoiceTotal?.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- All bookings -->
    <h4 class="fw-semibold mb-3">All Bookings</h4>
    <div class="d-flex flex-column gap-4">
      <div
        v-for="b in bookings"
        :key="b.id"
        class="card border-0 shadow-sm"
      >
        <div class="card-body">
          <!-- Booking info -->
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 class="fw-bold mb-1">{{ b.customerName }}</h5>
              <p class="text-muted mb-0 small">{{ b.car }} · {{ b.date }}</p>
            </div>
            <span class="badge px-3 py-2" :class="statusBadge(b.status)">
              {{ b.status }}
            </span>
          </div>

          <!-- Accept / Decline -->
          <div v-if="b.status === 'PENDING'" class="d-flex gap-2 mb-3">
            <button class="btn btn-sm btn-success" @click="updateStatus(b, 'ACCEPTED')">
              ✓ Accept
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="updateStatus(b, 'DECLINED')">
              ✗ Decline
            </button>
          </div>

          <!-- Invoice builder (only for accepted bookings) -->
          <div v-if="b.status === 'ACCEPTED'">
            <hr />
            <h6 class="fw-semibold mb-3">Invoice</h6>

            <!-- Existing invoice items -->
            <div v-if="b.invoiceItems?.length" class="mb-3">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th class="text-end">Qty</th>
                    <th class="text-end">Price</th>
                    <th class="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in b.invoiceItems" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td class="text-end">{{ item.quantity }}</td>
                    <td class="text-end">₦{{ item.price.toLocaleString() }}</td>
                    <td class="text-end">₦{{ (item.price * item.quantity).toLocaleString() }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="fw-bold">
                    <td colspan="3">Total</td>
                    <td class="text-end">₦{{ b.invoiceTotal?.toLocaleString() }}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Payment status badge -->
              <div class="mt-2">
                <span v-if="b.paymentStatus === 'PAID'" class="badge bg-success">💳 Paid Online</span>
                <span v-else-if="b.paymentStatus === 'PAY_ONSITE'" class="badge bg-warning text-dark">🏠 Pay Onsite</span>
                <span v-else class="badge bg-secondary">Awaiting Payment</span>
              </div>
            </div>

            <!-- Add invoice items form -->
            <div class="bg-light rounded p-3">
              <p class="small fw-semibold mb-2">{{ b.invoiceItems?.length ? 'Update Invoice' : 'Add Invoice Items' }}</p>
              <div
                v-for="(item, index) in invoiceForms[b.id]"
                :key="index"
                class="row g-2 mb-2"
              >
                <div class="col-5">
                  <input v-model="item.name" class="form-control form-control-sm" placeholder="Part / Service" />
                </div>
                <div class="col-3">
                  <input v-model.number="item.price" class="form-control form-control-sm" type="number" placeholder="Price" />
                </div>
                <div class="col-2">
                  <input v-model.number="item.quantity" class="form-control form-control-sm" type="number" placeholder="Qty" min="1" />
                </div>
                <div class="col-2">
                  <button class="btn btn-sm btn-outline-danger w-100" @click="removeItem(b.id, index)">✕</button>
                </div>
              </div>

              <div class="d-flex gap-2 mt-2">
                <button class="btn btn-sm btn-outline-secondary" @click="addItem(b.id)">
                  + Add item
                </button>
                <button
                  class="btn btn-sm btn-dark"
                  :disabled="!invoiceForms[b.id]?.length"
                  @click="sendInvoice(b)"
                >
                  Send Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p v-if="!bookings.length" class="text-muted">No bookings yet.</p>
    </div>
  </div>
</template>

<script setup>
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