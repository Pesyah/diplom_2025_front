<!-- src/views/admin/AdminCoffeeAdditiveView.vue -->
<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="fw-bold" style="color: #4a3f6b">➕ Добавки</h1>
      <button class="btn add-new-btn" @click="openCreateModal">
        + Новая добавка
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="row g-4">
      <div
        v-for="additive in additives"
        :key="additive.id"
        class="col-12 col-md-6 col-lg-3"
      >
        <div
          class="card h-100"
          style="border-radius: 16px; border: 2px solid #e8dff5"
        >
          <div class="card-body text-center">
            <img
              :src="getImageUrl(additive.avatar)"
              :alt="additive.name"
              class="rounded-circle mb-2"
              style="width: 64px; height: 64px; object-fit: cover"
              @error="(e: any) => { e.target.style.display = 'none' }"
            />
            <h6 class="fw-bold" style="color: #2d2640">{{ additive.name }}</h6>
            <div class="d-flex justify-content-center gap-1 mt-2">
              <button
                class="btn btn-sm edit-btn"
                @click="openEditModal(additive)"
              >
                ✏️
              </button>
              <button
                class="btn btn-sm delete-btn"
                @click="deleteAdditive(additive.id)"
              >
                🗑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка -->
    <div class="modal fade" id="additiveModal" ref="additiveModalRef">
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
              {{ editingAdditive ? 'Редактировать' : 'Новая добавка' }}
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
              <label class="form-label">Аватар (URL)</label>
              <input
                v-model="form.avatar"
                class="form-control"
                style="border-color: #c4b5e3"
                placeholder="https://..."
              />
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
              @click="saveAdditive"
              :disabled="saving"
            >
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
import { Modal } from 'bootstrap';
import { onMounted, ref } from 'vue';

const { getImageUrl } = useImageUrl();

const loading = ref(true);
const error = ref('');
const additives = ref<any[]>([]);
const saving = ref(false);
const editingAdditive = ref<any>(null);
const additiveModalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const form = ref({ name: '', avatar: '' });

const loadAdditives = async () => {
  loading.value = true;
  try {
    const res = await client.get('/coffee-additive/admin/all');
    additives.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingAdditive.value = null;
  form.value = { name: '', avatar: '' };
  modalInstance?.show();
};

const openEditModal = (additive: any) => {
  editingAdditive.value = additive;
  form.value = { name: additive.name, avatar: additive.avatar };
  modalInstance?.show();
};

const saveAdditive = async () => {
  saving.value = true;
  try {
    if (editingAdditive.value) {
      await client.patch('/coffee-additive/admin', {
        id: editingAdditive.value.id,
        ...form.value,
      });
    } else {
      await client.post('/coffee-additive/admin', form.value);
    }
    modalInstance?.hide();
    await loadAdditives();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  } finally {
    saving.value = false;
  }
};

const deleteAdditive = async (id: number) => {
  if (!confirm('Удалить добавку?')) return;
  try {
    await client.delete(`/coffee-additive/admin/${id}`);
    await loadAdditives();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  }
};

onMounted(() => {
  loadAdditives();
  if (additiveModalRef.value) modalInstance = new Modal(additiveModalRef.value);
});
</script>

<style scoped>
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
.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 16px 40px rgba(74, 63, 107, 0.25);
}
</style>
