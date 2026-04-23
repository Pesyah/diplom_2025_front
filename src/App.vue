<template>
  <div class="min-vh-100 bg-light">
    <AppNavbar />
    <main class="container py-4">
      <RouterView />
    </main>
  </div>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
  />
</template>

<script setup lang="ts">
import AppNavbar from '@/components/common/AppNavbar.vue';
</script>
