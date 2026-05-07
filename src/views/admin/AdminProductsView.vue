<!-- src/views/admin/AdminProductsView.vue -->
<template>
  <div class="container py-4">
    <div
      class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3"
    >
      <div>
        <h1 class="fw-bold mb-0" style="color: #4a3f6b">🥐 Продукты</h1>
        <router-link
          to="/admin/products/categories"
          class="btn btn-sm mt-2 sub-nav-btn"
          >📂 Категории</router-link
        >
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-sm"
          :class="{ active: showDeleted }"
          @click="showDeleted = !showDeleted"
          style="border-radius: 20px; border: 2px solid #c4b5e3; color: #4a3f6b"
          :style="
            showDeleted
              ? 'background-color: #4a3f6b; color: #fff !important; border-color: #4a3f6b;'
              : ''
          "
        >
          🗑 Удаленные
        </button>
        <button class="btn add-new-btn" @click="openCreateModal">
          + Новый продукт
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="row g-4">
      <div
        v-for="product in products"
        :key="product.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <div
          class="card product-admin-card h-100"
          :class="{ deleted: product.deleted_at }"
        >
          <div class="position-relative" style="height: 180px">
            <img
              :src="getImageUrl(product.avatar)"
              :alt="product.name"
              class="w-100 h-100"
              style="object-fit: cover; border-radius: 16px 16px 0 0"
              @error="handleProductImageError"
            />
            <div
              v-if="product.deleted_at"
              class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style="
                background-color: rgba(231, 76, 60, 0.3);
                border-radius: 16px 16px 0 0;
              "
            >
              <span
                class="badge"
                style="
                  background-color: #e74c3c;
                  color: #fff;
                  font-size: 1rem;
                  padding: 0.5rem 1rem;
                "
                >Удален</span
              >
            </div>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 class="fw-bold mb-1" style="color: #2d2640">
                  {{ product.name }}
                </h5>
                <span class="badge category-badge">{{
                  product.productsCategory?.name
                }}</span>
              </div>
              <span class="fw-bold" style="color: #4a3f6b; font-size: 1.1rem"
                >{{ Number(product.price).toFixed(2) }} ₽</span
              >
            </div>
            <p class="text-muted small">
              {{ product.description?.slice(0, 100) }}...
            </p>
            <div class="d-flex gap-1">
              <button
                v-if="!product.deleted_at"
                class="btn btn-sm edit-btn"
                @click="openEditModal(product)"
              >
                ✏️
              </button>
              <button
                v-if="!product.deleted_at"
                class="btn btn-sm delete-btn"
                @click="softDelete(product.id)"
              >
                🗑
              </button>
              <button
                v-if="product.deleted_at"
                class="btn btn-sm restore-btn"
                @click="restore(product.id)"
              >
                ↩
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка -->
    <div class="modal fade" id="productModal" ref="productModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div
            class="modal-header"
            style="
              background-color: #4a3f6b;
              color: #fff;
              border-radius: 16px 16px 0 0;
            "
          >
            <h5 class="modal-title">
              {{ editingProduct ? 'Редактировать' : 'Новый продукт' }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Название</label>
              <input
                v-model="form.name"
                class="form-control"
                style="border-color: #c4b5e3"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Описание</label>
              <textarea
                v-model="form.description"
                class="form-control"
                rows="3"
                style="border-color: #c4b5e3"
              ></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Категория</label>
              <select
                v-model="form.productsCategoryId"
                class="form-select"
                style="border-color: #c4b5e3"
              >
                <option :value="0">Выберите...</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Цена</label>
              <input
                v-model.number="form.price"
                type="number"
                step="0.01"
                class="form-control"
                style="border-color: #c4b5e3"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Аватар</label>
              <div class="d-flex gap-2 align-items-center">
                <input
                  v-model="form.avatar"
                  class="form-control"
                  style="border-color: #c4b5e3"
                  placeholder="https://... или загрузите файл"
                />
                <button
                  class="btn btn-sm"
                  style="
                    background-color: #e8dff5;
                    color: #4a3f6b;
                    white-space: nowrap;
                    border-radius: 12px;
                  "
                  @click="triggerFileInput('productAvatarInput')"
                  :disabled="uploading"
                >
                  <span
                    v-if="uploading"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  📎 Загрузить
                </button>
                <input
                  type="file"
                  id="productAvatarInput"
                  style="display: none"
                  accept="image/*"
                  @change="onFileSelected"
                />
              </div>
              <div v-if="form.avatar" class="mt-2">
                <img
                  :src="getImageUrl(form.avatar)"
                  class="rounded-3"
                  style="width: 80px; height: 80px; object-fit: cover"
                  @error="handlePreviewImageError"
                />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              class="btn"
              style="background-color: #e8dff5; color: #4a3f6b"
              data-bs-dismiss="modal"
            >
              Отмена
            </button>
            <button
              class="btn"
              style="background-color: #4a3f6b; color: #fff"
              @click="saveProduct"
              :disabled="saving"
            >
              Сохранить
            </button>
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
import { Modal } from 'bootstrap';
import { onMounted, ref } from 'vue';

const { getImageUrl } = useImageUrl();
const { uploadFile, uploading } = useUpload();

const loading = ref(true);
const error = ref('');
const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const showDeleted = ref(false);
const saving = ref(false);
const editingProduct = ref<any>(null);
const productModalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const form = ref({
  name: '',
  description: '',
  productsCategoryId: 0,
  price: 0,
  avatar: '',
});

const loadData = async () => {
  loading.value = true;
  try {
    const url = showDeleted.value
      ? '/products/admin/deleted'
      : '/products/admin/all';
    const [prodRes, catRes] = await Promise.all([
      client.get(url),
      client.get('/products-category/admin/all'),
    ]);
    products.value = prodRes.data;
    categories.value = catRes.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingProduct.value = null;
  form.value = {
    name: '',
    description: '',
    productsCategoryId: 0,
    price: 0,
    avatar: '',
  };
  modalInstance?.show();
};

const openEditModal = (product: any) => {
  editingProduct.value = product;
  form.value = {
    name: product.name,
    description: product.description,
    productsCategoryId: product.productsCategory?.id || 0,
    price: Number(product.price),
    avatar: product.avatar || '',
  };
  modalInstance?.show();
};

const triggerFileInput = (inputId: string) => {
  document.getElementById(inputId)?.click();
};

const onFileSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const result = await uploadFile(file);
    form.value.avatar = result.url;
  } catch (err) {
    error.value = 'Ошибка загрузки файла';
  }
};

