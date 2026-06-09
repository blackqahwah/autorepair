<!-- app/pages/bookings.vue -->
<template>
  <div class="container py-5" style="max-width: 680px">
    <h1 class="mb-4 fw-bold">Book Appointment</h1>

    <!-- Booking form -->
    <div v-if="!currentBooking" class="card border-0 shadow-sm p-4">
      <div class="mb-3">
        <label class="form-label fw-semibold">Your Name</label>
        <input v-model="name" class="form-control" placeholder="e.g. Amina Yusuf" />
      </div>

      <div class="mb-3">
        <label class="form-label fw-semibold">Car Model</label>
        <input v-model="car" class="form-control" placeholder="e.g. Toyota Camry 2019" />
      </div>

      <div class="mb-4">
        <label class="form-label fw-semibold">Choose a Date</label>
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
        {{ booking ? 'Booking...' : 'Book Appointment' }}
      </button>

      <p v-if="!name || !car || !date" class="text-muted small mt-2 mb-0">
        All fields are required to book.
      </p>
    </div>

    <!-- Post-booking status view -->
    <div v-else class="card border-0 shadow-sm p-4">
      <div class="mb-3 pb-3 border-bottom">
        <p class="text-muted small mb-1">Booking for</p>
        <p class="fw-bold mb-0">{{ currentBooking.customerName }} — {{ currentBooking.car }}</p>
        <p class="text-muted small">{{ currentBooking.date }}</p>
      </div>

      <div class="mb-3">
        <span class="badge fs-6 px-3 py-2" :class="statusBadge(currentBooking.status)">
          {{ statusLabel(currentBooking.status) }}
        </span>
      </div>

      <!-- Invoice section -->
      <div v-if="currentBooking.invoiceItems?.length" class="mt-3">
        <h5 class="fw-semibold mb-3">Invoice</h5>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Service / Part</th>
              <th class="text-end">Qty</th>
              <th class="text-end">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in currentBooking.invoiceItems" :key="item.id">
              <td>{{ item.name }}</td>
              <td class="text-end">{{ item.quantity }}</td>
              <td class="text-end">₦{{ (item.price * item.quantity).toLocaleString() }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="fw-bold">
              <td colspan="2">Total</td>
              <td class="text-end">₦{{ currentBooking.invoiceTotal?.toLocaleString() }}</td>
            </tr>
          </tfoot>
        </table>

        <div v-if="currentBooking.paymentStatus === 'UNPAID'" class="d-flex gap-2 mt-3">
          <button class="btn btn-success flex-grow-1" @click="pay('ONLINE')">
            💳 Pay Now
          </button>
          <button class="btn btn-outline-secondary flex-grow-1" @click="pay('ONSITE')">
            🏠 Pay Onsite
          </button>
        </div>

        <div v-else-if="currentBooking.paymentStatus === 'PAID'" class="alert alert-success mt-3 mb-0">
          ✅ Payment received. Thank you!
        </div>

        <div v-else-if="currentBooking.paymentStatus === 'PAY_ONSITE'" class="alert alert-info mt-3 mb-0">
          🏠 You've chosen to pay onsite. Please bring payment on the day.
        </div>
      </div>

      <button class="btn btn-link text-muted mt-4 p-0 small" @click="clearBooking">
        ← Make another booking
      </button>
    </div>
  </div>
</template>

<script setup>
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