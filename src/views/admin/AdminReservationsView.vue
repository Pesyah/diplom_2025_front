<template>
  <div class="container-fluid py-4">
    <h2 class="mb-4" style="color: #4c4993">📋 Бронирования</h2>

    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead style="background-color: #4c4993; color: #fff">
            <tr>
              <th class="ps-3">Гость</th>
              <th>Номер</th>
              <th>Заезд</th>
              <th>Выезд</th>
              <th>Гостей</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th class="text-end pe-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="res in reservations"
              :key="res.id"
              style="vertical-align: middle"
            >
              <td class="ps-3">
                <div class="fw-bold">
                  {{ res.mainGuest?.surname }} {{ res.mainGuest?.name }}
                </div>
                <small class="text-muted">{{ res.mainGuest?.email }}</small>
              </td>
              <td>
                {{ res.room?.roomNumber }} ({{ res.room?.roomsType?.name }})
              </td>
              <td>{{ formatDate(res.checkInDate) }}</td>
              <td>{{ formatDate(res.checkOutDate) }}</td>
              <td>{{ res.numberOfGuests }}</td>
              <td>{{ res.totalPrice }} ₽</td>
              <td>
                <span
                  class="badge"
                  :style="getReservationStatusStyle(res.reservationStatus?.id)"
                >
                  {{ res.reservationStatus?.name }}
                </span>
              </td>
              <td class="text-end pe-3">
                <!-- Подтвердить -->
                <button
                  v-if="res.reservationStatus?.id === 1"
                  class="btn btn-sm me-1"
                  style="background-color: #a1cdc4; color: #1a3c34"
                  @click="handleConfirm(res.id)"
                >
                  ✅
                </button>
                <!-- Заселить -->
                <button
                  v-if="res.reservationStatus?.id === 2"
                  class="btn btn-sm me-1"
                  style="background-color: #bfc9ed; color: #2d2640"
                  @click="handleCheckIn(res.id)"
                >
                  🚪
                </button>
                <!-- Выселить -->
                <button
                  v-if="res.reservationStatus?.id === 3"
                  class="btn btn-sm me-1"
                  style="background-color: #fde8e8; color: #c0392b"
                  @click="handleCheckOut(res.id)"
                >
                  🏃
                </button>
                <!-- Отменить -->
                <button
                  v-if="[1, 2, 3].includes(res.reservationStatus?.id)"
                  class="btn btn-sm me-1"
                  style="background-color: #f5f0eb; color: #c0392b"
                  @click="openCancelModal(res)"
                >
                  ❌
                </button>
                <!-- Редактировать гостей -->
                <button
                  v-if="[1, 2, 3].includes(res.reservationStatus?.id)"
                  class="btn btn-sm"
                  style="background-color: #bfc9ed; color: #2d2640"
                  @click="openGuestModal(res)"
                >
                  👥
                </button>
              </td>
            </tr>
            <tr v-if="reservations.length === 0">
              <td colspan="8" class="text-center py-4 text-muted">
                Нет бронирований
              </td>
            </tr>
          </tbody>
        </table>
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
                :disabled="loading"
                @click="handleCancel"
              >
                {{ loading ? '...' : 'Отменить бронь' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка гостей -->
    <div
      v-if="showGuestModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div
            class="modal-header"
            style="background-color: #4c4993; color: #fff"
          >
            <h5 class="modal-title">Гости бронирования</h5>
            <button
              class="btn-close btn-close-white"
              @click="showGuestModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Количество гостей</label>
              <input
                v-model.number="guestForm.numberOfGuests"
                type="number"
                class="form-control"
                min="1"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Дополнительные гости</label>
              <input
                v-model="guestSearchQuery"
                class="form-control mb-2"
                placeholder="Введите имя, фамилию или email"
                @input="handleGuestSearchInput"
              />
              <div class="form-text mb-2">Начните вводить минимум 2 символа.</div>
              <div v-if="selectedGuestUsers.length" class="selected-guests mb-3">
                <div
                  v-for="user in selectedGuestUsers"
                  :key="user.id"
                  class="selected-guest"
                >
                  <span>{{ user.surname }} {{ user.name }} ({{ user.email }})</span>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="removeGuest(user.id)"
                  >
                    Убрать
                  </button>
                </div>
              </div>
              <div
                class="border rounded p-3"
                style="max-height: 200px; overflow-y: auto"
              >
                <div v-if="userSearchLoading" class="text-muted">
                  Поиск гостей...
                </div>
                <div
                  v-else-if="guestSearchQuery.trim().length < 2"
                  class="text-muted"
                >
                  Введите запрос для поиска.
                </div>
                <div
                  v-else-if="searchedUsers.length === 0"
                  class="text-muted"
                >
                  Гости не найдены.
                </div>
                <div v-for="user in searchedUsers" v-else :key="user.id" class="guest-search-item">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="user.id"
                    v-model="guestForm.guestIds"
                    :id="'guest-' + user.id"
                    :disabled="isMainGuest(user)"
                    @change="toggleGuest(user, $event)"
                  />
                  <label :for="'guest-' + user.id" class="form-check-label">
                    {{ user.surname }} {{ user.name }} ({{ user.email }})
                    <span
                      v-if="user.id === editingReservation?.mainGuest?.id"
                      class="text-muted"
                      >— основной гость</span
                    >
                  </label>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Особые пожелания</label>
              <textarea
                v-model="guestForm.specialRequests"
                class="form-control"
                rows="2"
              ></textarea>
            </div>
            <div class="d-flex justify-content-end gap-2">
              <button class="btn btn-secondary" @click="showGuestModal = false">
                Отмена
              </button>
              <button
                class="btn"
                style="background-color: #4c4993; color: #fff"
                :disabled="loading"
                @click="handleUpdateGuests"
              >
                {{ loading ? '...' : 'Сохранить' }}
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
  reservationStatus: { id: number; name: string } | null;
  room: {
    id: string;
    roomNumber: string;
    roomsType: { name: string } | null;
  } | null;
  mainGuest: {
    id: string;
    name: string;
    surname: string;
    email: string;
  } | null;
  guests: { id: string; name: string; surname: string; email: string }[];
}

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
}

