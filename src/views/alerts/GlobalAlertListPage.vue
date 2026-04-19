<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Глобальные уведомления</h1>
      <router-link
        v-if="isAdmin"
        to="/global-alerts/create"
        class="btn btn-primary"
      >
        + Создать глобальное уведомление
      </router-link>
    </div>
    <p>Список глобальных уведомлений появится после реализации.</p>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.role === 'admin');
</script>
