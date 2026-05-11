<template>
  <div class="container py-4">
    <!-- Спиннер -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <!-- Контент -->
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
          <li class="breadcrumb-item active" style="color: #2d2640">
            {{ room.roomsType?.name }} №{{ room.roomNumber }}
          </li>
        </ol>
      </nav>

      <div class="row g-4">
        <!-- Фото и описание -->
        <div class="col-lg-8">
          <div class="card shadow-sm">
            <div
              class="card-img-top d-flex align-items-center justify-content-center"
              style="
                height: 350px;
                background-color: #bfc9ed;
                color: #4c4993;
                font-size: 5rem;
              "
            >
              🏨
            </div>
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-start mb-3"
              >
                <div>
                  <h3 style="color: #4c4993">
                    {{ room.roomsType?.name }} №{{ room.roomNumber }}
                  </h3>
                  <p class="text-muted mb-0">
                    {{ room.description || 'Описание отсутствует' }}
                  </p>
                </div>
                <span
                  class="badge fs-6"
                  :style="getStatusStyle(room.roomsStatus?.id)"
                >
                  {{ room.roomsStatus?.name }}
                </span>
              </div>

              <hr />

              <h5 style="color: #4c4993">Удобства</h5>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span
                  v-for="a in room.amenities"
                  :key="a.id"
                  class="badge py-2 px-3"
                  style="background-color: #bfc9ed; color: #2d2640"
                >
                  {{ a.name }}
                </span>
                <span v-if="!room.amenities?.length" class="text-muted"
                  >Не указаны</span
                >
              </div>

              <hr />

              <div class="row text-center">
                <div class="col">
                  <div class="fs-4 fw-bold" style="color: #4c4993">
                    👤 {{ room.capacity }}
                  </div>
                  <small class="text-muted">Вместимость</small>
                </div>
                <div class="col">
                  <div class="fs-4 fw-bold" style="color: #4c4993">
                    🛏 {{ room.bedsCount }}
                  </div>
                  <small class="text-muted">Кроватей</small>
                </div>
                <div class="col">
                  <div class="fs-4 fw-bold" style="color: #4c4993">
                    📍 {{ room.floor ?? '—' }}
                  </div>
                  <small class="text-muted">Этаж</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Боковая панель -->
        <div class="col-lg-4">
          <div class="card shadow-sm p-4 sticky-top" style="top: 80px">
            <div class="text-center mb-3">
              <span class="fs-2 fw-bold" style="color: #4c4993"
                >{{ room.pricePerNight }} ₽</span
              >
              <span class="text-muted"> / ночь</span>
            </div>

            <hr />

            <!-- Краткая инфа -->
            <div class="mb-3">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Тип:</span>
                <span>{{ room.roomsType?.name }}</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Вместимость:</span>
                <span>{{ room.capacity }} чел.</span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Статус:</span>
                <span>{{ room.roomsStatus?.name }}</span>
              </div>
            </div>

            <!-- Кнопка бронирования -->
            <button
              class="btn w-100 py-2 fw-bold"
              style="background-color: #4c4993; color: #fff"
              :disabled="!canBook"
              @click="goToBooking"
            >
              {{ canBook ? 'Забронировать' : 'Недоступен' }}
            </button>

            <div v-if="!isAuthenticated" class="text-center mt-2">
              <small class="text-muted">
                <router-link to="/login" style="color: #4c4993"
                  >Войдите</router-link
                >, чтобы забронировать
              </small>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Не найдено -->
    <div v-else class="text-center py-5 text-muted">Номер не найден</div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Amenity {
  id: number;
  name: string;
}
interface Room {
  id: string;
  roomNumber: string;
  roomsType: { id: number; name: string } | null;
  roomsStatus: { id: number; name: string } | null;
  pricePerNight: number;
  floor: number | null;
  capacity: number;
  bedsCount: number;
  description: string | null;
  amenities: Amenity[];
  photos: string[];
}

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const room = ref<Room | null>(null);
const loading = ref(true);
const isAuthenticated = computed(() => userStore.isAuthenticated);
const isGuest = computed(() => userStore.user?.roleType?.name === 'guest');
const canBook = computed(
  () =>
    isAuthenticated.value && isGuest.value && room.value?.roomsStatus?.id === 1,
);

const getStatusStyle = (id: number | undefined) => {
  if (id === 1) return { backgroundColor: '#a1cdc4', color: '#1a3c34' };
  if (id === 2) return { backgroundColor: '#bfc9ed', color: '#2d2640' };
  if (id === 3) return { backgroundColor: '#fde8e8', color: '#c0392b' };
  return {};
};

const goToBooking = () => {
  router.push(`/booking/${route.params.id}`);
};

onMounted(async () => {
  try {
    const res = await client.get(`/rooms/by-id/${route.params.id}`);
    room.value = res.data;
  } catch (err) {
    console.error('Ошибка загрузки номера:', err);
  } finally {
    loading.value = false;
  }
});
</script>
