<template>
  <div>
    <div class="d-flex justify-content-between mb-4">
      <h2>Добавки</h2>
      <button @click="showModal = true" class="btn btn-primary">
        + Добавить
      </button>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Аватар</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.name }}</td>
          <td>
            <img
              v-if="item.avatar"
              :src="getImageUrl(item.avatar)"
              style="height: 50px; width: 50px; object-fit: cover"
              class="rounded"
              @error="(e) => (e.target.style.display = 'none')"
            />
            <span v-else>Нет</span>
          </td>
          <td>
            <button @click="remove(item.id)" class="btn btn-sm btn-danger">
              Уд
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h5>Новая добавка</h5>
          <button class="btn-close" @click="showModal = false"></button>
        </div>
        <div class="modal-body">
          <input
            v-model="newName"
            placeholder="Название"
            class="form-control mb-2"
          />
          <input
            type="file"
            @change="handleFile"
            class="form-control"
            accept="image/*"
          />
          <div v-if="previewUrl" class="mt-2">
            <img
              :src="getImageUrl(previewUrl)"
              style="height: 100px; object-fit: cover"
              class="border rounded"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="create" class="btn btn-primary" :disabled="uploading">
            Создать
          </button>
          <button @click="showModal = false" class="btn btn-secondary">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { useUpload } from '@/composables/useUpload';
import { onMounted, ref } from 'vue';

const items = ref([]);
const showModal = ref(false);
const newName = ref('');
const selectedFile = ref<File | null>(null);
const previewUrl = ref('');
const { uploadFile, uploading } = useUpload();

const fetch = async () => {
  const res = await client.get('/pizza-admin/pizza-additive');
  items.value = res.data;
};

const handleFile = (event: any) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const create = async () => {
  if (!newName.value) {
    alert('Введите название');
    return;
  }

  let avatarPath = '';
  if (selectedFile.value) {
    const res = await uploadFile(selectedFile.value);
    // res - это объект ответа с полем path
    avatarPath = res.path;
  }

  await client.post('/pizza-admin/pizza-additive', {
    name: newName.value,
    avatar: avatarPath,
  });

  showModal.value = false;
  newName.value = '';
  selectedFile.value = null;
  previewUrl.value = '';
  fetch();
};
const remove = async (id: string) => {
  if (confirm('Удалить?')) {
    await client.delete(`/pizza-admin/pizza-additive/${id}`);
    fetch();
  }
};

const { getImageUrl } = useImageUrl();
onMounted(fetch);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
