<script setup>
const { data: jobs } = await useFetch('/api/jobs')
</script>

<template>
  <div>
    <h1>Dashboard</h1>

    <p>Active jobs: {{ jobs?.length || 0 }}</p>
  </div>
</template>