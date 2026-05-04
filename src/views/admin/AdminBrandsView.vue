<!-- src/views/admin/AdminBrandsView.vue -->
<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>🏷️ Управление брендами</h2>
      <router-link to="/admin/brands/create" class="btn btn-warning">
        + Создать бренд
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
            placeholder="Поиск брендов..."
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
          v-else-if="brands.length === 0"
          class="text-center py-4 text-muted"
        >
          Бренды не найдены
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Аватар</th>
                <th>Название</th>
                <th>Описание</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="brand in brands" :key="brand.id">
                <td>{{ brand.id }}</td>
                <td>
                  <img
                    :src="getImageUrl(brand.avatar)"
                    :alt="brand.name"
                    class="rounded"
                    style="width: 50px; height: 50px; object-fit: cover"
                  />
                </td>
                <td>
                  <router-link
                    :to="`/admin/brands/${brand.id}`"
                    class="text-decoration-none"
                  >
                    {{ brand.name }}
                  </router-link>
                </td>
                <td>
                  <small class="text-muted"
                    >{{ brand.description?.substring(0, 100) }}...</small
                  >
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <router-link
                      :to="`/admin/brands/${brand.id}`"
                      class="btn btn-outline-info"
                    >
                      👁️
                    </router-link>
                    <router-link
                      :to="`/admin/brands/${brand.id}/edit`"
                      class="btn btn-outline-warning"
                    >
                      ✏️
                    </router-link>
                    <button
                      @click="deleteBrand(brand.id)"
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

interface Brand {
  id: number;
  name: string;
  description: string;
  avatar: string;
}

const brands = ref<Brand[]>([]);
const loading = ref(false);
const search = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 10;

let searchTimeout: any;

const loadBrands = async () => {
  loading.value = true;
  try {
    const res = await client.get('/admin/brands', {
      params: {
        page: currentPage.value,
        limit,
        search: search.value || undefined,
      },
    });
    brands.value = res.data.data;
    totalPages.value = res.data.totalPages || 1;
  } catch (err) {
    console.error('Error loading brands:', err);
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadBrands();
  }, 300);
};

const resetSearch = () => {
  search.value = '';
  currentPage.value = 1;
  loadBrands();
};

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadBrands();
  }
};

const deleteBrand = async (id: number) => {
  if (!confirm('Удалить бренд?')) return;
  try {
    await client.delete('/admin/brands', { data: { id } });
    loadBrands();
  } catch (err) {
    alert('Ошибка при удалении');
  }
};

onMounted(loadBrands);
</script>
