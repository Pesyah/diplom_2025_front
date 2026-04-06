<template>
  <div class="card">
    <div class="card-body">
      <h2>{{ id ? 'Редактировать' : 'Создать' }} размер</h2>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label>Название</label
          ><input v-model="form.name" class="form-control" required />
        </div>
        <button class="btn btn-primary">Сохранить</button>
        <router-link to="/admin/sizes" class="btn btn-secondary ms-2"
          >Отмена</router-link
        >
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const form = ref({ name: '' });

onMounted(async () => {
  if (id) {
    const res = await client.get(`/pizza-admin/pizza-size/${id}`);
    form.value = res.data;
  }
});
const submit = async () => {
  if (id) await client.put(`/pizza-admin/pizza-size/${id}`, form.value);
  else await client.post('/pizza-admin/pizza-size', form.value);
  router.push('/admin/sizes');
};
</script>
