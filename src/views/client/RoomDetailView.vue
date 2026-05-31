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
              class="card-img-top room-photo-wrapper d-flex align-items-center justify-content-center"
            >
              <img
                v-if="mainPhotoUrl"
                class="room-photo"
                :src="mainPhotoUrl"
                :alt="`${room.roomsType?.name || 'Номер'} №${room.roomNumber}`"
                @error="handleImageError"
              />
              <template v-if="photoUrls.length > 1">
                <button
                  type="button"
                  class="photo-nav photo-nav-prev"
                  aria-label="Previous photo"
                  @click="showPreviousPhoto"
                >
                  &lsaquo;
                </button>
                <button
                  type="button"
                  class="photo-nav photo-nav-next"
                  aria-label="Next photo"
                  @click="showNextPhoto"
                >
                  &rsaquo;
                </button>
                <div class="photo-counter">
                  {{ selectedPhotoIndex + 1 }} / {{ photoUrls.length }}
                </div>
              </template>
              🏨
            </div>
            <div v-if="photoUrls.length > 1" class="room-thumbnails">
              <button
                v-for="(photoUrl, index) in photoUrls"
                :key="`${photoUrl}-${index}`"
                type="button"
                class="room-thumbnail"
                :class="{ active: index === selectedPhotoIndex }"
                @click="selectedPhotoIndex = index"
              >
                <img
                  :src="photoUrl"
                  :alt="`Photo ${index + 1}`"
                  @error="handleImageError"
                />
              </button>
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
                  <div class="mt-2">
                    <span
                      class="rating-pill"
                      :style="getRatingBadgeStyle(room.rating)"
                    >
                      ★ {{ formatRating(room.rating) }}
                    </span>
                    <span class="text-muted fw-normal">
                      · {{ reviews.length }} {{ reviewWord }}
                    </span>
                  </div>
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

          <div class="card shadow-sm mt-4">
            <div class="card-body">
              <div class="reviews-head mb-3">
                <div>
                  <h5 class="mb-1" style="color: #4c4993">Отзывы</h5>
                  <small class="text-muted">
                    {{ reviews.length }} {{ reviewWord }} по этому номеру
                  </small>
                </div>
                <div
                  class="reviews-score"
                  :style="getRatingBadgeStyle(room.rating)"
                >
                  <span>★ {{ formatRating(room.rating) }}</span>
                  <small>{{ getRatingLabel(room.rating) }}</small>
                </div>
              </div>

              <form
                v-if="canLeaveReview"
                class="review-form mb-4"
                @submit.prevent="handleReviewSubmit"
              >
                <p v-if="reviewError" class="alert alert-danger">
                  {{ reviewError }}
                </p>
                <p v-if="reviewSuccess" class="alert alert-success">
                  Отзыв сохранен
                </p>
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">Оценка</label>
                    <div class="rating-picker">
                      <button
                        v-for="value in [1, 2, 3, 4, 5]"
                        :key="value"
                        type="button"
                        class="rating-choice"
                        :class="{ active: reviewForm.rating === value }"
                        :style="
                          reviewForm.rating === value
                            ? getRatingBadgeStyle(value)
                            : {}
                        "
                        @click="reviewForm.rating = value"
                      >
                        {{ value }}
                      </button>
                    </div>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Отзыв</label>
                    <textarea
                      v-model="reviewForm.text"
                      class="form-control"
                      rows="2"
                      required
                    ></textarea>
                  </div>
                </div>
                <button
                  type="submit"
                  class="btn mt-3"
                  style="background-color: #4c4993; color: #fff"
                  :disabled="reviewSubmitting"
                >
                  {{ reviewSubmitting ? 'Сохранение...' : 'Оставить отзыв' }}
                </button>
              </form>

              <div v-else-if="myReview" class="my-review-note mb-4">
                <div
                  class="rating-pill"
                  :style="getRatingBadgeStyle(myReview.rating)"
                >
                  ★ {{ myReview.rating }}
                </div>
                <div>
                  <small class="text-muted">Ваш отзыв по этому номеру</small>
                  <p class="mb-0">{{ myReview.text }}</p>
                </div>
              </div>
              <div
                v-else-if="isAuthenticated && isGuest && !hasCompletedReservation"
                class="alert alert-light border"
              >
                Отзыв можно оставить после завершенной брони этого номера.
              </div>

              <div v-if="reviews.length === 0" class="text-muted">
                Отзывов пока нет
              </div>
              <div v-else class="review-list">
                <div
                  v-for="review in reviews"
                  :key="review.id"
                  class="review-item"
                  :style="getReviewCardStyle(review.rating)"
                >
                  <div class="review-top">
                    <div class="review-author">
                      <div class="review-avatar">
                        {{ getReviewInitials(review) }}
                      </div>
                      <div>
                        <div class="fw-semibold">
                          {{ review.user.surname }} {{ review.user.name }}
                        </div>
                        <small class="text-muted">
                          {{ formatDate(review.createdAt) }}
                        </small>
                      </div>
                    </div>
                    <div
                      class="rating-pill"
                      :style="getRatingBadgeStyle(review.rating)"
                    >
                      ★ {{ review.rating }}
                    </div>
                  </div>
                  <p class="review-text">{{ review.text }}</p>
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
              <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Рейтинг:</span>
                <span>★ {{ formatRating(room.rating) }}</span>
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
import { useImageUrl } from '@/composables/useImageUrl';
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
  rating: number;
  floor: number | null;
  capacity: number;
  bedsCount: number;
  description: string | null;
  amenities: Amenity[];
  photos: string[];
}
interface RoomReview {
  id: string;
  text: string;
  rating: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    surname: string;
  };
}
interface Reservation {
  room: { id: string } | null;
  reservationStatus: { id: number } | null;
}
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { getImageUrl } = useImageUrl();

