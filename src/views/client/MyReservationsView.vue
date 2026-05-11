<template>
  <div class="container py-4">
    <h2 class="mb-4" style="color: #4c4993">📋 Мои бронирования</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <div
      v-else-if="reservations.length === 0"
      class="text-center py-5 text-muted"
    >
      <div class="fs-1 mb-2">🏨</div>
      <p>У вас пока нет бронирований</p>
      <router-link
        to="/rooms"
        class="btn"
        style="background-color: #4c4993; color: #fff"
      >
        Перейти к номерам
      </router-link>
    </div>

    <div v-else class="row g-4">
      <div v-for="res in reservations" :key="res.id" class="col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 style="color: #4c4993">
                  {{ res.room?.roomsType?.name }} №{{ res.room?.roomNumber }}
                </h5>
                <small class="text-muted"
                  >Забронировано {{ formatDate(res.createdAt) }}</small
                >
              </div>
              <span
                class="badge"
                :style="getStatusStyle(res.reservationStatus?.id)"
              >
                {{ res.reservationStatus?.name }}
              </span>
            </div>

            <div class="row mb-2">
              <div class="col-6">
                <small class="text-muted">Заезд:</small>
                <div class="fw-bold">{{ formatDate(res.checkInDate) }}</div>
              </div>
              <div class="col-6">
                <small class="text-muted">Выезд:</small>
                <div class="fw-bold">{{ formatDate(res.checkOutDate) }}</div>
              </div>
            </div>

            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Гостей:</span>
              <span>{{ res.numberOfGuests }}</span>
            </div>

            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Сумма:</span>
              <span class="fw-bold" style="color: #4c4993"
                >{{ res.totalPrice }} ₽</span
              >
            </div>

            <div v-if="res.specialRequests" class="mb-3">
              <small class="text-muted">Пожелания:</small>
              <p class="mb-0 small">{{ res.specialRequests }}</p>
            </div>

            <div v-if="res.cancellationReason" class="mb-3">
              <small class="text-muted">Причина отмены:</small>
              <p class="mb-0 small text-danger">{{ res.cancellationReason }}</p>
            </div>

            <!-- Кнопка отмены -->
            <button
              v-if="[1, 2].includes(res.reservationStatus?.id)"
              class="btn btn-sm w-100"
              style="background-color: #fde8e8; color: #c0392b"
              @click="openCancelModal(res)"
            >
              Отменить бронирование
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка отмены -->
    <div
      v-if="showCancelModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div
            class="modal-header"
            style="background-color: #c0392b; color: #fff"
          >
            <h5 class="modal-title">Отмена бронирования</h5>
            <button
              class="btn-close btn-close-white"
              @click="showCancelModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Причина отмены *</label>
              <textarea
                v-model="cancelReason"
                class="form-control"
                rows="2"
                required
              ></textarea>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button
                class="btn btn-secondary"
                @click="showCancelModal = false"
              >
                Закрыть
              </button>
              <button
                class="btn btn-danger"
                :disabled="cancelling"
                @click="handleCancel"
              >
                {{ cancelling ? '...' : 'Отменить бронь' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { onMounted, ref } from 'vue';

interface Reservation {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  numberOfGuests: number;
  specialRequests: string | null;
  cancellationReason: string | null;
  createdAt: string;
  reservationStatus: { id: number; name: string } | null;
  room: { roomNumber: string; roomsType: { name: string } | null } | null;
}

const reservations = ref<Reservation[]>([]);
const loading = ref(true);

const showCancelModal = ref(false);
const cancelReason = ref('');
const cancelId = ref('');
const cancelling = ref(false);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const getStatusStyle = (id: number | undefined) => {
  const map: Record<number, any> = {
    1: { backgroundColor: '#f5f0eb', color: '#856404' },
    2: { backgroundColor: '#bfc9ed', color: '#2d2640' },
    3: { backgroundColor: '#a1cdc4', color: '#1a3c34' },
    4: { backgroundColor: '#e8e8e8', color: '#555' },
    5: { backgroundColor: '#fde8e8', color: '#c0392b' },
  };
  return map[id ?? 0] || {};
};

const openCancelModal = (res: Reservation) => {
  cancelId.value = res.id;
  cancelReason.value = '';
  showCancelModal.value = true;
};

const handleCancel = async () => {
  cancelling.value = true;
  try {
    await client.patch(`/reservations/cancel/${cancelId.value}`, {
      cancellationReason: cancelReason.value,
    });
    showCancelModal.value = false;
    await fetchReservations();
  } catch (err) {
    console.error('Ошибка отмены:', err);
  } finally {
    cancelling.value = false;
  }
};

const fetchReservations = async () => {
  try {
    const res = await client.get('/reservations/my');
    reservations.value = res.data;
  } catch (err) {
    console.error('Ошибка загрузки броней:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchReservations();
});
</script>
