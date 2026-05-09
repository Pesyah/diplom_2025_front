<!-- src/views/admin/AdminCoffeeView.vue -->
<template>
  <div class="container py-4">
    <div
      class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3"
    >
      <div>
        <h1 class="fw-bold mb-0" style="color: #4a3f6b">☕ Управление кофе</h1>
        <div class="mt-2" v-if="isAdmin">
          <router-link
            to="/admin/coffee/volumes"
            class="btn btn-sm me-2 sub-nav-btn"
            >📏 Объемы</router-link
          >
          <router-link
            to="/admin/coffee/additives"
            class="btn btn-sm me-2 sub-nav-btn"
            >➕ Добавки</router-link
          >
          <router-link
            to="/admin/coffee/relations"
            class="btn btn-sm sub-nav-btn"
            >🔗 Связи</router-link
          >
        </div>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-sm"
          :class="{ active: showDeleted }"
          @click="showDeleted = !showDeleted"
          style="border-radius: 20px; border: 2px solid #c4b5e3; color: #4a3f6b"
          :style="
            showDeleted
              ? 'background-color: #4a3f6b; color: #fff !important; border-color: #4a3f6b;'
              : ''
          "
        >
          🗑 Удаленные
        </button>
        <button v-if="isAdmin" class="btn add-new-btn" @click="openCreateModal">
          + Новый кофе
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="row g-4">
      <div
        v-for="coffee in coffeeList"
        :key="coffee.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <div class="card coffee-admin-card h-100">
          <div class="position-relative" style="height: 180px">
            <img
              :src="getImageUrl(coffee.avatar)"
              :alt="coffee.name"
              class="w-100 h-100"
              style="object-fit: cover"
              @error="handleImageError"
            />
            <div
              v-if="coffee.deleted_at"
              class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style="background-color: rgba(231, 76, 60, 0.3)"
            >
              <span
                class="badge"
                style="
                  background-color: #e74c3c;
                  color: #fff;
                  font-size: 1rem;
                  padding: 0.5rem 1rem;
                "
                >Удален</span
              >
            </div>
          </div>
          <div class="card-body">
            <h5 class="fw-bold" style="color: #2d2640">{{ coffee.name }}</h5>
            <p class="text-muted small">
              {{ coffee.description?.slice(0, 80) }}...
            </p>
            <div class="d-flex gap-1">
              <button
                v-if="isAdmin && !coffee.deleted_at"
                class="btn btn-sm edit-btn"
                @click="openEditModal(coffee)"
              >
                ✏️
              </button>
              <button
                v-if="(isAdmin || isModerator) && !coffee.deleted_at"
                class="btn btn-sm delete-btn"
                @click="softDelete(coffee.id)"
              >
                🗑
              </button>
              <button
                v-if="(isAdmin || isModerator) && coffee.deleted_at"
                class="btn btn-sm restore-btn"
                @click="restore(coffee.id)"
              >
                ↩
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка создания/редактирования (только для админа) -->
    <div class="modal fade" id="coffeeModal" tabindex="-1" ref="coffeeModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div
            class="modal-header"
            style="
              background-color: #4a3f6b;
              color: #fff;
              border-radius: 16px 16px 0 0;
            "
          >
            <h5 class="modal-title">
              {{ editingCoffee ? 'Редактировать' : 'Новый кофе' }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Название</label>
              <input
                v-model="form.name"
                class="form-control"
                style="border-color: #c4b5e3"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Описание</label>
              <textarea
                v-model="form.description"
                class="form-control"
                rows="3"
                style="border-color: #c4b5e3"
              ></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Аватар</label>
              <div class="d-flex gap-2 align-items-center">
                <input
                  v-model="form.avatar"
                  class="form-control"
                  style="border-color: #c4b5e3"
                  placeholder="https://... или загрузите файл"
                />
                <button
                  class="btn btn-sm"
                  style="
                    background-color: #e8dff5;
                    color: #4a3f6b;
                    white-space: nowrap;
                    border-radius: 12px;
                  "
                  @click="triggerFileInput('coffeeAvatarInput')"
                  :disabled="uploading"
                >
                  <span
                    v-if="uploading"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  📎 Загрузить
                </button>
                <input
                  type="file"
                  id="coffeeAvatarInput"
                  style="display: none"
                  accept="image/*"
                  @change="onFileSelected"
                />
              </div>
              <div v-if="form.avatar" class="mt-2">
                <img
                  :src="getImageUrl(form.avatar)"
                  class="rounded-3"
                  style="width: 80px; height: 80px; object-fit: cover"
                  @error="handleImageError"
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn"
              style="background-color: #e8dff5; color: #4a3f6b"
              data-bs-dismiss="modal"
            >
              Отмена
            </button>
            <button
              class="btn"
              style="background-color: #4a3f6b; color: #fff"
              @click="saveCoffee"
              :disabled="saving"
            >
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              Сохранить
            </button>
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
import { Modal } from 'bootstrap';
import { computed, onMounted, ref } from 'vue';

const { getImageUrl } = useImageUrl();
const { uploadFile, uploading } = useUpload();
const userStore = useUserStore();

const isAdmin = computed(() => userStore.user?.roleType?.name === 'admin');
const isModerator = computed(
  () => userStore.user?.roleType?.name === 'moderator',
);

const loading = ref(true);
const error = ref('');
const coffeeList = ref<any[]>([]);
const showDeleted = ref(false);
const saving = ref(false);
const editingCoffee = ref<any>(null);
const coffeeModalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const form = ref({ name: '', description: '', avatar: '' });

const loadCoffee = async () => {
  loading.value = true;
  error.value = '';
  try {
    const url = showDeleted.value
      ? '/coffee/admin/deleted'
      : '/coffee/admin/all';
    const res = await client.get(url);
    coffeeList.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки';
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  if (!isAdmin.value) return;
  editingCoffee.value = null;
  form.value = { name: '', description: '', avatar: '' };
  modalInstance?.show();
};

const openEditModal = (coffee: any) => {
  if (!isAdmin.value) return;
  editingCoffee.value = coffee;
  form.value = {
    name: coffee.name,
    description: coffee.description,
    avatar: coffee.avatar || '',
  };
  modalInstance?.show();
};

const triggerFileInput = (inputId: string) => {
  document.getElementById(inputId)?.click();
};

const onFileSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const result = await uploadFile(file);
    form.value.avatar = result.url;
  } catch (err) {
    error.value = 'Ошибка загрузки файла';
  }
};

