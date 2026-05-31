<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0" style="color: #4c4993">🏨 Номера</h2>
      <button
        v-if="isAdmin"
        class="btn btn-primary"
        style="background-color: #4c4993; border-color: #4c4993"
        @click="openCreateModal"
      >
        + Добавить номер
      </button>
    </div>

    <!-- Таблица -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead style="background-color: #4c4993; color: #fff">
            <tr>
              <th class="ps-3">№</th>
              <th>Тип</th>
              <th>Статус</th>
              <th>Цена/ночь</th>
              <th>Рейтинг</th>
              <th>Этаж</th>
              <th>Вместимость</th>
              <th>Удобства</th>
              <th class="text-end pe-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="room in rooms"
              :key="room.id"
              :class="{ 'table-secondary opacity-50': room.deleted_at }"
              style="vertical-align: middle"
            >
              <td class="ps-3 fw-bold">{{ room.roomNumber }}</td>
              <td>{{ room.roomsType?.name }}</td>
              <td>
                <span
                  class="badge"
                  :style="getStatusStyle(room.roomsStatus?.id)"
                >
                  {{ room.roomsStatus?.name }}
                </span>
              </td>
              <td>{{ room.pricePerNight }} ₽</td>
              <td>
                <span
                  class="rating-pill"
                  :style="getRatingBadgeStyle(room.rating)"
                >
                  ★ {{ formatRating(room.rating) }}
                </span>
              </td>
              <td>{{ room.floor ?? '—' }}</td>
              <td>{{ room.capacity }}</td>
              <td>
                <span
                  v-for="a in room.amenities"
                  :key="a.id"
                  class="badge me-1"
                  style="
                    background-color: #bfc9ed;
                    color: #2d2640;
                    font-size: 0.75rem;
                  "
                >
                  {{ a.name }}
                </span>
                <span v-if="!room.amenities?.length" class="text-muted">—</span>
              </td>
              <td class="text-end pe-3">
                <!-- Кнопки для админа -->
                <template v-if="isAdmin">
                  <button
                    v-if="!room.deleted_at"
                    class="btn btn-sm me-1"
                    style="background-color: #a1cdc4; color: #1a3c34"
                    @click="openReviewsModal(room)"
                  >
                    ★
                  </button>
                  <button
                    v-if="!room.deleted_at"
                    class="btn btn-sm me-1"
                    style="background-color: #bfc9ed; color: #2d2640"
                    @click="openEditModal(room)"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="!room.deleted_at"
                    class="btn btn-sm me-1"
                    style="background-color: #fde8e8; color: #c0392b"
                    @click="confirmDelete(room)"
                  >
                    🗑
                  </button>
                  <button
                    v-else
                    class="btn btn-sm"
                    style="background-color: #a1cdc4; color: #2d2640"
                    @click="handleRestore(room.id)"
                  >
                    ↩ Восстановить
                  </button>
                </template>
                <!-- Кнопка для менеджера: обслуживание -->
                <button
                  v-if="
                    !isAdmin && !room.deleted_at && room.roomsStatus?.id !== 3
                  "
                  class="btn btn-sm"
                  style="background-color: #fde8e8; color: #c0392b"
                  @click="handleSetMaintenance(room.id)"
                >
                  🔧 На обслуживание
                </button>
                <button
                  v-if="
                    !isAdmin && !room.deleted_at && room.roomsStatus?.id === 3
                  "
                  class="btn btn-sm"
                  style="background-color: #a1cdc4; color: #2d2640"
                  @click="handleSetAvailable(room.id)"
                >
                  ↩ Вернуть в строй
                </button>
              </td>
            </tr>
            <tr v-if="rooms.length === 0">
              <td colspan="9" class="text-center py-4 text-muted">
                Нет номеров
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модалка создания/редактирования -->
    <div
      v-if="showModal"
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
            <h5 class="modal-title">
              {{ editingRoom ? 'Редактировать номер' : 'Новый номер' }}
            </h5>
            <button
              class="btn-close btn-close-white"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <p v-if="error" class="alert alert-danger">{{ error }}</p>
            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Номер комнаты *</label>
                  <input
                    v-model="form.roomNumber"
                    class="form-control"
                    required
                  />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Тип номера *</label>
                  <select
                    v-model.number="form.roomsTypeId"
                    class="form-select"
                    required
                  >
                    <option v-for="t in types" :key="t.id" :value="t.id">
                      {{ t.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Статус *</label>
                  <select
                    v-model.number="form.roomsStatusId"
                    class="form-select"
                    required
                  >
                    <option v-for="s in statuses" :key="s.id" :value="s.id">
                      {{ s.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-3 mb-3">
                  <label class="form-label">Цена/ночь *</label>
                  <input
                    v-model.number="form.pricePerNight"
                    type="number"
                    class="form-control"
                    required
                    min="0"
                  />
                </div>
                <div class="col-md-3 mb-3">
                  <label class="form-label">Этаж</label>
                  <input
                    v-model.number="form.floor"
                    type="number"
                    class="form-control"
                  />
                </div>
                <div class="col-md-3 mb-3">
                  <label class="form-label">Вместимость</label>
                  <input
                    v-model.number="form.capacity"
                    type="number"
                    class="form-control"
                    min="1"
                  />
                </div>
                <div class="col-md-3 mb-3">
                  <label class="form-label">Кроватей</label>
                  <input
                    v-model.number="form.bedsCount"
                    type="number"
                    class="form-control"
                    min="1"
                  />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea
                  v-model="form.description"
                  class="form-control"
                  rows="2"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Удобства</label>
                <div class="d-flex flex-wrap gap-2">
                  <label
                    v-for="a in amenities"
                    :key="a.id"
                    class="badge py-2 px-3"
                    :style="{
                      backgroundColor: form.amenityIds.includes(a.id)
                        ? '#4c4993'
                        : '#bfc9ed',
                      color: form.amenityIds.includes(a.id)
                        ? '#fff'
                        : '#2d2640',
                      cursor: 'pointer',
                    }"
                  >
                    <input
                      type="checkbox"
                      :value="a.id"
                      v-model="form.amenityIds"
                      class="d-none"
                    />
                    {{ a.name }}
                  </label>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Фото</label>
                <input
                  class="form-control"
                  type="file"
                  accept="image/*"
                  multiple
                  :disabled="loading || uploading"
                  @change="handlePhotoUpload"
                />
                <div v-if="uploading" class="form-text">Загрузка фото...</div>
                <div v-if="uploadError" class="text-danger small mt-1">
                  {{ uploadError }}
                </div>
                <div v-if="photoPaths.length" class="room-photo-list mt-3">
                  <div
                    v-for="(photo, index) in photoPaths"
                    :key="photo"
                    class="room-photo-item"
                  >
                    <img
                      :src="getImageUrl(photo)"
                      :alt="`Фото ${index + 1}`"
                      @error="handlePreviewError"
                    />
                    <button
                      type="button"
                      class="btn btn-sm btn-danger"
                      :disabled="loading || uploading"
                      @click="removePhoto(index)"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  class="btn btn-secondary"
                  @click="closeModal"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  class="btn"
                  style="background-color: #4c4993; color: #fff"
                  :disabled="loading || uploading"
                >
                  {{ loading ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка отзывов -->
    <div
      v-if="showReviewsModal"
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
            <h5 class="modal-title">
              Отзывы: номер {{ reviewedRoom?.roomNumber }}
            </h5>
            <button
              class="btn-close btn-close-white"
              @click="closeReviewsModal"
            ></button>
          </div>
          <div class="modal-body">
            <p v-if="reviewError" class="alert alert-danger">
              {{ reviewError }}
            </p>
            <div v-if="reviewsLoading" class="text-center py-4">
              <div class="spinner-border" role="status"></div>
            </div>
            <div v-else-if="roomReviews.length === 0" class="text-muted">
              Отзывов пока нет
            </div>
            <div v-else class="review-list">
              <div
                v-for="review in roomReviews"
                :key="review.id"
                class="review-row"
                :style="getReviewCardStyle(review.rating)"
              >
                <div class="review-content">
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
                      ★ {{ review.rating }} · {{ getRatingLabel(review.rating) }}
                    </div>
                  </div>
                  <p class="review-text">{{ review.text }}</p>
                </div>
                <button
                  class="btn btn-sm btn-danger"
                  :disabled="reviewsLoading"
                  @click="handleDeleteReview(review.id)"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeReviewsModal">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка удаления -->
    <div
      v-if="showDeleteModal"
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
            <h5 class="modal-title">Удалить номер?</h5>
            <button
              class="btn-close btn-close-white"
              @click="showDeleteModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Номер <strong>{{ deletingRoom?.roomNumber }}</strong> будет скрыт
              (мягкое удаление).
            </p>
            <div class="d-flex justify-content-end gap-2">
              <button
                class="btn btn-secondary"
                @click="showDeleteModal = false"
              >
                Отмена
              </button>
              <button
                class="btn btn-danger"
                :disabled="loading"
                @click="handleDelete"
              >
                Удалить
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
import { useImageUrl } from '@/composables/useImageUrl';
import { useUpload } from '@/composables/useUpload';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';

interface Amenity {
  id: number;
  name: string;
  description: string | null;
}
interface RoomType {
  id: number;
  name: string;
}
interface RoomStatus {
  id: number;
  name: string;
}
interface Room {
  id: string;
  roomNumber: string;
  roomsType: RoomType | null;
  roomsStatus: RoomStatus | null;
  pricePerNight: number;
  rating: number;
  floor: number | null;
  capacity: number;
  bedsCount: number;
  description: string | null;
  amenities: Amenity[];
  photos: string[];
  deleted_at: string | null;
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
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

const userStore = useUserStore();
const isAdmin = computed(() => userStore.user?.roleType?.name === 'admin');
const { getImageUrl } = useImageUrl();
const { uploadFile, uploading, uploadError } = useUpload();

const rooms = ref<Room[]>([]);
const amenities = ref<Amenity[]>([]);
const types = ref<RoomType[]>([]);
const statuses = ref<RoomStatus[]>([]);
const loading = ref(false);
const error = ref('');

const showModal = ref(false);
const editingRoom = ref<Room | null>(null);
const photoPaths = ref<string[]>([]);
const form = ref({
  roomNumber: '',
  roomsTypeId: 1,
  roomsStatusId: 1,
  pricePerNight: 0,
  floor: null as number | null,
  capacity: 1,
  bedsCount: 1,
  description: '',
  amenityIds: [] as number[],
});

const showDeleteModal = ref(false);
const deletingRoom = ref<Room | null>(null);
const showReviewsModal = ref(false);
const reviewedRoom = ref<Room | null>(null);
const roomReviews = ref<RoomReview[]>([]);
const reviewsLoading = ref(false);
const reviewError = ref('');

const fetchRooms = async () => {
  try {
    const res = await client.get(
      isAdmin.value ? '/rooms/all-admin' : '/rooms/all',
    );
    rooms.value = res.data;
  } catch (err) {
    console.error('Ошибка загрузки номеров:', err);
  }
};

const fetchRelations = async () => {
  try {
    const res = await client.get('/rooms/all-relations');
    amenities.value = res.data.amenities;
    types.value = res.data.types;
    statuses.value = res.data.statuses;
  } catch (err) {
    console.error('Ошибка загрузки связей:', err);
  }
};

const getStatusStyle = (id: number | undefined) => {
  if (id === 1) return { backgroundColor: '#a1cdc4', color: '#1a3c34' };
  if (id === 2) return { backgroundColor: '#bfc9ed', color: '#2d2640' };
  if (id === 3) return { backgroundColor: '#fde8e8', color: '#c0392b' };
  return {};
};

const formatRating = (rating: number | null | undefined) =>
  (Number(rating) || 0).toFixed(1);

const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU');

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
  return 'спорно';
};

const getReviewInitials = (review: RoomReview) =>
  `${review.user.surname?.[0] ?? ''}${review.user.name?.[0] ?? ''}`.toUpperCase();

const resetForm = () => {
  form.value = {
    roomNumber: '',
    roomsTypeId: 1,
    roomsStatusId: 1,
    pricePerNight: 0,
    floor: null,
    capacity: 1,
    bedsCount: 1,
    description: '',
    amenityIds: [],
  };
  photoPaths.value = [];
  error.value = '';
};

const openCreateModal = () => {
  editingRoom.value = null;
  resetForm();
  showModal.value = true;
};

const openEditModal = (room: Room) => {
  editingRoom.value = room;
  form.value = {
    roomNumber: room.roomNumber,
    roomsTypeId: room.roomsType?.id ?? 1,
    roomsStatusId: room.roomsStatus?.id ?? 1,
    pricePerNight: room.pricePerNight,
    floor: room.floor,
    capacity: room.capacity,
    bedsCount: room.bedsCount,
    description: room.description || '',
    amenityIds: room.amenities?.map((a) => a.id) ?? [],
  };
  photoPaths.value = [...(room.photos ?? [])];
  error.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingRoom.value = null;
};

const handlePhotoUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);

  if (!files.length) return;

  error.value = '';

  try {
    for (const file of files) {
      const uploaded = (await uploadFile(file)) as {
        path?: string;
        url?: string;
      };
      const photoPath = uploaded.path || uploaded.url;

      if (photoPath && !photoPaths.value.includes(photoPath)) {
        photoPaths.value.push(photoPath);
      }
    }
  } catch {
    error.value = uploadError.value || 'Ошибка загрузки фото';
  } finally {
    input.value = '';
  }
};

const removePhoto = (index: number) => {
  photoPaths.value.splice(index, 1);
};

const handlePreviewError = (event: Event) => {
  const image = event.target as HTMLImageElement;
  image.style.display = 'none';
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  const payload = {
    ...form.value,
    photos: photoPaths.value,
  };

  try {
    if (editingRoom.value) {
      await client.patch('/rooms', { id: editingRoom.value.id, ...payload });
    } else {
      await client.post('/rooms', payload);
    }
    closeModal();
    await fetchRooms();
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Ошибка сохранения');
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (room: Room) => {
  deletingRoom.value = room;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!deletingRoom.value) return;
  loading.value = true;
  try {
    await client.delete(`/rooms/by-id/${deletingRoom.value.id}`);
    showDeleteModal.value = false;
    deletingRoom.value = null;
    await fetchRooms();
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'Ошибка удаления');
  } finally {
    loading.value = false;
  }
};

const openReviewsModal = async (room: Room) => {
  reviewedRoom.value = room;
  reviewError.value = '';
  showReviewsModal.value = true;
  await fetchRoomReviews(room.id);
};

const closeReviewsModal = () => {
  showReviewsModal.value = false;
  reviewedRoom.value = null;
  roomReviews.value = [];
  reviewError.value = '';
};

const fetchRoomReviews = async (roomId: string) => {
  reviewsLoading.value = true;
  try {
    const res = await client.get<RoomReview[]>(`/reviews/by-room/${roomId}`);
    roomReviews.value = res.data;
  } catch (err) {
    reviewError.value = getErrorMessage(err, 'Ошибка загрузки отзывов');
  } finally {
    reviewsLoading.value = false;
  }
};

const handleDeleteReview = async (reviewId: string) => {
  if (!reviewedRoom.value) return;

  reviewsLoading.value = true;
  reviewError.value = '';

  try {
    await client.delete(`/reviews/by-id/${reviewId}`);
    await Promise.all([fetchRoomReviews(reviewedRoom.value.id), fetchRooms()]);
  } catch (err) {
    reviewError.value = getErrorMessage(err, 'Ошибка удаления отзыва');
  } finally {
    reviewsLoading.value = false;
  }
};

const handleRestore = async (id: string) => {
  try {
    await client.post(`/rooms/restore/by-id/${id}`);
    await fetchRooms();
  } catch (err: unknown) {
    console.error('Ошибка восстановления:', err);
  }
};

const handleSetMaintenance = async (id: string) => {
  try {
    await client.patch(`/rooms/set-maintenance/by-id/${id}`);
    await fetchRooms();
  } catch (err) {
    console.error('Ошибка:', err);
  }
};

const handleSetAvailable = async (id: string) => {
  try {
    await client.patch(`/rooms/set-available/by-id/${id}`);
    await fetchRooms();
  } catch (err) {
    console.error('Ошибка:', err);
  }
};

onMounted(() => {
  fetchRooms();
  fetchRelations();
});
</script>

<style scoped>
.room-photo-list {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.room-photo-item {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
}

.room-photo-item img {
  aspect-ratio: 4 / 3;
  background-color: #bfc9ed;
  display: block;
  object-fit: cover;
  width: 100%;
}

.room-photo-item .btn {
  border-radius: 0;
  width: 100%;
}

.review-list {
  display: grid;
  gap: 12px;
}

.review-row {
  align-items: flex-start;
  background: linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%);
  border: 1px solid #e1e4ef;
  border-left: 5px solid #4c4993;
  border-radius: 8px;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 12px;
}

.review-content {
  flex: 1;
  min-width: 0;
}

.review-top,
.review-author {
  align-items: center;
  display: flex;
  gap: 12px;
}

.review-top {
  justify-content: space-between;
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

.rating-pill {
  border: 1px solid;
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1;
  padding: 7px 10px;
  white-space: nowrap;
}

.review-text {
  background-color: #f8f9fb;
  border-radius: 8px;
  color: #2d2640;
  line-height: 1.5;
  margin: 12px 0 0;
  padding: 12px 14px;
}

.review-text::before {
  color: #4c4993;
  content: '“';
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 0;
  margin-right: 4px;
  vertical-align: -0.2rem;
}
</style>
