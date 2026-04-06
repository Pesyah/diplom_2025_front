<template>
  <div class="card">
    <div class="card-body">
      <h2>{{ id ? 'Редактировать' : 'Создать' }} пиццу</h2>
      <form @submit.prevent="submit">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Название *</label>
            <input
              v-model="form.name"
              class="form-control"
              :class="{ 'is-invalid': errors.name }"
              @blur="validateField('name')"
            />
            <div class="invalid-feedback">{{ errors.name }}</div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Тип *</label>
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
          <label class="form-label">Описание *</label>
          <textarea
            v-model="form.description"
            class="form-control"
            :class="{ 'is-invalid': errors.description }"
            rows="2"
            @blur="validateField('description')"
          ></textarea>
          <div class="invalid-feedback">{{ errors.description }}</div>
        </div>

        <div class="mb-3">
          <label class="form-label">Состав *</label>
          <input
            v-model="form.structure"
            class="form-control"
            :class="{ 'is-invalid': errors.structure }"
            @blur="validateField('structure')"
          />
          <div class="invalid-feedback">{{ errors.structure }}</div>
        </div>

        <div class="row">
          <div class="col-md-2 mb-2">
            <label>Белки (г) *</label>
            <input
              v-model.number="form.proteins"
              type="number"
              step="0.1"
              class="form-control"
              :class="{ 'is-invalid': errors.proteins }"
              @blur="validateField('proteins')"
            />
            <div class="invalid-feedback">{{ errors.proteins }}</div>
          </div>
          <div class="col-md-2 mb-2">
            <label>Жиры (г) *</label>
            <input
              v-model.number="form.fats"
              type="number"
              step="0.1"
              class="form-control"
              :class="{ 'is-invalid': errors.fats }"
              @blur="validateField('fats')"
            />
            <div class="invalid-feedback">{{ errors.fats }}</div>
          </div>
          <div class="col-md-2 mb-2">
            <label>Углеводы (г) *</label>
            <input
              v-model.number="form.carbohydrates"
              type="number"
              step="0.1"
              class="form-control"
              :class="{ 'is-invalid': errors.carbohydrates }"
              @blur="validateField('carbohydrates')"
            />
            <div class="invalid-feedback">{{ errors.carbohydrates }}</div>
          </div>
          <div class="col-md-2 mb-2">
            <label>Ккал *</label>
            <input
              v-model.number="form.kilocalories"
              type="number"
              class="form-control"
              :class="{ 'is-invalid': errors.kilocalories }"
              @blur="validateField('kilocalories')"
            />
            <div class="invalid-feedback">{{ errors.kilocalories }}</div>
          </div>
          <div class="col-md-2 mb-2">
            <label>КДж *</label>
            <input
              v-model.number="form.kilojoules"
              type="number"
              class="form-control"
              :class="{ 'is-invalid': errors.kilojoules }"
              @blur="validateField('kilojoules')"
            />
            <div class="invalid-feedback">{{ errors.kilojoules }}</div>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary mt-3"
          :disabled="uploading || !isFormValid"
        >
          {{ uploading ? 'Сохранение...' : 'Сохранить' }}
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
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const types = ref([]);
const { uploadFile, uploading } = useUpload();
const { getImageUrl } = useImageUrl();

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

const errors = ref({
  name: '',
  description: '',
  structure: '',
  proteins: '',
  fats: '',
  carbohydrates: '',
  kilocalories: '',
  kilojoules: '',
});

const selectedFile = ref<File | null>(null);
const previewUrl = ref('');

const validateField = (field: string) => {
  const value = form.value[field as keyof typeof form.value];

  switch (field) {
    case 'name': {
      if (!value || value.toString().trim() === '') {
        errors.value.name = 'Название обязательно';
      } else if (value.toString().length < 2) {
        errors.value.name = 'Название минимум 2 символа';
      } else if (value.toString().length > 100) {
        errors.value.name = 'Название не более 100 символов';
      } else {
        errors.value.name = '';
      }
      break;
    }

    case 'description': {
      if (!value || value.toString().trim() === '') {
        errors.value.description = 'Описание обязательно';
      } else if (value.toString().length < 10) {
        errors.value.description = 'Описание минимум 10 символов';
      } else {
        errors.value.description = '';
      }
      break;
    }

    case 'structure': {
      if (!value || value.toString().trim() === '') {
        errors.value.structure = 'Состав обязателен';
      } else {
        errors.value.structure = '';
      }
      break;
    }

    case 'proteins':
    case 'fats':
    case 'carbohydrates': {
      const num = Number(value);
      if (isNaN(num)) {
        errors.value[field] = 'Введите число';
      } else if (num < 0) {
        errors.value[field] = 'Не может быть отрицательным';
      } else if (num > 100) {
        errors.value[field] = 'Не более 100г';
      } else {
        errors.value[field] = '';
      }
      break;
    }

    case 'kilocalories':
    case 'kilojoules': {
      const kcal = Number(value);
      if (isNaN(kcal)) {
        errors.value[field] = 'Введите число';
      } else if (kcal < 0) {
        errors.value[field] = 'Не может быть отрицательным';
      } else {
        errors.value[field] = '';
      }
      break;
    }
  }
};

const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== '' &&
    form.value.description.trim() !== '' &&
    form.value.structure.trim() !== '' &&
    form.value.proteins >= 0 &&
    form.value.fats >= 0 &&
    form.value.carbohydrates >= 0 &&
    form.value.kilocalories >= 0 &&
    form.value.kilojoules >= 0 &&
    errors.value.name === '' &&
    errors.value.description === '' &&
    errors.value.structure === '' &&
    errors.value.proteins === '' &&
    errors.value.fats === '' &&
    errors.value.carbohydrates === '' &&
    errors.value.kilocalories === '' &&
    errors.value.kilojoules === ''
  );
});

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
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл не более 5MB');
      return;
    }
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const submit = async () => {
  validateField('name');
  validateField('description');
  validateField('structure');
  validateField('proteins');
  validateField('fats');
  validateField('carbohydrates');
  validateField('kilocalories');
  validateField('kilojoules');

  if (!isFormValid.value) {
    alert('Заполните все поля корректно');
    return;
  }

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
</script>
