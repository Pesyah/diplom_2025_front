<template>
  <div class="container py-4">
    <!-- Спиннер -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <template v-else-if="room">
      <!-- Хлебные крошки -->
      <nav aria-label="breadcrumb" class="mb-3">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link
              to="/rooms"
              style="color: #4c4993; text-decoration: none"
              >Номера</router-link
            >
          </li>
          <li class="breadcrumb-item">
            <router-link
              :to="`/rooms/${room.id}`"
              style="color: #4c4993; text-decoration: none"
            >
              {{ room.roomsType?.name }} №{{ room.roomNumber }}
            </router-link>
          </li>
          <li class="breadcrumb-item active" style="color: #2d2640">
            Бронирование
          </li>
        </ol>
      </nav>

      <div class="row g-4">
        <!-- Форма -->
        <div class="col-lg-8">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h4 class="mb-4" style="color: #4c4993">Бронирование номера</h4>

              <p v-if="error" class="alert alert-danger">{{ error }}</p>
              <p v-if="success" class="alert alert-success">
                Бронь создана!
                <router-link to="/my-reservations" style="color: #27ae60"
                  >Мои брони →</router-link
                >
              </p>

              <form v-if="!success" @submit.prevent="handleSubmit">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Дата заезда *</label>
                    <input
                      v-model="form.checkInDate"
                      type="date"
                      class="form-control"
                      :min="today"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">Дата выезда *</label>
                    <input
                      v-model="form.checkOutDate"
                      type="date"
                      class="form-control"
                      :min="minCheckOut"
                      required
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label"
                    >Количество гостей * (макс: {{ room.capacity }})</label
                  >
                  <input
                    v-model.number="form.numberOfGuests"
                    type="number"
                    class="form-control"
                    min="1"
                    :max="room.capacity"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Особые пожелания</label>
                  <textarea
                    v-model="form.specialRequests"
                    class="form-control"
                    rows="3"
                    placeholder="Например: нужна детская кроватка, поздний заезд..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  class="btn w-100 py-2 fw-bold"
                  style="background-color: #4c4993; color: #fff"
                  :disabled="submitting"
                >
                  {{ submitting ? 'Создание брони...' : 'Забронировать' }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Боковая панель: инфо о номере -->
        <div class="col-lg-4">
          <div class="card shadow-sm p-4 sticky-top" style="top: 80px">
            <h5 style="color: #4c4993">
              {{ room.roomsType?.name }} №{{ room.roomNumber }}
            </h5>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">Цена/ночь:</span>
              <span class="fw-bold">{{ room.pricePerNight }} ₽</span>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span class="text-muted">Вместимость:</span>
              <span>{{ room.capacity }} чел.</span>
            </div>
            <hr />
            <div
              class="d-flex justify-content-between fw-bold"
              style="color: #4c4993"
            >
              <span>Примерная сумма:</span>
              <span>{{ estimatedPrice }} ₽</span>
            </div>
            <small class="text-muted"
              >за {{ nightsCount > 0 ? nightsCount : '?' }}
              {{ nightWord }}</small
            >
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

interface Room {
  id: string;
  roomNumber: string;
  roomsType: { id: number; name: string } | null;
  pricePerNight: number;
  capacity: number;
}

const route = useRoute();
const room = ref<Room | null>(null);
const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const success = ref(false);

const today = new Date().toISOString().split('T')[0];

const form = ref({
  checkInDate: '',
  checkOutDate: '',
  numberOfGuests: 1,
  specialRequests: '',
});

const minCheckOut = computed(() => {
  if (form.value.checkInDate) {
    const d = new Date(form.value.checkInDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  return today;
});

const nightsCount = computed(() => {
  if (form.value.checkInDate && form.value.checkOutDate) {
    const diff =
      new Date(form.value.checkOutDate).getTime() -
      new Date(form.value.checkInDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

const estimatedPrice = computed(() => {
  if (room.value && nightsCount.value > 0) {
    return room.value.pricePerNight * nightsCount.value;
  }
  return 0;
});

const nightWord = computed(() => {
  const n = nightsCount.value;
  if (n % 10 === 1 && n % 100 !== 11) return 'ночь';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100))
    return 'ночи';
  return 'ночей';
});

const handleSubmit = async () => {
  submitting.value = true;
  error.value = '';

  try {
    await client.post('/reservations', {
      roomId: route.params.roomId,
      checkInDate: form.value.checkInDate,
      checkOutDate: form.value.checkOutDate,
      numberOfGuests: form.value.numberOfGuests,
      specialRequests: form.value.specialRequests || undefined,
    });
    success.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка создания брони';
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  try {
    const res = await client.get(`/rooms/by-id/${route.params.roomId}`);
    room.value = res.data;
  } catch (err) {
    console.error('Ошибка загрузки номера:', err);
  } finally {
    loading.value = false;
  }
});
</script>
