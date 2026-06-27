<template>
  <div class="px-3 py-4 booking-page">
    <button class="btn btn-link text-muted p-0 small" @click="router.back()">
  <i class="bi bi-arrow-left me-1"></i>Back
</button>
    <h1 class="fw-bold mb-4">Book appointment</h1>

    <!-- Booking form -->
    <div v-if="!currentBooking" class="card booking-card mb-4">
      <div class="card-body p-3 p-sm-4">

        <div class="mb-3">
          <label class="form-label fw-semibold small">Your name</label>
          <input v-model="name" class="form-control" placeholder="Amina Yusuf">
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold small">Car model</label>
          <input v-model="car" class="form-control" placeholder="Toyota Camry 2019">
        </div>

        <div class="mb-4">
          <label class="form-label fw-semibold small">Choose a date</label>
          <select v-model="date" class="form-select">
            <option value="" disabled>Select a date</option>
            <option v-for="d in dates" :key="d.date" :value="d.date">
              {{ d.date }} — {{ d.capacity }} slot{{ d.capacity !== 1 ? 's' : '' }} left
            </option>
          </select>
        </div>

        <button
          class="btn btn-dark w-100"
          :disabled="!name || !car || !date || booking"
          @click="book"
        >
          {{ booking ? 'Booking...' : 'Book appointment' }}
        </button>

        <p v-if="!name || !car || !date" class="text-muted mt-2 mb-0 small">
          All fields are required to book.
        </p>
      </div>
    </div>

    <!-- Post-booking status view -->
    <div v-else class="card booking-card">
      <div class="card-body p-3 p-sm-4">

        <div class="pb-3 mb-3 border-bottom">
          <p class="text-muted mb-1 small">Booking for</p>
          <div class="fw-bold" style="font-size: 15px;">
            {{ currentBooking.customerName }} — {{ currentBooking.car }}
          </div>
          <div class="text-muted small">{{ currentBooking.date }}</div>
        </div>

        <div class="mb-3">
          <span class="badge-status" :class="statusBadge(currentBooking.status)">
            {{ statusLabel(currentBooking.status) }}
          </span>
        </div>

        <!-- Invoice -->
        <div v-if="currentBooking.invoiceItems?.length" class="mt-3">
          <div class="fw-semibold mb-2 small">Invoice</div>

          <div class="table-responsive">
            <table class="table table-sm mb-0 small">
              <thead class="table-light">
                <tr>
                  <th>Service / part</th>
                  <th class="text-end">Qty</th>
                  <!-- unit price hidden on xs, shown sm+ -->
                  <th class="text-end d-none d-sm-table-cell">Unit price</th>
                  <th class="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in currentBooking.invoiceItems" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td class="text-end">{{ item.quantity }}</td>
                  <td class="text-end d-none d-sm-table-cell">₦{{ item.price.toLocaleString() }}</td>
                  <td class="text-end">₦{{ (item.price * item.quantity).toLocaleString() }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="fw-bold">
                  <td colspan="2">Total</td>
                  <td class="d-none d-sm-table-cell"></td>
                  <td class="text-end">₦{{ currentBooking.invoiceTotal?.toLocaleString() }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Payment actions -->
          <div v-if="currentBooking.paymentStatus === 'UNPAID'"
               class="d-flex flex-column flex-sm-row gap-2 mt-3">
            <button class="btn btn-success flex-sm-fill" @click="pay('ONLINE')">
              <i class="bi bi-credit-card me-1"></i>Pay now
            </button>
            <button class="btn btn-outline-secondary flex-sm-fill" @click="pay('ONSITE')">
              <i class="bi bi-house-door me-1"></i>Pay onsite
            </button>
          </div>

          <div v-else-if="currentBooking.paymentStatus === 'PAID'"
               class="alert alert-success d-flex align-items-center gap-2 mt-3 mb-0 py-2 px-3 small">
            <i class="bi bi-check-circle-fill"></i>
            Payment received. Thank you!
          </div>

          <div v-else-if="currentBooking.paymentStatus === 'PAY_ONSITE'"
               class="alert alert-info d-flex align-items-center gap-2 mt-3 mb-0 py-2 px-3 small">
            <i class="bi bi-house-door"></i>
            You've chosen to pay onsite. Please bring payment on the day.
          </div>
        </div>

        <button class="btn btn-link text-muted p-0 mt-4 small" @click="clearBooking">
          <i class="bi bi-arrow-left me-1"></i>Make another booking
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-page { max-width: 600px; margin: 0 auto; }

.booking-card { border-radius: 12px; }

/* card padding: tighter on mobile, roomier on sm+ */
/* handled by p-3 p-sm-4 Bootstrap utilities */

.badge-status {
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 500;
}
.badge-pending  { background: #fef9c3; color: #854d0e; }
.badge-accepted { background: #dcfce7; color: #166534; }
.badge-declined { background: #fee2e2; color: #991b1b; }
</style>

<script setup>
const router = useRouter()
const name = ref('')
const car = ref('')
const date = ref('')
const dates = ref([])
const booking = ref(false)
const currentBooking = ref(null)
let pollInterval = null

onMounted(async () => {
  dates.value = await $fetch('/api/available-dates')

  // restore booking from localStorage if it exists
  const savedId = localStorage.getItem('bookingId')
  if (savedId) {
    try {
      currentBooking.value = await $fetch(`/api/bookings/${savedId}`)
      startPolling(savedId)
    } catch {
      localStorage.removeItem('bookingId')
    }
  }
})

onUnmounted(() => {
  stopPolling()
})

function startPolling(id) {
  stopPolling()
  pollInterval = setInterval(async () => {
    try {
      currentBooking.value = await $fetch(`/api/bookings/${id}`)
    } catch {
      stopPolling()
    }
  }, 4000) // refresh every 4 seconds
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

async function book() {
  if (!name.value || !car.value || !date.value) return
  booking.value = true
  try {
    const result = await $fetch('/api/bookings', {
      method: 'POST',
      body: {
        customerName: name.value,
        car: car.value,
        date: date.value,
      },
    })
    currentBooking.value = result
    localStorage.setItem('bookingId', result.id)
    startPolling(result.id)
    dates.value = await $fetch('/api/available-dates')
  } finally {
    booking.value = false
  }
}

async function pay(method) {
  const updated = await $fetch(`/api/bookings/${currentBooking.value.id}`, {
    method: 'PATCH',
    body: {
      paymentStatus: method === 'ONLINE' ? 'PAID' : 'PAY_ONSITE',
      paymentMethod: method,
    },
  })
  currentBooking.value = updated
}

function clearBooking() {
  stopPolling()
  localStorage.removeItem('bookingId')
  currentBooking.value = null
}

function statusLabel(status) {
  return {
    PENDING: '⏳ Pending confirmation',
    ACCEPTED: '✅ Booking Accepted',
    DECLINED: '❌ Booking Declined',
  }[status] || status
}

function statusBadge(status) {
  return {
    PENDING: 'bg-warning text-dark',
    ACCEPTED: 'bg-success text-white',
    DECLINED: 'bg-danger text-white',
  }[status] || 'bg-secondary text-white'
}
</script>