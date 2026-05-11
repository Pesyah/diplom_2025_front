<template>
  <div class="container py-4">
    <h2 class="mb-4" style="color: #4c4993">Номера</h2>

    <!-- Спиннер -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status"></div>
    </div>

    <!-- Сетка номеров -->
    <div v-else class="row g-4">
      <div v-for="room in rooms" :key="room.id" class="col-md-6 col-lg-4">
        <div
          class="card h-100 shadow-sm"
          style="cursor: pointer"
          @click="goToRoom(room.id)"
        >
          <!-- Фото -->
          <div
            class="card-img-top d-flex align-items-center justify-content-center"
            style="
              height: 200px;
              background-color: #bfc9ed;
              color: #4c4993;
              font-size: 3rem;
            "
          >
            🏨
          </div>

          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0" style="color: #4c4993">
                {{ room.roomsType?.name }} №{{ room.roomNumber }}
              </h5>
              <span class="badge" :style="getStatusStyle(room.roomsStatus?.id)">
                {{ room.roomsStatus?.name }}
              </span>
            </div>

            <p class="card-text text-muted small mb-2">
              {{ room.description || 'Описание отсутствует' }}
            </p>

            <div class="mb-2">
              <span
                v-for="a in room.amenities?.slice(0, 4)"
                :key="a.id"
                class="badge me-1"
                style="
                  background-color: #bfc9ed;
                  color: #2d2640;
                  font-size: 0.7rem;
                "
              >
                {{ a.name }}
              </span>
              <span v-if="room.amenities?.length > 4" class="text-muted small">
                +{{ room.amenities.length - 4 }}
              </span>
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="fs-5 fw-bold" style="color: #4c4993"
                  >{{ room.pricePerNight }} ₽</span
                >
                <small class="text-muted"> / ночь</small>
              </div>
              <div class="text-muted small">
                👤 {{ room.capacity }} · 🛏 {{ room.bedsCount }} · 📍
                {{ room.floor ?? '—' }} этаж
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="rooms.length === 0" class="col-12 text-center py-5 text-muted">
        Нет доступных номеров
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

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

const router = useRouter();
const rooms = ref<Room[]>([]);
const loading = ref(true);

const getStatusStyle = (id: number | undefined) => {
  if (id === 1) return { backgroundColor: '#a1cdc4', color: '#1a3c34' };
  if (id === 2) return { backgroundColor: '#bfc9ed', color: '#2d2640' };
  if (id === 3) return { backgroundColor: '#fde8e8', color: '#c0392b' };
  return {};
};

const goToRoom = (id: string) => {
  router.push(`/rooms/${id}`);
};

onMounted(async () => {
  try {
    const res = await client.get('/rooms/all');
    rooms.value = res.data;
  } catch (err) {
    console.error('Ошибка загрузки номеров:', err);
  } finally {
    loading.value = false;
  }
});
</script>