const saveCoffee = async () => {
  if (!isAdmin.value) return;
  saving.value = true;
  try {
    if (editingCoffee.value) {
      await client.patch('/coffee/admin', {
        id: editingCoffee.value.id,
        ...form.value,
      });
    } else {
      await client.post('/coffee/admin', form.value);
    }
    modalInstance?.hide();
    await loadCoffee();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
};

const softDelete = async (id: string) => {
  if (!confirm('Скрыть кофе?')) return;
  try {
    await client.delete(`/coffee/admin/soft/${id}`);
    await loadCoffee();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  }
};

const restore = async (id: string) => {
  try {
    await client.post(`/coffee/admin/restore/${id}`);
    await loadCoffee();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  }
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" fill="%23e8dff5"><rect width="300" height="180"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="40">☕</text></svg>',
    );
};

onMounted(() => {
  loadCoffee();
  if (coffeeModalRef.value) modalInstance = new Modal(coffeeModalRef.value);
});
</script>

<style scoped>
.sub-nav-btn {
  border-radius: 16px;
  border: 2px solid #c4b5e3;
  color: #4a3f6b;
  background-color: transparent;
  font-weight: 500;
  transition: all 0.2s;
}
.sub-nav-btn:hover {
  background-color: #e8dff5;
  border-color: #4a3f6b;
}
.add-new-btn {
  background-color: #4a3f6b;
  color: #fff;
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  font-weight: 500;
  border: none;
  transition: all 0.3s;
}
.add-new-btn:hover {
  background-color: #5c4f82;
  transform: scale(1.03);
}
.coffee-admin-card {
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #e8dff5;
  transition: all 0.3s;
}
.coffee-admin-card:hover {
  border-color: #c4b5e3;
  box-shadow: 0 8px 24px rgba(74, 63, 107, 0.15);
}
.edit-btn {
  background-color: #e8dff5;
  color: #4a3f6b;
  border: none;
  border-radius: 8px;
}
.edit-btn:hover {
  background-color: #c4b5e3;
}
.delete-btn {
  background-color: #fde8e8;
  color: #e74c3c;
  border: none;
  border-radius: 8px;
}
.delete-btn:hover {
  background-color: #f5c6cb;
}
.restore-btn {
  background-color: #d4edda;
  color: #27ae60;
  border: none;
  border-radius: 8px;
}
.restore-btn:hover {
  background-color: #c3e6cb;
}
.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 16px 40px rgba(74, 63, 107, 0.25);
}
</style>
