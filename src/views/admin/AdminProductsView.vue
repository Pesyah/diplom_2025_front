<!-- src/views/admin/AdminProductsView.vue -->
<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>📦 Управление продуктами</h2>
      <router-link to="/admin/products/create" class="btn btn-warning">
        + Создать продукт
      </router-link>
    </div>

    <!-- Фильтры -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <!-- Поисковая строка -->
        <div class="mb-3">
          <input
            v-model="search"
            type="text"
            class="form-control"
            placeholder="Поиск продуктов..."
            @input="debouncedSearch"
          />
        </div>

        <!-- Фильтры с чекбоксами -->
        <div class="row">
          <div class="col-md-6">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong>Бренды</strong>
              <button
                v-if="selectedBrands.length > 0"
                class="btn btn-link btn-sm text-decoration-none"
                @click="clearBrands"
              >
                Очистить
              </button>
            </div>
            <div
              class="border rounded p-2"
              style="max-height: 200px; overflow-y: auto"
            >
              <div v-for="brand in brands" :key="brand.id" class="form-check">
                <input
                  :id="`brand-${brand.id}`"
                  type="checkbox"
                  class="form-check-input"
                  :value="brand.id"
                  v-model="selectedBrands"
                  @change="onFilterChange"
                />
                <label :for="`brand-${brand.id}`" class="form-check-label">
                  {{ brand.name }}
                </label>
              </div>
              <div v-if="brands.length === 0" class="text-muted small">
                Загрузка...
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <strong>Категории</strong>
              <button
                v-if="selectedCategories.length > 0"
                class="btn btn-link btn-sm text-decoration-none"
                @click="clearCategories"
              >
                Очистить
              </button>
            </div>
            <div
              class="border rounded p-2"
              style="max-height: 200px; overflow-y: auto"
            >
              <div
                v-for="category in categories"
                :key="category.id"
                class="form-check"
              >
                <input
                  :id="`cat-${category.id}`"
                  type="checkbox"
                  class="form-check-input"
                  :value="category.id"
                  v-model="selectedCategories"
                  @change="onFilterChange"
                />
                <label :for="`cat-${category.id}`" class="form-check-label">
                  {{ category.name }}
                </label>
              </div>
              <div v-if="categories.length === 0" class="text-muted small">
                Загрузка...
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка сброса -->
        <div v-if="hasActiveFilters" class="mt-3">
          <button
            @click="resetAllFilters"
            class="btn btn-outline-secondary btn-sm"
          >
            ✕ Сбросить все фильтры
          </button>
        </div>
      </div>
    </div>

    <!-- Таблица продуктов -->
    <div class="card shadow-sm">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border text-warning"></div>
        </div>

        <div
          v-else-if="products.length === 0"
          class="text-center py-4 text-muted"
        >
          Продукты не найдены
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Фото</th>
                <th>Название</th>
                <th>Бренд</th>
                <th>Цена</th>
                <th>Кол-во</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td>
                  <img
                    v-if="product.images?.[0]"
                    :src="getImageUrl(product.images[0])"
                    :alt="product.name"
                    class="rounded"
                    style="width: 60px; height: 60px; object-fit: cover"
                  />
                  <div
                    v-else
                    class="bg-light rounded d-flex align-items-center justify-content-center"
                    style="width: 60px; height: 60px"
                  >
                    📦
                  </div>
                </td>
                <td>
                  <span class="fw-bold">{{ product.name }}</span>
                  <br />
                  <small class="text-muted"
                    >{{ product.description?.substring(0, 80) }}...</small
                  >
                </td>
                <td>{{ product.producers?.name || '—' }}</td>
                <td>
                  <span class="text-warning fw-bold"
                    >{{ formatPrice(product.price) }} ₽</span
                  >
                </td>
                <td>
                  <span
                    class="badge"
                    :class="getStockBadgeClass(product.stockQuantity)"
                  >
                    {{ getStockLabel(product.stockQuantity) }}
                  </span>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <router-link
                      :to="`/admin/products/${product.id}/edit`"
                      class="btn btn-outline-warning"
                    >
                      ✏️
                    </router-link>
                    <button
                      @click="deleteProduct(product.id)"
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
import { computed, onMounted, ref } from 'vue';

const { getImageUrl } = useImageUrl();

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface AdminProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  stockQuantity: number;
  images?: string[] | null;
  producers?: Brand | null;
}

interface ProductQueryParams {
  page: number;
  limit: number;
  search?: string;
  brandId?: number[];
  categoryId?: number[];
}

const products = ref<AdminProduct[]>([]);
const brands = ref<Brand[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(false);
const search = ref('');
const selectedBrands = ref<number[]>([]);
const selectedCategories = ref<number[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const limit = 20;

let searchTimeout: ReturnType<typeof setTimeout> | undefined;

const hasActiveFilters = computed(() => {
  return (
    search.value ||
    selectedBrands.value.length > 0 ||
    selectedCategories.value.length > 0
  );
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

const loadProducts = async () => {
  loading.value = true;
  try {
    const params: ProductQueryParams = {
      page: currentPage.value,
      limit,
    };

    if (search.value) params.search = search.value;

    // Передаем как массивы, paramsSerializer сам преобразует
    if (selectedBrands.value.length > 0) {
      params.brandId = selectedBrands.value;
    }

    if (selectedCategories.value.length > 0) {
      params.categoryId = selectedCategories.value;
    }

    const res = await client.get('/admin/products', { params });
    products.value = res.data.data || [];
    totalPages.value = res.data.totalPages || 1;
  } catch (err) {
    console.error('Error loading products:', err);
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadProducts();
  }, 300);
};

const onFilterChange = () => {
  currentPage.value = 1;
  loadProducts();
};

const clearBrands = () => {
  selectedBrands.value = [];
  currentPage.value = 1;
  loadProducts();
};

const clearCategories = () => {
  selectedCategories.value = [];
  currentPage.value = 1;
  loadProducts();
};

const resetAllFilters = () => {
  search.value = '';
  selectedBrands.value = [];
  selectedCategories.value = [];
  currentPage.value = 1;
  loadProducts();
};

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    loadProducts();
  }
};

const deleteProduct = async (id: string) => {
  if (!confirm('Удалить продукт?')) return;
  try {
    await client.delete('/admin/products', { data: { id } });
    loadProducts();
  } catch (err) {
    alert('Ошибка при удалении продукта');
  }
};

const formatPrice = (price: number | string) => {
  return new Intl.NumberFormat('ru-RU').format(Number(price) || 0);
};

const getStockBadgeClass = (quantity: number) => {
  if (quantity <= 0) return 'bg-danger';
  if (quantity <= 5) return 'bg-warning text-dark';
  return 'bg-success';
};

const getStockLabel = (quantity: number) => {
  if (quantity <= 0) return 'Нет в наличии';
  if (quantity <= 5) return `Мало: ${quantity} шт.`;
  return `${quantity} шт.`;
};

onMounted(() => {
  loadRelations();
  loadProducts();
});
</script>
