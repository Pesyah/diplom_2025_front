<template>
  <DashboardView v-if="isAdmin" />
  <MenuView v-else />
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';
import DashboardView from './admin/DashboardView.vue';
import MenuView from './MenuView.vue';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.user?.roleType?.name === 'admin');
</script>
