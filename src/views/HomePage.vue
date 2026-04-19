<template>
  <div>
    <h1>Главная</h1>
    <p v-if="isAdmin">Админ-панель (будет дашборд)</p>
    <p v-else>Ваши уведомления (будут отображаться здесь)</p>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.role === 'admin');
</script>
