<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0" style="color: #4c4993">🛠 Удобства</h2>
      <button
        v-if="isAdmin"
        class="btn btn-primary"
        style="background-color: #4c4993; border-color: #4c4993"
        @click="openCreateModal"
      >
        + Добавить удобство
      </button>
    </div>

    <!-- Таблица -->
    <div class="card shadow-sm">
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead style="background-color: #4c4993; color: #fff">
            <tr>
              <th class="ps-4">ID</th>
              <th>Название</th>
              <th>Описание</th>
              <th v-if="isAdmin" class="text-end pe-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="amenity in amenities"
              :key="amenity.id"
              style="vertical-align: middle"
            >
              <td class="ps-4">{{ amenity.id }}</td>
              <td>
                <span
                  class="badge"
                  style="
                    background-color: #a1cdc4;
                    color: #2d2640;
                    font-size: 0.85rem;
                  "
                >
                  {{ amenity.name }}
                </span>
              </td>
              <td>{{ amenity.description || '—' }}</td>
              <td v-if="isAdmin" class="text-end pe-4">
                <button
                  class="btn btn-sm me-1"
                  style="background-color: #bfc9ed; color: #2d2640"
                  @click="openEditModal(amenity)"
                >
                  ✏️
                </button>
                <button
                  class="btn btn-sm"
                  style="background-color: #fde8e8; color: #c0392b"
                  @click="confirmDelete(amenity)"
                >
                  🗑
                </button>
              </td>
            </tr>
            <tr v-if="amenities.length === 0">
              <td
                :colspan="isAdmin ? 4 : 3"
                class="text-center py-4 text-muted"
              >
                Нет удобств
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
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div
            class="modal-header"
            style="background-color: #4c4993; color: #fff"
          >
            <h5 class="modal-title">
              {{ editingAmenity ? 'Редактировать удобство' : 'Новое удобство' }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <p v-if="error" class="alert alert-danger">{{ error }}</p>
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Название *</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  required
                  placeholder="Например: Wi-Fi"
                />
              </div>
              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea
                  v-model="form.description"
                  class="form-control"
                  rows="2"
                  placeholder="Описание удобства"
                ></textarea>
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
                  :disabled="loading"
                >
                  {{ loading ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка подтверждения удаления -->
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
            <h5 class="modal-title">Подтверждение удаления</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              @click="showDeleteModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Удалить удобство <strong>{{ deletingAmenity?.name }}</strong
              >?
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
                {{ loading ? 'Удаление...' : 'Удалить' }}
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
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';

interface Amenity {
  id: number;
  name: string;
  description: string | null;
}

const userStore = useUserStore();
const isAdmin = computed(() => userStore.user?.roleType?.name === 'admin');

const amenities = ref<Amenity[]>([]);
const loading = ref(false);
const error = ref('');

// Модалка создания/редактирования
const showModal = ref(false);
const editingAmenity = ref<Amenity | null>(null);
const form = ref({ name: '', description: '' });

// Модалка удаления
const showDeleteModal = ref(false);
const deletingAmenity = ref<Amenity | null>(null);

const fetchAmenities = async () => {
  try {
    const res = await client.get('/rooms/all-relations');
    amenities.value = res.data.amenities;
  } catch (err: any) {
    console.error('Ошибка загрузки удобств:', err);
  }
};

const openCreateModal = () => {
  editingAmenity.value = null;
  form.value = { name: '', description: '' };
  error.value = '';
  showModal.value = true;
};

const openEditModal = (amenity: Amenity) => {
  editingAmenity.value = amenity;
  form.value = { name: amenity.name, description: amenity.description || '' };
  error.value = '';
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingAmenity.value = null;
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    if (editingAmenity.value) {
      // Редактирование — id в теле
      await client.patch('/rooms/amenities', {
        id: editingAmenity.value.id,
        ...form.value,
      });
    } else {
      // Создание
      await client.post('/rooms/amenities', form.value);
    }
    closeModal();
    await fetchAmenities();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка сохранения';
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (amenity: Amenity) => {
  deletingAmenity.value = amenity;
  showDeleteModal.value = true;
};

const handleDelete = async () => {
  if (!deletingAmenity.value) return;
  loading.value = true;

  try {
    await client.delete(`/rooms/amenities/by-id/${deletingAmenity.value.id}`);
    showDeleteModal.value = false;
    deletingAmenity.value = null;
    await fetchAmenities();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка удаления';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAmenities();
});
</script>
