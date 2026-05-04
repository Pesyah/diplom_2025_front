<!-- src/views/admin/AdminCategoriesView.vue -->
<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>📁 Управление категориями</h2>
      <router-link to="/admin/categories/create" class="btn btn-warning">
        + Создать категорию
      </router-link>
    </div>

    <!-- Поиск -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="input-group">
          <input
            v-model="search"
            type="text"
            class="form-control"
            placeholder="Поиск категорий..."
            @input="debouncedSearch"
          />
          <button class="btn btn-outline-secondary" @click="resetSearch">
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица -->
    <div class="card shadow-sm">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-warning"></div>
        </div>

        <div
          v-else-if="categories.length === 0"
          class="text-center py-4 text-muted"
        >
          Категории не найдены
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Иконка</th>
                <th>Название</th>
                <th>Описание</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in categories" :key="category.id">
                <td>{{ category.id }}</td>
                <td>
                  <img
                    :src="getImageUrl(category.avatar)"
                    :alt="category.name"
                    class="rounded"
                    style="width: 50px; height: 50px; object-fit: cover"
                  />
                </td>
                <td>
                  <span class="fw-bold">{{ category.name }}</span>
                </td>
                <td>
                  <small class="text-muted"
                    >{{ category.description?.substring(0, 100) }}...</small
                  >
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <router-link
                      :to="`/admin/categories/${category.id}/edit`"
                      class="btn btn-outline-warning"
                    >
                      ✏️
                    </router-link>
                    <button
                      @click="deleteCategory(category.id)"
                      class="btn btn-outline-danger"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="d-flex justify-content-center mt-3">
          <nav>
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)">
                  ←
                </button>
              </li>
              <li
                v-for="page in totalPages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button class="page-link" @click="changePage(page)">
                  {{ page }}
                </button>
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <button class="page-link" @click="changePage(currentPage + 1)">
                  →
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { onMounted, ref } from 'vue';

const { getImageUrl } = useImageUrl();

interface Category {
  id: number;
  name: string;
  description: string;
  avatar: string;
}

const categories = ref<Category[]>([]);
const loading = ref(false);
const search = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;

let searchTimeout: any;

const loadCategories = async () => {
  loading.value = true;
  try {
    const res = await client.get('/admin/categories', {
      params: {
        page: currentPage.value,
        limit,
        search: search.value || undefined,
      },
    });
    categories.value = res.data.data;
    totalPages.value = res.data.totalPages || 1;
  } catch (err) {
    console.error('Error loading categories:', err);
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadCategories();
  }, 300);
};

const resetSearch = () => {
  search.value = '';
  currentPage.value = 1;
  loadCategories();
};

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadCategories();
  }
};

const deleteCategory = async (id: number) => {
  if (!confirm('Удалить категорию?')) return;
  try {
    await client.delete('/admin/categories', { data: { id } });
    loadCategories();
  } catch (err) {
    alert('Ошибка при удалении категории');
  }
};

onMounted(loadCategories);
</script>
