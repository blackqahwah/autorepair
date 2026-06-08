<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">
      Auto Repair Workshop
    </h1>

    <p class="text-gray-600">
      Manage bookings, jobs, repairs, and invoices.
    </p>

    <!-- Navigation -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
      <NuxtLink to="/bookings" class="card">
        📅 Book Appointment
      </NuxtLink>

     <NuxtLink to="/dashboard">Go to dashboard</NuxtLink>

      <NuxtLink to="/insights" class="card">
        📊 Workshop Insights
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.card {
  display: block;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: 0.2s;
}
.card:hover {
  background: #f5f5f5;
}
</style>