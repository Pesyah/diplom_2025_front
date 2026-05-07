<!-- src/views/admin/AdminProductCategoriesView.vue -->
<template>
  <div class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="fw-bold" style="color: #4a3f6b">📂 Категории продуктов</h1>
      <button class="btn add-new-btn" @click="openCreateModal">
        + Новая категория
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="row g-4">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="col-12 col-md-6 col-lg-3"
      >
        <div
          class="card h-100 text-center"
          style="border-radius: 16px; border: 2px solid #e8dff5"
        >
          <div class="card-body">
            <div class="category-icon mb-2">📁</div>
            <h5 class="fw-bold" style="color: #2d2640">{{ cat.name }}</h5>
            <div class="d-flex justify-content-center gap-1 mt-2">
              <button class="btn btn-sm edit-btn" @click="openEditModal(cat)">
                ✏️
              </button>
              <button
                class="btn btn-sm delete-btn"
                @click="deleteCategory(cat.id)"
              >
                🗑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модалка -->
    <div class="modal fade" id="categoryModal" ref="categoryModalRef">
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
              {{ editingCategory ? 'Редактировать' : 'Новая категория' }}
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
              @click="saveCategory"
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
import { Modal } from 'bootstrap';
import { onMounted, ref } from 'vue';

const loading = ref(true);
const error = ref('');
const categories = ref<any[]>([]);
const saving = ref(false);
const editingCategory = ref<any>(null);
const categoryModalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const form = ref({ name: '' });

const loadCategories = async () => {
  loading.value = true;
  try {
    const res = await client.get('/products-category/admin/all');
    categories.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingCategory.value = null;
  form.value = { name: '' };
  modalInstance?.show();
};

const openEditModal = (cat: any) => {
  editingCategory.value = cat;
  form.value = { name: cat.name };
  modalInstance?.show();
};

const saveCategory = async () => {
  saving.value = true;
  try {
    if (editingCategory.value) {
      await client.patch('/products-category/admin', {
        id: editingCategory.value.id,
        ...form.value,
      });
    } else {
      await client.post('/products-category/admin', form.value);
    }
    modalInstance?.hide();
    await loadCategories();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  } finally {
    saving.value = false;
  }
};

const deleteCategory = async (id: number) => {
  if (!confirm('Удалить категорию?')) return;
  try {
    await client.delete(`/products-category/admin/${id}`);
    await loadCategories();
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка';
  }
};

onMounted(() => {
  loadCategories();
  if (categoryModalRef.value) modalInstance = new Modal(categoryModalRef.value);
});
</script>

<style scoped>
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
.category-icon {
  font-size: 2rem;
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
.modal-content {
  border-radius: 16px;
  border: none;
  box-shadow: 0 16px 40px rgba(74, 63, 107, 0.25);
}
</style>
