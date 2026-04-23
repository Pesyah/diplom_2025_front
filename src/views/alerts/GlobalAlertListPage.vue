<!-- views/alerts/GlobalAlertListPage.vue -->
<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>🌍 Глобальные уведомления</h1>
      <router-link
        v-if="isAdmin"
        to="/global-alerts/create"
        class="btn btn-primary"
      >
        + Создать
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>

    <div v-else-if="alerts.length === 0" class="text-center py-5">
      <p class="text-muted">Глобальных уведомлений пока нет</p>
    </div>

    <div v-else>
      <div class="list-group">
        <router-link
          v-for="alert in alerts"
          :key="alert.id"
          :to="`/global-alerts/${alert.id}`"
          class="list-group-item list-group-item-action"
        >
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="mb-1">{{ alert.title }}</h5>
            <small class="text-muted">{{ formatDate(alert.createdAt) }}</small>
          </div>
          <p class="mb-1 text-muted text-truncate">{{ alert.description }}</p>
          <small v-if="alert.documents?.length" class="text-muted">
            📄 {{ alert.documents.length }} файл(ов)
          </small>
        </router-link>
      </div>

      <!-- Пагинация -->
      <div class="d-flex justify-content-center mt-4" v-if="total > limit">
        <button
          class="btn btn-outline-primary me-2"
          :disabled="page <= 1"
          @click="changePage(page - 1)"
        >
          Назад
        </button>
        <span class="align-self-center">Страница {{ page }}</span>
        <button
          class="btn btn-outline-primary ms-2"
          :disabled="page * limit >= total"
          @click="changePage(page + 1)"
        >
          Вперёд
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { alertsApi, type GlobalAlert } from '@/api/alerts';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.role === 'admin');

const alerts = ref<GlobalAlert[]>([]);
const loading = ref(true);
const page = ref(1);
const limit = ref(10);
const total = ref(0);

const fetchAlerts = async () => {
  loading.value = true;
  try {
    const res = await alertsApi.getGlobalAlerts(page.value, limit.value);
    alerts.value = res.data.data;
    total.value = res.data.total;
  } catch (err) {
    console.error('Ошибка загрузки:', err);
  } finally {
    loading.value = false;
  }
};

const changePage = (newPage: number) => {
  page.value = newPage;
  fetchAlerts();
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  fetchAlerts();
});
</script>
