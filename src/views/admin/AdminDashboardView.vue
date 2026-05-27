<template>
  <div class="container-fluid py-4">
    <h2 class="mb-4" style="color: #4c4993">📊 Дашборд</h2>

    <!-- Карточки статистики -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div
          class="card shadow-sm p-3 text-center"
          style="background-color: #a1cdc4; color: #1a3c34"
        >
          <div class="fs-1 fw-bold">{{ stats.freeRooms }}</div>
          <div>Свободных номеров</div>
        </div>
      </div>
      <div class="col-md-3">
        <div
          class="card shadow-sm p-3 text-center"
          style="background-color: #bfc9ed; color: #2d2640"
        >
          <div class="fs-1 fw-bold">{{ stats.occupiedRooms }}</div>
          <div>Занятых номеров</div>
        </div>
      </div>
      <div class="col-md-3">
        <div
          class="card shadow-sm p-3 text-center"
          style="background-color: #fde8e8; color: #c0392b"
        >
          <div class="fs-1 fw-bold">{{ stats.maintenanceRooms }}</div>
          <div>На обслуживании</div>
        </div>
      </div>
      <div class="col-md-3">
        <div
          class="card shadow-sm p-3 text-center"
          style="background-color: #f5f0eb; color: #856404"
        >
          <div class="fs-1 fw-bold">{{ stats.activeReservations }}</div>
          <div>Активных броней</div>
        </div>
      </div>
    </div>

    <!-- Быстрые ссылки -->
    <div class="row g-3">
      <div class="col-md-4">
        <router-link to="/admin/reservations" class="text-decoration-none">
          <div class="card shadow-sm p-4" style="cursor: pointer">
            <div class="fs-4">📋 Бронирования</div>
            <small class="text-muted"
              >Управление бронями, заселение, выселение</small
            >
          </div>
        </router-link>
      </div>
      <div class="col-md-4">
        <router-link to="/admin/rooms" class="text-decoration-none">
          <div class="card shadow-sm p-4" style="cursor: pointer">
            <div class="fs-4">🏨 Номера</div>
            <small class="text-muted"
              >Просмотр номеров,
              <template v-if="isAdmin">создание, редактирование</template>
              <template v-else>управление статусами</template>
            </small>
          </div>
        </router-link>
      </div>
      <div class="col-md-4">
        <router-link to="/admin/users" class="text-decoration-none">
          <div class="card shadow-sm p-4" style="cursor: pointer">
            <div class="fs-4">👥 Гости</div>
            <small class="text-muted">Поиск гостей, заполнение паспортов</small>
          </div>
        </router-link>
      </div>
      <div class="col-md-4">
        <router-link to="/admin/reports" class="text-decoration-none">
          <div class="card shadow-sm p-4" style="cursor: pointer">
            <div class="fs-4">📈 Отчеты</div>
            <small class="text-muted">Выручка и загрузка по комнатам и месяцам</small>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Админ: быстрые ссылки -->
    <div v-if="isAdmin" class="row g-3 mt-1">
      <div class="col-md-4">
        <router-link to="/admin/amenities" class="text-decoration-none">
          <div class="card shadow-sm p-4" style="cursor: pointer">
            <div class="fs-4">🛠 Удобства</div>
            <small class="text-muted">Управление удобствами номеров</small>
          </div>
        </router-link>
      </div>
      <div class="col-md-4">
        <router-link to="/admin/create-manager" class="text-decoration-none">
          <div class="card shadow-sm p-4" style="cursor: pointer">
            <div class="fs-4">👤 Создать менеджера</div>
            <small class="text-muted">Регистрация нового менеджера</small>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';

const userStore = useUserStore();
const isAdmin = computed(() => userStore.user?.roleType?.name === 'admin');

const stats = ref({
  freeRooms: 0,
  occupiedRooms: 0,
  maintenanceRooms: 0,
  activeReservations: 0,
});

onMounted(async () => {
  try {
    const [roomsRes, resRes] = await Promise.all([
      client.get(isAdmin.value ? '/rooms/all-admin' : '/rooms/all'),
      client.get('/reservations/all'),
    ]);

    const rooms = roomsRes.data;
    stats.value.freeRooms = rooms.filter(
      (r: any) => r.roomsStatus?.id === 1 && !r.deleted_at,
    ).length;
    stats.value.occupiedRooms = rooms.filter(
      (r: any) => r.roomsStatus?.id === 2,
    ).length;
    stats.value.maintenanceRooms = rooms.filter(
      (r: any) => r.roomsStatus?.id === 3,
    ).length;
    stats.value.activeReservations = resRes.data.filter((r: any) =>
      [1, 2, 3].includes(r.reservationStatus?.id),
    ).length;
  } catch (err) {
    console.error('Ошибка загрузки статистики:', err);
  }
});
</script>
