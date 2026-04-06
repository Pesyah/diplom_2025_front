<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Пиццы</h2>
      <router-link to="/admin/pizzas/create" class="btn btn-primary"
        >+ Создать</router-link
      >
    </div>
    <table class="table table-striped table-hover">
      <thead>
        <tr>
          <th>Фото</th>
          <th>ID</th>
          <th>Название</th>
          <th>Тип</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>
            <img
              v-if="item.photo"
              :src="getImageUrl(item.photo)"
              style="height: 40px; width: 40px; object-fit: cover"
              class="rounded"
            />
            <span v-else>Нет</span>
          </td>
          <td>{{ item.id.slice(0, 8) }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.pizzaType?.name }}</td>
          <td>
            <router-link
              :to="`/admin/pizzas/${item.id}/edit`"
              class="btn btn-sm btn-warning me-2"
              >Ред</router-link
            >
            <button @click="remove(item.id)" class="btn btn-sm btn-danger">
              Уд
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { onMounted, ref } from 'vue';

const items = ref([]);

const fetch = async () => {
  const res = await client.get('/pizza-admin/pizza');
  items.value = res.data;
};

const remove = async (id: string) => {
  if (confirm('Удалить?')) {
    await client.delete(`/pizza-admin/pizza/${id}`);
    fetch();
  }
};

const { getImageUrl } = useImageUrl();
onMounted(fetch);
</script>
