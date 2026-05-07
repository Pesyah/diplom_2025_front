<!-- src/views/admin/AdminCoffeeVolumeView.vue -->
<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="fw-bold" style="color: #4a3f6b">📏 Объемы</h1>
      <button class="btn add-new-btn" @click="openCreateModal">+ Новый объем</button>
    </div>

    <div v-if="loading" class="text-center py-5"><div class="spinner-border"></div></div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr><th>ID</th><th>Название</th><th>Действия</th></tr>
        </thead>
        <tbody>
          <tr v-for="vol in volumes" :key="vol.id">
            <td>{{ vol.id }}</td>
            <td><span class="fw-semibold">{{ vol.name }}</span></td>
            <td>
              <button class="btn btn-sm edit-btn me-1" @click="openEditModal(vol)">✏️</button>
              <button class="btn btn-sm delete-btn" @click="deleteVolume(vol.id)">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модалка -->
    <div class="modal fade" id="volumeModal" ref="volumeModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header" style="background-color: #4a3f6b; color: #fff; border-radius: 16px 16px 0 0">
            <h5 class="modal-title">{{ editingVolume ? 'Редактировать' : 'Новый объем' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Название</label>
              <input v-model="form.name" class="form-control" placeholder="250ml" style="border-color: #c4b5e3" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn" style="background-color: #e8dff5; color: #4a3f6b" data-bs-dismiss="modal">Отмена</button>
            <button class="btn" style="background-color: #4a3f6b; color: #fff" @click="saveVolume" :disabled="saving">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { Modal } from 'bootstrap';
import { onMounted, ref } from 'vue';

const loading = ref(true);
const error = ref('');
const volumes = ref<any[]>([]);
const saving = ref(false);
const editingVolume = ref<any>(null);
const volumeModalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const form = ref({ name: '' });

const loadVolumes = async () => {
  loading.value = true;
  try {
    const res = await client.get('/coffee-volume/admin/all');
    volumes.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingVolume.value = null;
  form.value = { name: '' };
  modalInstance?.show();
};

const openEditModal = (vol: any) => {
  editingVolume.value = vol;
  form.value = { name: vol.name };
  modalInstance?.show();
};

const saveVolume = async () => {
  saving.value = true;
  try {
    if (editingVolume.value) {
      await client.patch('/coffee-volume/admin', { id: editingVolume.value.id, ...form.value });
    } else {
      await client.post('/coffee-volume/admin', form.value);
    }
    modalInstance?.hide();
    await loadVolumes();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  } finally {
    saving.value = false;
  }
};

const deleteVolume = async (id: number) => {
  if (!confirm('Удалить объем?')) return;
  try {
    await client.delete(`/coffee-volume/admin/${id}`);
    await loadVolumes();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  }
};

onMounted(() => {
  loadVolumes();
  if (volumeModalRef.value) modalInstance = new Modal(volumeModalRef.value);
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
.add-new-btn:hover { background-color: #5c4f82; transform: scale(1.03); }
.edit-btn { background-color: #e8dff5; color: #4a3f6b; border: none; border-radius: 8px; }
.edit-btn:hover { background-color: #c4b5e3; }
.delete-btn { background-color: #fde8e8; color: #e74c3c; border: none; border-radius: 8px; }
.delete-btn:hover { background-color: #f5c6cb; }
.modal-content { border-radius: 16px; border: none; box-shadow: 0 16px 40px rgba(74,63,107,0.25); }
</style>