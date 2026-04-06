<template>
  <div class="card">
    <div class="card-body">
      <h2>{{ id ? 'Редактировать' : 'Создать' }} пиццу</h2>
      <form @submit.prevent="submit">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Название</label>
            <input v-model="form.name" class="form-control" required />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Тип</label>
            <select v-model="form.pizzaType" class="form-select">
              <option v-for="t in types" :key="t.id" :value="t.id">
                {{ t.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Фото</label>
          <input
            type="file"
            @change="handleFile"
            class="form-control"
            accept="image/*"
          />
          <div v-if="previewUrl || form.photo" class="mt-2">
            <img
              :src="getImageUrl(previewUrl || form.photo)"
              style="height: 100px; object-fit: cover"
              class="border rounded"
            />
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Описание</label>
          <textarea
            v-model="form.description"
            class="form-control"
            rows="2"
          ></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Состав</label>
          <input v-model="form.structure" class="form-control" />
        </div>

        <div class="row">
          <div class="col-md-2">
            <label>Белки</label>
            <input
              v-model.number="form.proteins"
              type="number"
              class="form-control"
            />
          </div>
          <div class="col-md-2">
            <label>Жиры</label>
            <input
              v-model.number="form.fats"
              type="number"
              class="form-control"
            />
          </div>
          <div class="col-md-2">
            <label>Углеводы</label>
            <input
              v-model.number="form.carbohydrates"
              type="number"
              class="form-control"
            />
          </div>
          <div class="col-md-2">
            <label>Ккал</label>
            <input
              v-model.number="form.kilocalories"
              type="number"
              class="form-control"
            />
          </div>
          <div class="col-md-2">
            <label>КДж</label>
            <input
              v-model.number="form.kilojoules"
              type="number"
              class="form-control"
            />
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary mt-3"
          :disabled="uploading"
        >
          Сохранить
        </button>
        <router-link to="/admin/pizzas" class="btn btn-secondary mt-3 ms-2"
          >Отмена</router-link
        >
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { useUpload } from '@/composables/useUpload';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const types = ref([]);
const { uploadFile, uploading } = useUpload();

const form = ref({
  name: '',
  description: '',
  structure: '',
  pizzaType: 1,
  proteins: 0,
  fats: 0,
  carbohydrates: 0,
  kilocalories: 0,
  kilojoules: 0,
  photo: '',
});

const selectedFile = ref<File | null>(null);
const previewUrl = ref('');

onMounted(async () => {
  const res = await client.get('/pizza-admin/all-relations');
  types.value = res.data.pizzaType;
  if (id) {
    const pizza = await client.get(`/pizza-admin/pizza/${id}`);
    form.value = { ...pizza.data, pizzaType: pizza.data.pizzaType?.id };
  }
});

const handleFile = (event: any) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const submit = async () => {
  let photoUrl = form.value.photo;

  if (selectedFile.value) {
    const res = await uploadFile(selectedFile.value);
    photoUrl = res.path;
  }

  const payload = { ...form.value, photo: photoUrl };

  if (id) {
    await client.put(`/pizza-admin/pizza/${id}`, payload);
  } else {
    await client.post('/pizza-admin/pizza', payload);
  }
  router.push('/admin/pizzas');
};

const { getImageUrl } = useImageUrl();
</script>
