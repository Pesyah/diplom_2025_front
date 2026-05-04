<!-- src/views/client/CatalogView.vue -->
<template>
  <div class="container">
    <h2 class="mb-4">Каталог товаров</h2>

    <div class="row">
      <!-- Боковая панель с фильтрами -->
      <div class="col-md-3">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h5 class="mb-3">Фильтры</h5>

            <!-- Поиск -->
            <div class="mb-3">
              <input
                v-model="search"
                type="text"
                class="form-control"
                placeholder="Поиск..."
                @input="debouncedSearch"
              />
            </div>

            <!-- Бренды -->
            <div class="mb-3">
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <strong>Бренды</strong>
                <button
                  v-if="selectedBrands.length > 0"
                  class="btn btn-link btn-sm text-decoration-none p-0"
                  @click="clearBrands"
                >
                  очистить
                </button>
              </div>
              <div style="max-height: 200px; overflow-y: auto">
                <div v-for="brand in brands" :key="brand.id" class="form-check">
                  <input
                    :id="`brand-${brand.id}`"
                    type="checkbox"
                    class="form-check-input"
                    :value="brand.id"
                    v-model="selectedBrands"
                    @change="onFilterChange"
                  />
                  <label
                    :for="`brand-${brand.id}`"
                    class="form-check-label small"
                  >
                    {{ brand.name }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Категории -->
            <div class="mb-3">
              <div
                class="d-flex justify-content-between align-items-center mb-2"
              >
                <strong>Категории</strong>
                <button
                  v-if="selectedCategories.length > 0"
                  class="btn btn-link btn-sm text-decoration-none p-0"
                  @click="clearCategories"
                >
                  очистить
                </button>
              </div>
              <div style="max-height: 200px; overflow-y: auto">
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
                  <label
                    :for="`cat-${category.id}`"
                    class="form-check-label small"
                  >
                    {{ category.name }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Сброс -->
            <button
              v-if="hasActiveFilters"
              @click="resetAllFilters"
              class="btn btn-outline-secondary btn-sm w-100"
            >
              Сбросить все
            </button>
          </div>
        </div>
      </div>

      <!-- Сетка продуктов -->
      <div class="col-md-9">
        <!-- Сортировка и количество -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <p class="text-muted mb-0">Найдено: {{ totalProducts }} товаров</p>
          <select
            v-model="limit"
            class="form-select w-auto"
            @change="onFilterChange"
          >
            <option :value="12">12 на странице</option>
            <option :value="24">24 на странице</option>
            <option :value="48">48 на странице</option>
          </select>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-warning"></div>
        </div>

        <div
          v-else-if="products.length === 0"
          class="text-center py-5 text-muted"
        >
          <h4>Товары не найдены</h4>
          <p>Попробуйте изменить параметры поиска</p>
        </div>

        <div v-else class="row">
          <div
            v-for="product in products"
            :key="product.id"
            class="col-md-4 mb-4"
          >
            <div class="card h-100">
              <img
                v-if="product.images?.[0]"
                :src="getImageUrl(product.images[0])"
                class="card-img-top"
                style="height: 200px; object-fit: cover"
                :alt="product.name"
              />
              <div
                v-else
                class="bg-light d-flex align-items-center justify-content-center"
                style="height: 200px"
              >
                <span class="text-muted">Нет фото</span>
              </div>
              <div class="card-body d-flex flex-column">
                <h6 class="card-title">{{ product.name }}</h6>
                <p class="card-text text-muted small flex-grow-1">
                  {{ product.description?.substring(0, 80) }}...
                </p>
                <div class="d-flex justify-content-between align-items-center">
                  <p class="card-text text-warning fw-bold fs-5 mb-0">
                    {{ formatPrice(product.price) }} ₽
                  </p>
                  <button
                    @click="addToCart(product)"
                    class="btn btn-warning btn-sm"
                  >
                    🛒
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
          <nav>
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)">
                  ←
                </button>
              </li>
              <li
                v-for="page in visiblePages"
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
import { useCartStore } from '@/stores/cartStore';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { getImageUrl } = useImageUrl();
const cartStore = useCartStore();

const products = ref<any[]>([]);
const brands = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(false);
const search = ref('');
const selectedBrands = ref<string[]>([]);
const selectedCategories = ref<string[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalProducts = ref(0);
const limit = ref(24);

let searchTimeout: any;

const hasActiveFilters = computed(() => {
  return (
    search.value ||
    selectedBrands.value.length > 0 ||
    selectedCategories.value.length > 0
  );
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Синхронизация фильтров с URL
const syncFromUrl = () => {
  const query = route.query;

  search.value = (query.search as string) || '';
  currentPage.value = Number(query.page) || 1;
  limit.value = Number(query.limit) || 24;

  // Восстанавливаем бренды
  if (query.brandId) {
    selectedBrands.value = Array.isArray(query.brandId)
      ? (query.brandId as string[])
      : [query.brandId as string];
  } else {
    selectedBrands.value = [];
  }

  // Восстанавливаем категории
  if (query.categoryId) {
    selectedCategories.value = Array.isArray(query.categoryId)
      ? (query.categoryId as string[])
      : [query.categoryId as string];
  } else {
    selectedCategories.value = [];
  }
};

const syncToUrl = () => {
  const query: any = {};

  if (search.value) query.search = search.value;
  if (currentPage.value > 1) query.page = currentPage.value;
  if (limit.value !== 24) query.limit = limit.value;

  if (selectedBrands.value.length > 0) {
    query.brandId = selectedBrands.value;
  }

  if (selectedCategories.value.length > 0) {
    query.categoryId = selectedCategories.value;
  }

  router.replace({ query });
};

const loadRelations = async () => {
  try {
    const res = await client.get('/products/all-relations');
    brands.value = res.data.producers || [];
    categories.value = res.data.productsCategory || [];
  } catch (err) {
    console.error(err);
  }
};

const loadProducts = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      limit: limit.value,
    };

    if (search.value) params.search = search.value;

    // Передаем как массивы, qs сам преобразует
    if (selectedBrands.value.length > 0) {
      params.brandId = selectedBrands.value;
    }

    if (selectedCategories.value.length > 0) {
      params.categoryId = selectedCategories.value;
    }

    console.log('Request URL params:', params);

    const res = await client.get('/products/by-query', { params });
    products.value = res.data.data || [];
    totalPages.value = res.data.totalPages || 1;
    totalProducts.value = res.data.total || 0;
  } catch (err) {
    console.error(err);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const addToCart = (product: any) => {
  cartStore.addItem({
    productId: product.id,
    name: product.name,
    price: product.price,
    count: 1,
    photo: product.images?.[0] || '',
    brand: product.producer?.name || '',
  });
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

// Следим за изменениями фильтров и обновляем URL
watch(
  [search, selectedBrands, selectedCategories, currentPage, limit],
  () => {
    syncToUrl();
  },
  { deep: true },
);

onMounted(async () => {
  await loadRelations();

  // Сначала синхронизируем состояние из URL
  syncFromUrl();

  // Затем загружаем продукты
  await loadProducts();
});
</script>
