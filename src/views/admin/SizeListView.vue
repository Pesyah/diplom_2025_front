<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Размеры пицц</h2>
      <button @click="showModal = true" class="btn btn-primary">
        + Добавить
      </button>
    </div>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Название</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.id.slice(0, 8) }}</td>
          <td>{{ item.name }}</td>
          <td>
            <button @click="remove(item.id)" class="btn btn-sm btn-danger">
              Удалить
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      class="modal"
      :class="{ show: showModal }"
      tabindex="-1"
      style="display: block"
      v-if="showModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5>Новый размер</h5>
            <button @click="showModal = false" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <input
              v-model="newName"
              class="form-control"
              placeholder="25см, 30см..."
            />
          </div>
          <div class="modal-footer">
            <button @click="create" class="btn btn-primary">Создать</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { onMounted, ref } from 'vue';

const items = ref([]);
const showModal = ref(false);
const newName = ref('');

const fetch = async () => {
  const res = await client.get('/pizza-admin/pizza-size');
  items.value = res.data;
};

const create = async () => {
  await client.post('/pizza-admin/pizza-size', { name: newName.value });
  showModal.value = false;
  newName.value = '';
  fetch();
};

const remove = async (id: string) => {
  if (confirm('Удалить?')) await client.delete(`/pizza-admin/pizza-size/${id}`);
  fetch();
};

onMounted(fetch);
</script>

<style scoped>
.modal.show {
  background: rgba(0, 0, 0, 0.5);
}
</style>