const room = ref<Room | null>(null);
const reviews = ref<RoomReview[]>([]);
const loading = ref(true);
const selectedPhotoIndex = ref(0);
const hasCompletedReservation = ref(false);
const reviewSubmitting = ref(false);
const reviewError = ref('');
const reviewSuccess = ref(false);
const reviewForm = ref({
  rating: 5,
  text: '',
});
const isAuthenticated = computed(() => userStore.isAuthenticated);
const isGuest = computed(() => userStore.user?.roleType?.name === 'guest');
const currentUserId = computed(() => userStore.user?.id as string | undefined);
const photoUrls = computed(() =>
  room.value?.photos?.map((photo) => getImageUrl(photo)) ?? [],
);
const mainPhotoUrl = computed(() => photoUrls.value[selectedPhotoIndex.value] ?? '');
const canBook = computed(
  () =>
    isAuthenticated.value && isGuest.value && room.value?.roomsStatus?.id !== 3,
);
const myReview = computed(() =>
  reviews.value.find((review) => review.user.id === currentUserId.value),
);
const canLeaveReview = computed(
  () =>
    isAuthenticated.value &&
    isGuest.value &&
    hasCompletedReservation.value &&
    !myReview.value,
);
const reviewWord = computed(() => {
  const count = reviews.value.length;
  if (count % 10 === 1 && count % 100 !== 11) return 'отзыв';
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'отзыва';
  }
  return 'отзывов';
});

const getStatusStyle = (id: number | undefined) => {
  if (id === 1) return { backgroundColor: '#a1cdc4', color: '#1a3c34' };
  if (id === 2) return { backgroundColor: '#bfc9ed', color: '#2d2640' };
  if (id === 3) return { backgroundColor: '#fde8e8', color: '#c0392b' };
  return {};
};

const goToBooking = () => {
  router.push(`/booking/${route.params.id}`);
};

const formatRating = (rating: number | null | undefined) =>
  (Number(rating) || 0).toFixed(1);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const getErrorMessage = (err: unknown, fallback: string) => {
  const message = (err as ApiErrorResponse).response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || fallback;
};

const getRatingBadgeStyle = (rating: number | null | undefined) => {
  const value = Number(rating) || 0;

  if (value >= 4.5) {
    return { backgroundColor: '#e7f6ef', color: '#1f7a4f', borderColor: '#9dd9bd' };
  }
  if (value >= 4) {
    return { backgroundColor: '#edf1ff', color: '#4c4993', borderColor: '#bfc9ed' };
  }
  if (value >= 3) {
    return { backgroundColor: '#fff6d8', color: '#8a6500', borderColor: '#efd57a' };
  }
  return { backgroundColor: '#fde8e8', color: '#c0392b', borderColor: '#f0b3b3' };
};

const getReviewCardStyle = (rating: number) => ({
  borderLeftColor: getRatingBadgeStyle(rating).color,
});

const getRatingLabel = (rating: number | null | undefined) => {
  const value = Number(rating) || 0;

  if (value >= 4.5) return 'отлично';
  if (value >= 4) return 'хорошо';
  if (value >= 3) return 'нормально';
  return 'есть вопросы';
};

const getReviewInitials = (review: RoomReview) =>
  `${review.user.surname?.[0] ?? ''}${review.user.name?.[0] ?? ''}`.toUpperCase();

const showPreviousPhoto = () => {
  if (photoUrls.value.length <= 1) return;

  selectedPhotoIndex.value =
    (selectedPhotoIndex.value - 1 + photoUrls.value.length) % photoUrls.value.length;
};

const showNextPhoto = () => {
  if (photoUrls.value.length <= 1) return;

  selectedPhotoIndex.value =
    (selectedPhotoIndex.value + 1) % photoUrls.value.length;
};

