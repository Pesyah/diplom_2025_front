<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Уведомления</h1>
      <router-link v-if="isAdmin" to="/alerts/create" class="btn btn-primary">
        + Создать уведомление
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>

    <div v-else-if="!alerts || alerts.length === 0" class="text-center py-5">
      <p class="text-muted">Уведомлений пока нет</p>
    </div>

    <div v-else>
      <div class="row">
        <div class="col-md-6 mb-3" v-for="alert in alerts" :key="alert.id">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">{{ alert.title }}</h5>
              <p
                class="card-text text-truncate"
                style="max-height: 4.5rem; overflow: hidden"
              >
                {{ alert.description }}
              </p>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">{{
                  formatDate(alert.createdAt)
                }}</small>
                <div>
                  <router-link
                    :to="`/alerts/${alert.id}`"
                    class="btn btn-sm btn-outline-primary me-1"
                  >
                    Просмотр
                  </router-link>
                  <button
                    v-if="isAdmin"
                    @click="deleteAlert(alert.id)"
                    class="btn btn-sm btn-outline-danger"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Пагинация -->
      <nav v-if="totalPages > 1" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="changePage(currentPage - 1)">
              Назад
            </button>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <button class="page-link" @click="changePage(page)">
              {{ page }}
            </button>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
          >
            <button class="page-link" @click="changePage(currentPage + 1)">
              Вперед
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { alertsApi, type Alert } from '@/api/alerts';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.role === 'admin');

const alerts = ref<Alert[]>([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
};

const fetchAlerts = async () => {
  loading.value = true;
  try {
    const res = await alertsApi.getAlerts(currentPage.value, limit);
    console.log('Alerts response:', res.data);

    // Адаптивная обработка разных возможных структур
    if (Array.isArray(res.data)) {
      alerts.value = res.data;
      totalPages.value = 1;
    } else if (res.data && Array.isArray(res.data.data)) {
      alerts.value = res.data.data;
      totalPages.value = Math.ceil((res.data.total || 0) / limit);
    } else if (res.data && Array.isArray(res.data.items)) {
      alerts.value = res.data.items;
      totalPages.value = Math.ceil((res.data.total || 0) / limit);
    } else {
      alerts.value = [];
      totalPages.value = 1;
    }
  } catch (err) {
    console.error(err);
    alerts.value = [];
    totalPages.value = 1;
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchAlerts();
};

const deleteAlert = async (id: string) => {
  if (!confirm('Удалить уведомление?')) return;
  try {
    await alertsApi.deleteAlert(id);
    await fetchAlerts();
  } catch (err) {
    alert('Ошибка удаления');
  }
};

onMounted(() => {
  fetchAlerts();
});
</script>
