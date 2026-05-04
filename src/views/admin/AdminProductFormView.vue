<!-- src/views/admin/AdminProductFormView.vue -->
<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <div class="card shadow">
          <div class="card-body p-4">
            <h2 class="mb-4">
              {{ isEdit ? 'Редактировать продукт' : 'Создать продукт' }}
            </h2>

            <form @submit.prevent="handleSubmit">
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">Название *</label>
                    <input
                      v-model="form.name"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Цена *</label>
                    <input
                      v-model.number="form.price"
                      type="number"
                      class="form-control"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Описание</label>
                <textarea
                  v-model="form.description"
                  class="form-control"
                  rows="4"
                ></textarea>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Бренд *</label>
                    <select
                      v-model="form.producersId"
                      class="form-select"
                      required
                    >
                      <option value="">Выберите бренд</option>
                      <option
                        v-for="brand in brands"
                        :key="brand.id"
                        :value="brand.id"
                      >
                        {{ brand.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Количество на складе</label>
                    <input
                      v-model.number="form.stockQuantity"
                      type="number"
                      class="form-control"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Категории</label>
                <div class="row">
                  <div
                    v-for="category in categories"
                    :key="category.id"
                    class="col-md-4"
                  >
                    <div class="form-check">
                      <input
                        :id="`cat-${category.id}`"
                        type="checkbox"
                        class="form-check-input"
                        :value="category.id"
                        v-model="form.productsCategoryIds"
                      />
                      <label
                        :for="`cat-${category.id}`"
                        class="form-check-label"
                      >
                        {{ category.name }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Изображения (URL или загрузка)</label>
                <div
                  v-for="(image, index) in form.images"
                  :key="index"
                  class="input-group mb-2"
                >
                  <input
                    v-model="form.images[index]"
                    type="text"
                    class="form-control"
                    placeholder="URL изображения"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    @click="removeImage(index)"
                  >
                    ✕
                  </button>
                </div>
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  @click="addImage"
                >
                  + Добавить URL
                </button>

                <div class="mt-2">
                  <label class="form-label">Или загрузите файлы:</label>
                  <input
                    type="file"
                    class="form-control"
                    multiple
                    accept="image/*"
                    @change="handleFilesUpload"
                  />
                </div>

                <!-- Превью изображений -->
                <div v-if="form.images.length > 0" class="row mt-3">
                  <div
                    v-for="(image, index) in form.images"
                    :key="index"
                    class="col-md-3 mb-2"
                  >
                    <div class="position-relative">
                      <img
                        :src="getImageUrl(image)"
                        class="img-thumbnail w-100"
                        style="height: 150px; object-fit: cover"
                      />
                      <button
                        type="button"
                        class="btn btn-danger btn-sm position-absolute top-0 end-0"
                        @click="removeImage(index)"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="error" class="alert alert-danger">{{ error }}</div>

              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-warning"
                  :disabled="saving"
                >
                  {{
                    saving ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'
                  }}
                </button>
                <router-link
                  to="/admin/products"
                  class="btn btn-outline-secondary"
                >
                  Отмена
                </router-link>
              </div>
            </form>
          </div>
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
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { getImageUrl } = useImageUrl();
const { uploadFile } = useUpload();

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

const isEdit = ref(false);
const saving = ref(false);
const error = ref('');
const brands = ref<Brand[]>([]);
const categories = ref<Category[]>([]);

const form = ref({
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  images: [] as string[],
  producersId: null as number | null,
  productsCategoryIds: [] as number[],
});

const loadRelations = async () => {
  try {
    const res = await client.get('/products/all-relations');
    brands.value = res.data.producers || [];
    categories.value = res.data.productsCategory || [];
  } catch (err) {
    console.error('Error loading relations:', err);
  }
};

const loadProduct = async (id: string) => {
  try {
    const res = await client.get(`/products/by-id/${id}`);
    const product = res.data;
    form.value = {
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      stockQuantity: product.stockQuantity || 0,
      images: product.images || [],
      producersId: product.producer?.id || product.producersId || null,
      productsCategoryIds:
        product.categories?.map((c: any) => c.id) ||
        product.productsCategoryIds ||
        [],
    };
  } catch (err) {
    console.error('Error loading product:', err);
    error.value = 'Ошибка загрузки продукта';
  }
};

onMounted(async () => {
  await loadRelations();
  const id = route.params.id as string;
  if (id) {
    isEdit.value = true;
    await loadProduct(id);
  }
});

const addImage = () => {
  form.value.images.push('');
};

const removeImage = (index: number) => {
  form.value.images.splice(index, 1);
};

const handleFilesUpload = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;

  for (const file of Array.from(files)) {
    try {
      const res = await uploadFile(file);
      const path = res.path || res.url || res.filePath || '';
      if (path) {
        form.value.images.push(path);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  }
};

const handleSubmit = async () => {
  saving.value = true;
  error.value = '';

  try {
    const payload = {
      ...form.value,
      images: form.value.images.filter((img) => img.trim() !== ''),
    };

    if (isEdit.value) {
      await client.patch('/admin/products', {
        id: route.params.id as string,
        ...payload,
      });
    } else {
      await client.post('/admin/products', payload);
    }
    router.push('/admin/products');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
};
</script>