const handleImageError = (event: Event) => {
  const image = event.target as HTMLImageElement;
  image.style.display = 'none';
};

const fetchRoom = async () => {
  const res = await client.get<Room>(`/rooms/by-id/${route.params.id}`);
  room.value = res.data;
  selectedPhotoIndex.value = 0;
};

const fetchReviews = async () => {
  const res = await client.get<RoomReview[]>(
    `/reviews/by-room/${route.params.id}`,
  );
  reviews.value = res.data;
};

const fetchCompletedReservationAccess = async () => {
  if (!isAuthenticated.value || !isGuest.value) return;

  try {
    const res = await client.get<Reservation[]>('/reservations/my');
    hasCompletedReservation.value = res.data.some(
      (reservation) =>
        reservation.room?.id === route.params.id &&
        reservation.reservationStatus?.id === 4,
    );
  } catch (err) {
    console.error('Ошибка загрузки броней:', err);
  }
};

const handleReviewSubmit = async () => {
  reviewSubmitting.value = true;
  reviewError.value = '';
  reviewSuccess.value = false;

  try {
    await client.post('/reviews', {
      roomId: route.params.id,
      rating: reviewForm.value.rating,
      text: reviewForm.value.text,
    });
    reviewForm.value = {
      rating: 5,
      text: '',
    };
    reviewSuccess.value = true;
    await Promise.all([fetchRoom(), fetchReviews()]);
  } catch (err) {
    reviewError.value = getErrorMessage(err, 'Ошибка сохранения отзыва');
  } finally {
    reviewSubmitting.value = false;
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      fetchRoom(),
      fetchReviews(),
      fetchCompletedReservationAccess(),
    ]);
  } catch (err) {
    console.error('Ошибка загрузки номера:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.room-photo-wrapper {
  height: 350px;
  background-color: #bfc9ed;
  color: #4c4993;
  font-size: 5rem;
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
  font-size: 2rem;
  height: 42px;
  justify-content: center;
  line-height: 1;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  z-index: 2;
}

.photo-nav-prev {
  left: 16px;
}

.photo-nav-next {
  right: 16px;
}

.photo-counter {
  background-color: rgba(45, 38, 64, 0.75);
  border-radius: 999px;
  bottom: 14px;
  color: #fff;
  font-size: 0.85rem;
  line-height: 1;
  padding: 7px 12px;
  position: absolute;
  right: 14px;
  z-index: 2;
}

.room-thumbnails {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  padding: 12px;
}

.room-thumbnail {
  aspect-ratio: 4 / 3;
  background-color: #bfc9ed;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  padding: 0;
}

.room-thumbnail.active {
  border-color: #4c4993;
}

.room-thumbnail img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.review-list {
  display: grid;
  gap: 12px;
}

.review-item {
  background: linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%);
  border: 1px solid #e1e4ef;
  border-left: 5px solid #4c4993;
  border-radius: 8px;
  padding: 14px 16px;
}

.reviews-head,
.review-top,
.review-author,
.my-review-note {
  align-items: center;
  display: flex;
  gap: 12px;
}

.reviews-head,
.review-top {
  justify-content: space-between;
}

.reviews-score {
  border: 1px solid;
  border-radius: 8px;
  min-width: 96px;
  padding: 8px 12px;
  text-align: center;
}

.reviews-score span {
  display: block;
  font-size: 1.15rem;
  font-weight: 700;
}

.reviews-score small {
  display: block;
  line-height: 1.1;
}

.rating-pill {
  border: 1px solid;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1;
  padding: 7px 10px;
  white-space: nowrap;
}

.review-avatar {
  align-items: center;
  background-color: #4c4993;
  border-radius: 50%;
  color: #fff;
  display: flex;
  flex: 0 0 38px;
  font-size: 0.85rem;
  font-weight: 700;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.review-text {
  background-color: #f8f9fb;
  border-radius: 8px;
  color: #2d2640;
  line-height: 1.55;
  margin: 12px 0 0;
  padding: 12px 14px;
}

.review-text::before {
  color: #4c4993;
  content: '“';
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 0;
  margin-right: 4px;
  vertical-align: -0.2rem;
}

.review-form {
  background-color: #f8f9fb;
  border: 1px solid #e1e4ef;
  border-radius: 8px;
  padding: 14px;
}

.rating-picker {
  display: flex;
  gap: 8px;
}

.rating-choice {
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: #4c4993;
  font-weight: 700;
  height: 38px;
  width: 38px;
}

.rating-choice.active {
  border: 1px solid;
}

.my-review-note {
  background-color: #f8f9fb;
  border: 1px solid #e1e4ef;
  border-radius: 8px;
  padding: 12px 14px;
}
</style>
