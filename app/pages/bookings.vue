<template>
  <div>
    <h1>Book Appointment</h1>

    <input v-model="name" placeholder="Name" />
    <input v-model="car" placeholder="Car model" />

    <select v-model="date">
      <option v-for="d in dates" :key="d.date" :value="d.date">
        {{ d.date }} ({{ d.capacity }} slots)
      </option>
    </select>

    <button @click="book">Book</button>

    <p>Active jobs: {{ jobs?.length || 0 }}</p>
  </div>
</template>

<script setup>
const name = ref('')
const car = ref('')
const date = ref('')
const dates = ref([])
const jobs = ref([])

onMounted(async () => {
  dates.value = await $fetch('/api/available-dates')
  jobs.value = await $fetch('/api/jobs')
})

async function book() {
  await $fetch('/api/bookings', {
    method: 'POST',
    body: {
      customerName: name.value,
      car: car.value,
      date: date.value,
    },
  })

  
  jobs.value = await $fetch('/api/jobs')

  alert('Booked!')
}
</script>