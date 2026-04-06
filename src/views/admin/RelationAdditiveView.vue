<template>
  <div>
    <h2 class="mb-4">Добавки к размерам</h2>
    <form @submit.prevent="create" class="row g-3 mb-4">
      <div class="col-md-3">
        <select v-model="form.pizzaSizeRelation" class="form-select" required>
          <option value="">Пицца+Размер</option>
          <option v-for="r in relations" :key="r.id" :value="r.id">
            {{ r.pizza?.name }} - {{ r.pizzaSize?.name }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <select v-model="form.pizzaAdditive" class="form-select" required>
          <option value="">Добавка</option>
          <option v-for="a in additives" :key="a.id" :value="a.id">
            {{ a.name }}
          </option>
        </select>
      </div>
      <div class="col-md-2">
        <select v-model="form.isAdd" class="form-select">
          <option :value="true">Платная (+)</option>
          <option :value="false">Можно убрать</option>
        </select>
      </div>
      <div class="col-md-2">
        <input
          v-model.number="form.price"
          placeholder="Цена"
          class="form-control"
        />
      </div>
      <div class="col-md-2">
        <button class="btn btn-primary">+ Добавить</button>
      </div>
    </form>
    <table class="table">
      <thead>
        <tr>
          <th>Пицца+Размер</th>
          <th>Добавка</th>
          <th>Тип</th>
          <th>Цена</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>
            {{ item.pizzaSizeRelation?.pizza?.name }} -
            {{ item.pizzaSizeRelation?.pizzaSize?.name }}
          </td>
          <td>{{ item.pizzaAdditive?.name }}</td>
          <td>{{ item.isAdd ? 'Платная' : 'Можно убрать' }}</td>
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
const relations = ref([]);
const additives = ref([]);
const form = ref({
  pizzaSizeRelation: '',
  pizzaAdditive: '',
  isAdd: true,
  price: 0,
});
const fetch = async () => {
  const res = await client.get('/pizza-admin/pizza-additive-relation');
  items.value = res.data;
};
const fetchData = async () => {
  const res = await client.get('/pizza-admin/all-relations');
  relations.value = res.data.pizzaSizeRelation;
  additives.value = res.data.pizzaAdditive;
};
const create = async () => {
  await client.post('/pizza-admin/pizza-additive-relation', form.value);
  form.value = {
    pizzaSizeRelation: '',
    pizzaAdditive: '',
    isAdd: true,
    price: 0,
  };
  fetch();
};
const remove = async (id: string) => {
  if (confirm('Удалить?'))
    await client.delete(`/pizza-admin/pizza-additive-relation/${id}`);
  fetch();
};
onMounted(() => {
  fetch();
  fetchData();
});
</script>