const saveProduct = async () => {
  saving.value = true;
  try {
    const payload = {
      ...form.value,
      productsCategoryId: form.value.productsCategoryId || undefined,
    };
    if (editingProduct.value) {
      await client.patch('/products/admin', {
        id: editingProduct.value.id,
        ...payload,
      });
    } else {
      await client.post('/products/admin', payload);
    }
    modalInstance?.hide();
    await loadData();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  } finally {
    saving.value = false;
  }
};

const softDelete = async (id: string) => {
  if (!confirm('Удалить продукт?')) return;
  try {
    await client.delete(`/products/admin/soft/${id}`);
    await loadData();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  }
};

const restore = async (id: string) => {
  try {
    await client.post(`/products/admin/restore/${id}`);
    await loadData();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  }
};

const handleProductImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" fill="%23e8dff5"><rect width="300" height="180"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="40">🥐</text></svg>',
    );
};

const handlePreviewImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.style.display = 'none';
};

onMounted(() => {
  loadData();
  if (productModalRef.value) modalInstance = new Modal(productModalRef.value);
});
</script>

<style scoped>
.sub-nav-btn {
  border-radius: 16px;
  border: 2px solid #c4b5e3;
  color: #4a3f6b;
  background-color: transparent;
}
.sub-nav-btn:hover {
  background-color: #e8dff5;
}
.add-new-btn {
  background-color: #4a3f6b;
  color: #fff;
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  border: none;
}
.add-new-btn:hover {
  background-color: #5c4f82;
}
.product-admin-card {
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #e8dff5;
  transition: all 0.3s;
}
.product-admin-card:hover {
  border-color: #c4b5e3;
  box-shadow: 0 8px 24px rgba(74, 63, 107, 0.15);
}
.product-admin-card.deleted {
  opacity: 0.6;
}
.category-badge {
  background-color: #e8dff5;
  color: #4a3f6b;
}
.edit-btn {
  background-color: #e8dff5;
  color: #4a3f6b;
  border: none;
  border-radius: 8px;
}
.edit-btn:hover {
  background-color: #c4b5e3;
}
.delete-btn {
  background-color: #fde8e8;
  color: #e74c3c;
  border: none;
  border-radius: 8px;
}
.delete-btn:hover {
  background-color: #f5c6cb;
}
.restore-btn {
  background-color: #d4edda;
  color: #27ae60;
  border: none;
  border-radius: 8px;
}
.restore-btn:hover {
  background-color: #c3e6cb;
}
.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 16px 40px rgba(74, 63, 107, 0.25);
}
</style>
