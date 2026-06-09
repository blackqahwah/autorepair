<script setup>
const route = useRoute()
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
  <div v-if="job" class="space-y-6 p-6">

    <h1 class="text-xl font-bold">
      Job #{{ job.id }}
    </h1>

    <!-- STATUS -->
    <div>
      <p><strong>Status:</strong> {{ job.status }}</p>

      <select v-model="newStatus">
        <option>BOOKED</option>
        <option>JOB_CARD_CREATED</option>
        <option>IN_PROGRESS</option>
        <option>AWAITING_PARTS</option>
        <option>ESTIMATE_SENT</option>
        <option>APPROVED</option>
        <option>READY_FOR_PICKUP</option>
        <option>COMPLETED</option>
      </select>

      <button @click="updateStatus">
        Update Status
      </button>
    </div>

    <!-- CUSTOMER + CAR -->
    <div>
      <p><strong>Customer:</strong> {{ job.customerName }}</p>
      <p><strong>Car:</strong> {{ job.car }}</p>
    </div>

    <!-- ESTIMATE -->
    <div>
      <p><strong>Estimate:</strong> £{{ job.estimate || 0 }}</p>
    </div>

    <!-- PARTS (simple MVP input) -->
    <div>
      <p><strong>Parts:</strong></p>
      <pre>{{ job.parts }}</pre>
    </div>

  </div>
</template>