const reservations = ref<Reservation[]>([]);
const searchedUsers = ref<User[]>([]);
const selectedGuestUsers = ref<User[]>([]);
const guestSearchQuery = ref('');
const userSearchLoading = ref(false);
const loading = ref(false);
let guestSearchTimer: ReturnType<typeof setTimeout> | null = null;

// Модалка отмены
const showCancelModal = ref(false);
const cancelReason = ref('');
const cancelId = ref('');

// Модалка гостей
const showGuestModal = ref(false);
const editingReservation = ref<Reservation | null>(null);
const guestForm = ref({
  numberOfGuests: 1,
  guestIds: [] as string[],
  specialRequests: '',
});

const fetchReservations = async () => {
  try {
    const res = await client.get('/reservations/all');
    reservations.value = res.data;
  } catch (err) {
    console.error('Ошибка загрузки броней:', err);
  }
};

const searchUsers = async () => {
  const query = guestSearchQuery.value.trim();

  if (query.length < 2) {
    searchedUsers.value = [];
    return;
  }

  userSearchLoading.value = true;
  try {
    const res = await client.get('/auth/user-by-query/', {
      params: { query },
    });
    searchedUsers.value = res.data;
  } catch (err) {
    console.error('Ошибка загрузки пользователей:', err);
  } finally {
    userSearchLoading.value = false;
  }
};

const handleGuestSearchInput = () => {
  if (guestSearchTimer) {
    clearTimeout(guestSearchTimer);
  }

  guestSearchTimer = setTimeout(() => {
    searchUsers();
  }, 350);
};

const isMainGuest = (user: User) =>
  user.id === editingReservation.value?.mainGuest?.id;

const removeGuest = (id: string) => {
  guestForm.value.guestIds = guestForm.value.guestIds.filter(
    (guestId) => guestId !== id,
  );
  selectedGuestUsers.value = selectedGuestUsers.value.filter(
    (user) => user.id !== id,
  );
};

const toggleGuest = (user: User, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;

  if (checked) {
    if (!selectedGuestUsers.value.some((selected) => selected.id === user.id)) {
      selectedGuestUsers.value.push(user);
    }
    return;
  }

  selectedGuestUsers.value = selectedGuestUsers.value.filter(
    (selected) => selected.id !== user.id,
  );
};

const formatDate = (d: string) => new Date(d).toLocaleDateString('ru-RU');

const getReservationStatusStyle = (id: number | undefined) => {
  const map: Record<number, any> = {
    1: { backgroundColor: '#f5f0eb', color: '#856404' },
    2: { backgroundColor: '#bfc9ed', color: '#2d2640' },
    3: { backgroundColor: '#a1cdc4', color: '#1a3c34' },
    4: { backgroundColor: '#e8e8e8', color: '#555' },
    5: { backgroundColor: '#fde8e8', color: '#c0392b' },
  };
  return map[id ?? 0] || {};
};

const handleConfirm = async (id: string) => {
  await client.patch(`/reservations/confirm/${id}`);
  await fetchReservations();
};

const handleCheckIn = async (id: string) => {
  await client.patch(`/reservations/check-in/${id}`);
  await fetchReservations();
};

const handleCheckOut = async (id: string) => {
  await client.patch(`/reservations/check-out/${id}`);
  await fetchReservations();
};

const openCancelModal = (res: Reservation) => {
  cancelId.value = res.id;
  cancelReason.value = '';
  showCancelModal.value = true;
};

const handleCancel = async () => {
  loading.value = true;
  try {
    await client.patch(`/reservations/cancel/${cancelId.value}`, {
      cancellationReason: cancelReason.value,
    });
    showCancelModal.value = false;
    await fetchReservations();
  } catch (err) {
    console.error('Ошибка отмены:', err);
  } finally {
    loading.value = false;
  }
};

const openGuestModal = (res: Reservation) => {
  editingReservation.value = res;
  guestSearchQuery.value = '';
  searchedUsers.value = [];
  selectedGuestUsers.value = [...(res.guests ?? [])];
  guestForm.value = {
    numberOfGuests: res.numberOfGuests,
    guestIds: res.guests?.map((g) => g.id) ?? [],
    specialRequests: res.specialRequests || '',
  };
  showGuestModal.value = true;
};

const handleUpdateGuests = async () => {
  if (!editingReservation.value) return;
  loading.value = true;
  try {
    await client.patch(
      `/reservations/update/${editingReservation.value.id}`,
      guestForm.value,
    );
    showGuestModal.value = false;
    await fetchReservations();
  } catch (err) {
    console.error('Ошибка обновления:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchReservations();
});
</script>

<style scoped>
.selected-guests {
  display: grid;
  gap: 8px;
}

.selected-guest {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.guest-search-item {
  align-items: center;
  display: flex;
  gap: 8px;
}

.selected-guest {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 8px 10px;
}

.guest-search-item + .guest-search-item {
  margin-top: 10px;
}
</style>
