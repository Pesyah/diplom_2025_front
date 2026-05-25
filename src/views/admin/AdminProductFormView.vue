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
                    <div class="d-flex justify-content-between align-items-center">
                      <label class="form-label">Бренд *</label>
                      <button
                        type="button"
                        class="btn btn-link btn-sm text-decoration-none p-0"
                        @click="openBrandModal"
                      >
                        + Добавить бренд
                      </button>
                    </div>
                    <select
                      v-model="form.producersId"
                      class="form-select"
                      required
                    >
                      <option :value="null" disabled>Выберите бренд</option>
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
                <div class="d-flex justify-content-between align-items-center">
                  <label class="form-label">Категории</label>
                  <button
                    type="button"
                    class="btn btn-link btn-sm text-decoration-none p-0"
                    @click="openCategoryModal"
                  >
                    + Добавить категорию
                  </button>
                </div>
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

  <div
    v-if="showBrandModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog">
      <form class="modal-content" @submit.prevent="createBrand">
        <div class="modal-header">
          <h5 class="modal-title">Новый бренд</h5>
          <button type="button" class="btn-close" @click="closeBrandModal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Название *</label>
            <input v-model.trim="brandForm.name" class="form-control" required />
          </div>
          <div class="mb-3">
            <label class="form-label">Описание *</label>
            <textarea
              v-model.trim="brandForm.description"
              class="form-control"
              rows="3"
              required
            ></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Аватар *</label>
            <div class="input-group">
              <input v-model.trim="brandForm.avatar" class="form-control" required />
              <label class="btn btn-outline-secondary mb-0">
                Загрузить файл
                <input
                  type="file"
                  class="d-none"
                  accept="image/*"
                  :disabled="uploadingBrandAvatar"
                  @change="handleRelationAvatarUpload($event, 'brand')"
                />
              </label>
            </div>
            <small v-if="uploadingBrandAvatar" class="text-muted">
              Загрузка...
            </small>
          </div>
          <div v-if="brandError" class="alert alert-danger mb-0">
            {{ brandError }}
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="closeBrandModal">
            Отмена
          </button>
          <button type="submit" class="btn btn-warning" :disabled="savingBrand">
            {{ savingBrand ? 'Сохранение...' : 'Создать бренд' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  <div v-if="showBrandModal" class="modal-backdrop fade show"></div>

  <div
    v-if="showCategoryModal"
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog">
      <form class="modal-content" @submit.prevent="createCategory">
        <div class="modal-header">
          <h5 class="modal-title">Новая категория</h5>
          <button
            type="button"
            class="btn-close"
            @click="closeCategoryModal"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Название *</label>
            <input
              v-model.trim="categoryForm.name"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label class="form-label">Описание *</label>
            <textarea
              v-model.trim="categoryForm.description"
              class="form-control"
              rows="3"
              required
            ></textarea>
          </div>
          <div class="mb-3">
            <label class="form-label">Аватар *</label>
            <div class="input-group">
              <input
                v-model.trim="categoryForm.avatar"
                class="form-control"
                required
              />
              <label class="btn btn-outline-secondary mb-0">
                Загрузить файл
                <input
                  type="file"
                  class="d-none"
                  accept="image/*"
                  :disabled="uploadingCategoryAvatar"
                  @change="handleRelationAvatarUpload($event, 'category')"
                />
              </label>
            </div>
            <small v-if="uploadingCategoryAvatar" class="text-muted">
              Загрузка...
            </small>
          </div>
          <div v-if="categoryError" class="alert alert-danger mb-0">
            {{ categoryError }}
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="closeCategoryModal"
          >
            Отмена
          </button>
          <button type="submit" class="btn btn-warning" :disabled="savingCategory">
            {{ savingCategory ? 'Сохранение...' : 'Создать категорию' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  <div v-if="showCategoryModal" class="modal-backdrop fade show"></div>
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
  description?: string;
  avatar?: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  avatar?: string;
}

interface ProductResponse {
  name?: string;
  description?: string | null;
  price?: number | string;
  stockQuantity?: number;
  images?: string[] | null;
  producers?: Brand | null;
  producer?: Brand | null;
  producersId?: number | null;
  productsCategory?: Category[] | null;
  categories?: Category[] | null;
  productsCategoryIds?: number[] | null;
}

interface ProductPayload {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  images: string[];
  producersId: number;
  productsCategoryIds: number[];
}

interface UploadResponse {
  path?: string;
  url?: string;
  filePath?: string;
}

interface RelationForm {
  name: string;
  description: string;
  avatar: string;
}

const isEdit = ref(false);
const saving = ref(false);
const error = ref('');
const brands = ref<Brand[]>([]);
const categories = ref<Category[]>([]);
const showBrandModal = ref(false);
const showCategoryModal = ref(false);
const savingBrand = ref(false);
const savingCategory = ref(false);
const uploadingBrandAvatar = ref(false);
const uploadingCategoryAvatar = ref(false);
const brandError = ref('');
const categoryError = ref('');

const defaultAvatar = 'uploads/default-avatar.png';

const brandForm = ref<RelationForm>({
  name: '',
  description: '',
  avatar: defaultAvatar,
});

const categoryForm = ref<RelationForm>({
  name: '',
  description: '',
  avatar: defaultAvatar,
});

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
    const product = res.data as ProductResponse;
    form.value = {
      name: product.name || '',
      description: product.description || '',
      price: Number(product.price) || 0,
      stockQuantity: product.stockQuantity || 0,
      images: product.images || [],
      producersId:
        product.producers?.id ||
        product.producer?.id ||
        product.producersId ||
        null,
      productsCategoryIds:
        product.productsCategory?.map((category) => category.id) ||
        product.categories?.map((category) => category.id) ||
        product.productsCategoryIds ||
        [],
    };
  } catch (err) {
    console.error('Error loading product:', err);
    error.value = 'Ошибка загрузки продукта';
  }
};

const getApiErrorMessage = (err: unknown, fallback: string) => {
  const responseError = err as {
    response?: { data?: { message?: string | string[] } };
  };
  const message = responseError.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  return message || fallback;
};

const resetBrandForm = () => {
  brandForm.value = {
    name: '',
    description: '',
    avatar: defaultAvatar,
  };
};

const resetCategoryForm = () => {
  categoryForm.value = {
    name: '',
    description: '',
    avatar: defaultAvatar,
  };
};

const openBrandModal = () => {
  brandError.value = '';
  showBrandModal.value = true;
};

const closeBrandModal = () => {
  showBrandModal.value = false;
  brandError.value = '';
  resetBrandForm();
};

const openCategoryModal = () => {
  categoryError.value = '';
  showCategoryModal.value = true;
};

const closeCategoryModal = () => {
  showCategoryModal.value = false;
  categoryError.value = '';
  resetCategoryForm();
};

const createBrand = async () => {
  savingBrand.value = true;
  brandError.value = '';

  try {
    const res = await client.post<Brand>('/admin/brands', brandForm.value);
    const brand = res.data;
    brands.value = [...brands.value, brand].sort((a, b) =>
      a.name.localeCompare(b.name, 'ru'),
    );
    form.value.producersId = brand.id;
    closeBrandModal();
  } catch (err: unknown) {
    brandError.value = getApiErrorMessage(err, 'Ошибка создания бренда');
  } finally {
    savingBrand.value = false;
  }
};

const createCategory = async () => {
  savingCategory.value = true;
  categoryError.value = '';

  try {
    const res = await client.post<Category>(
      '/admin/categories',
      categoryForm.value,
    );
    const category = res.data;
    categories.value = [...categories.value, category].sort((a, b) =>
      a.name.localeCompare(b.name, 'ru'),
    );

    if (!form.value.productsCategoryIds.includes(category.id)) {
      form.value.productsCategoryIds.push(category.id);
    }

    closeCategoryModal();
  } catch (err: unknown) {
    categoryError.value = getApiErrorMessage(
      err,
      'Ошибка создания категории',
    );
  } finally {
    savingCategory.value = false;
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
      const res = (await uploadFile(file)) as UploadResponse;
      const path = res.path || res.url || res.filePath || '';
      if (path) {
        form.value.images.push(path);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
    }
  }
};

const handleRelationAvatarUpload = async (
  e: Event,
  relationType: 'brand' | 'category',
) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (relationType === 'brand') {
    uploadingBrandAvatar.value = true;
    brandError.value = '';
  } else {
    uploadingCategoryAvatar.value = true;
    categoryError.value = '';
  }

  try {
    const res = (await uploadFile(file)) as UploadResponse;
    const path = res.path || res.url || res.filePath || '';

    if (path && relationType === 'brand') {
      brandForm.value.avatar = path;
    }

    if (path && relationType === 'category') {
      categoryForm.value.avatar = path;
    }
  } catch (err: unknown) {
    const message = getApiErrorMessage(err, 'Ошибка загрузки файла');

    if (relationType === 'brand') {
      brandError.value = message;
    } else {
      categoryError.value = message;
    }
  } finally {
    if (relationType === 'brand') {
      uploadingBrandAvatar.value = false;
    } else {
      uploadingCategoryAvatar.value = false;
    }
    input.value = '';
  }
};

const handleSubmit = async () => {
  saving.value = true;
  error.value = '';

  try {
    if (form.value.producersId === null) {
      error.value = 'Выберите бренд';
      return;
    }

    const payload: ProductPayload = {
      ...form.value,
      producersId: form.value.producersId,
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
  } catch (err: unknown) {
    error.value = getApiErrorMessage(err, 'Ошибка сохранения');
  } finally {
    saving.value = false;
  }
};
</script>
