<template>
  <div class="min-vh-100 bg-light">
    <AppNavbar />
    <main class="container py-4">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '@/components/common/AppNavbar.vue';
</script>
