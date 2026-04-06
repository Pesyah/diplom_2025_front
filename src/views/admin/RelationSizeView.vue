<template>
  <div>
    <h2 class="mb-4">Цены (пицца + размер)</h2>
    <form @submit.prevent="create" class="row g-3 mb-4">
      <div class="col-md-4">
        <select v-model="form.pizza" class="form-select" required>
          <option value="">Выберите пиццу</option>
          <option v-for="p in pizzas" :key="p.id" :value="p.id">
            {{ p.name }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <select v-model="form.pizzaSize" class="form-select" required>
          <option value="">Выберите размер</option>
          <option v-for="s in sizes" :key="s.id" :value="s.id">
            {{ s.name }}
          </option>
        </select>
      </div>
      <div class="col-md-2">
        <input
          v-model.number="form.price"
          placeholder="Цена"
          class="form-control"
          required
        />
      </div>
      <div class="col-md-2">
        <button class="btn btn-primary">+ Добавить</button>
      </div>
    </form>
    <table class="table">
      <thead>
        <tr>
          <th>Пицца</th>
          <th>Размер</th>
          <th>Цена</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.pizza?.name }}</td>
          <td>{{ item.pizzaSize?.name }}</td>
          <td>{{ item.price }} ₽</td>
          <td>
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
import { onMounted, ref } from 'vue';
const items = ref([]);
const pizzas = ref([]);
const sizes = ref([]);
const form = ref({ pizza: '', pizzaSize: '', price: 0 });
const fetch = async () => {
  const res = await client.get('/pizza-admin/pizza-size-relation');
  items.value = res.data;
};
const fetchData = async () => {
  const res = await client.get('/pizza-admin/all-relations');
  pizzas.value = res.data.pizza;
  sizes.value = res.data.pizzaSize;
};
const create = async () => {
  await client.post('/pizza-admin/pizza-size-relation', form.value);
  form.value = { pizza: '', pizzaSize: '', price: 0 };
  fetch();
};
const remove = async (id: string) => {
  if (confirm('Удалить?'))
    await client.delete(`/pizza-admin/pizza-size-relation/${id}`);
  fetch();
};
onMounted(() => {
  fetch();
  fetchData();
});
</script>
