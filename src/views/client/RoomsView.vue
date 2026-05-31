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
            class="card-img-top room-photo-wrapper d-flex align-items-center justify-content-center"
          >
            <img
              v-if="getRoomPhoto(room)"
              class="room-photo"
              :src="getRoomPhoto(room)"
              :alt="`${room.roomsType?.name || 'Номер'} №${room.roomNumber}`"
              @error="handleImageError"
            />
            <template v-if="room.photos?.length > 1">
              <button
                type="button"
                class="photo-nav photo-nav-prev"
                aria-label="Previous photo"
                @click.stop="showPreviousPhoto(room)"
              >
                &lsaquo;
              </button>
              <button
                type="button"
                class="photo-nav photo-nav-next"
                aria-label="Next photo"
                @click.stop="showNextPhoto(room)"
              >
                &rsaquo;
              </button>
              <div class="photo-counter">
                {{ getRoomPhotoIndex(room) + 1 }} / {{ room.photos.length }}
              </div>
            </template>
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
                ★ {{ formatRating(room.rating) }} · 👤 {{ room.capacity }} · 🛏 {{ room.bedsCount }} · 📍
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
import { useImageUrl } from '@/composables/useImageUrl';
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
  rating: number;
  floor: number | null;
  capacity: number;
  bedsCount: number;
  description: string | null;
  amenities: Amenity[];
  photos: string[];
}

const router = useRouter();
const { getImageUrl } = useImageUrl();
const rooms = ref<Room[]>([]);
const loading = ref(true);
const roomPhotoIndexes = ref<Record<string, number>>({});

const getRoomPhoto = (room: Room) =>
  room.photos?.[getRoomPhotoIndex(room)]
    ? getImageUrl(room.photos[getRoomPhotoIndex(room)])
    : '';

const getRoomPhotoIndex = (room: Room) => {
  const currentIndex = roomPhotoIndexes.value[room.id] ?? 0;
  const lastIndex = (room.photos?.length ?? 1) - 1;

  return Math.min(currentIndex, Math.max(lastIndex, 0));
};

const showPreviousPhoto = (room: Room) => {
  const total = room.photos?.length ?? 0;
  if (total <= 1) return;

  roomPhotoIndexes.value[room.id] = (getRoomPhotoIndex(room) - 1 + total) % total;
};

const showNextPhoto = (room: Room) => {
  const total = room.photos?.length ?? 0;
  if (total <= 1) return;

  roomPhotoIndexes.value[room.id] = (getRoomPhotoIndex(room) + 1) % total;
};

const handleImageError = (event: Event) => {
  const image = event.target as HTMLImageElement;
  image.style.display = 'none';
};

const getStatusStyle = (id: number | undefined) => {
  if (id === 1) return { backgroundColor: '#a1cdc4', color: '#1a3c34' };
  if (id === 2) return { backgroundColor: '#bfc9ed', color: '#2d2640' };
  if (id === 3) return { backgroundColor: '#fde8e8', color: '#c0392b' };
  return {};
};

const formatRating = (rating: number | null | undefined) =>
  (Number(rating) || 0).toFixed(1);

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

<style scoped>
.room-photo-wrapper {
  height: 200px;
  background-color: #bfc9ed;
  color: #4c4993;
  font-size: 3rem;
  overflow: hidden;
  position: relative;
}

.room-photo {
  height: 100%;
  inset: 0;
  object-fit: cover;
  position: absolute;
  width: 100%;
}

.photo-nav {
  align-items: center;
  background-color: rgba(45, 38, 64, 0.65);
  border: 0;
  border-radius: 50%;
  color: #fff;
  display: flex;
  font-size: 1.5rem;
  height: 34px;
  justify-content: center;
  line-height: 1;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  z-index: 2;
}

.photo-nav-prev {
  left: 10px;
}

.photo-nav-next {
  right: 10px;
}

.photo-counter {
  background-color: rgba(45, 38, 64, 0.75);
  border-radius: 999px;
  bottom: 10px;
  color: #fff;
  font-size: 0.75rem;
  line-height: 1;
  padding: 6px 10px;
  position: absolute;
  right: 10px;
  z-index: 2;
}
</style>
