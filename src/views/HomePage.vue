<template>
  <div>
    <!-- Админ -->
    <div v-if="isAdmin">
      <h1 class="mb-4">📊 Админ-панель</h1>

      <div class="row g-4">
        <div class="col-md-6 col-lg-3">
          <router-link to="/alerts" class="text-decoration-none">
            <div class="card border-primary h-100">
              <div class="card-body text-center">
                <div class="fs-1 mb-2">📋</div>
                <h5 class="card-title">Уведомления</h5>
                <p class="card-text text-muted small">
                  Управление уведомлениями
                </p>
              </div>
            </div>
          </router-link>
        </div>

        <div class="col-md-6 col-lg-3">
          <router-link to="/global-alerts" class="text-decoration-none">
            <div class="card border-success h-100">
              <div class="card-body text-center">
                <div class="fs-1 mb-2">🌍</div>
                <h5 class="card-title">Глобальные</h5>
                <p class="card-text text-muted small">Глобальные объявления</p>
              </div>
            </div>
          </router-link>
        </div>

        <div class="col-md-6 col-lg-3">
          <router-link to="/structure" class="text-decoration-none">
            <div class="card border-warning h-100">
              <div class="card-body text-center">
                <div class="fs-1 mb-2">🏛</div>
                <h5 class="card-title">Структура</h5>
                <p class="card-text text-muted small">Управление структурой</p>
              </div>
            </div>
          </router-link>
        </div>

        <div class="col-md-6 col-lg-3">
          <router-link to="/users" class="text-decoration-none">
            <div class="card border-info h-100">
              <div class="card-body text-center">
                <div class="fs-1 mb-2">👥</div>
                <h5 class="card-title">Пользователи</h5>
                <p class="card-text text-muted small">Список пользователей</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Обычный пользователь -->
    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1>🔔 Мои уведомления</h1>
        <router-link v-if="isElder" to="/alerts/create" class="btn btn-primary">
          + Создать уведомление
        </router-link>
      </div>

      <!-- Информация о пользователе -->
      <div class="card mb-4">
        <div class="card-body">
          <h5 class="card-title">
            {{ user?.name }} {{ user?.surname }}
            <span v-if="isElder" class="badge bg-warning text-dark ms-2"
              >👑 Староста</span
            >
          </h5>
          <p class="card-text text-muted mb-1">
            <strong>Email:</strong> {{ user?.email }}
          </p>
          <p class="card-text text-muted mb-1" v-if="userGroup">
            <strong>Группа:</strong> {{ userGroup.name }}
          </p>
          <p class="card-text text-muted mb-1" v-if="userDepartment">
            <strong>Кафедра:</strong> {{ userDepartment.name }}
          </p>
          <p class="card-text text-muted mb-0" v-if="userFaculty">
            <strong>Факультет:</strong>
            {{ userFaculty.shortName || userFaculty.name }}
          </p>
        </div>
      </div>

      <!-- Список уведомлений -->
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>

      <div v-else-if="alerts.length === 0" class="text-center py-4">
        <p class="text-muted">Уведомлений пока нет</p>
      </div>

      <div v-else>
        <div class="list-group">
          <router-link
            v-for="alert in alerts"
            :key="alert.id"
            :to="`/alerts/${alert.id}`"
            class="list-group-item list-group-item-action"
          >
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span
                  v-if="alert.alertsType"
                  class="badge me-2"
                  :style="{ backgroundColor: '#' + alert.alertsType.color }"
                >
                  {{ alert.alertsType.name }}
                </span>
                <strong>{{ alert.title }}</strong>
              </div>
              <small class="text-muted">{{
                formatDate(alert.created_at)
              }}</small>
            </div>
            <p class="mb-0 text-muted small text-truncate mt-1">
              {{ alert.description }}
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { alertsApi, type Alert } from '@/api/alerts';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';

const userStore = useUserStore();

const isAdmin = computed(() => userStore.isAdmin);
const isElder = computed(() => userStore.isElder);
const user = computed(() => userStore.user);
const userGroup = computed(() => userStore.userGroup);
const userDepartment = computed(() => userStore.userDepartment);
const userFaculty = computed(() => userStore.userFaculty);

const alerts = ref<Alert[]>([]);
const loading = ref(true);

const fetchAlerts = async () => {
  try {
    loading.value = true;
    const res = await alertsApi.getAlerts(1, 10);
    alerts.value = res.data.data || [];
  } catch (err) {
    console.error('Ошибка загрузки уведомлений:', err);
  } finally {
    loading.value = false;
  }
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
