<!-- src/views/admin/AdminBrandDetailView.vue -->
<template>
  <div class="container">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-warning"></div>
    </div>

    <div v-else-if="brand">
      <!-- Информация о бренде -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3 text-center">
              <img
                :src="getImageUrl(brand.avatar)"
                :alt="brand.name"
                class="rounded mb-3"
                style="width: 150px; height: 150px; object-fit: cover"
              />
            </div>
            <div class="col-md-9">
              <h2>{{ brand.name }}</h2>
              <p class="text-muted">{{ brand.description }}</p>
              <div class="btn-group">
                <router-link
                  :to="`/admin/brands/${brand.id}/edit`"
                  class="btn btn-warning"
                >
                  ✏️ Редактировать
                </router-link>
                <button @click="deleteBrand" class="btn btn-danger">
                  🗑️ Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Категории бренда -->
      <div v-if="categories.length > 0" class="card shadow-sm mb-4">
        <div class="card-body">
          <h4 class="mb-3">Категории</h4>
          <div class="d-flex flex-wrap gap-2">
            <span
              v-for="category in categories"
              :key="category.id"
              class="badge bg-secondary p-2"
            >
              {{ category.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Продукты бренда -->
      <div class="card shadow-sm">
        <div class="card-body">
          <h4 class="mb-3">Продукты бренда ({{ productsTotal }})</h4>

          <div v-if="products.length === 0" class="text-muted text-center py-3">
            Нет продуктов
          </div>

          <div v-else>
            <div class="row">
              <div
                v-for="product in products"
                :key="product.id"
                class="col-md-4 mb-3"
              >
                <div class="card h-100">
                  <img
                    v-if="product.images?.[0]"
                    :src="getImageUrl(product.images[0])"
                    class="card-img-top"
                    style="height: 200px; object-fit: cover"
                  />
                  <div
                    v-else
                    class="bg-light d-flex align-items-center justify-content-center"
                    style="height: 200px"
                  >
                    <span class="text-muted">📦</span>
                  </div>
                  <div class="card-body">
                    <h6 class="card-title">{{ product.name }}</h6>
                    <p class="card-text text-warning fw-bold">
                      {{ formatPrice(product.price) }} ₽
                    </p>
                    <small class="text-muted">
                      В наличии: {{ product.stockQuantity }} шт.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Пагинация для продуктов -->
            <div
              v-if="productsTotalPages > 1"
              class="d-flex justify-content-center mt-3"
            >
              <nav>
                <ul class="pagination">
                  <li
                    class="page-item"
                    :class="{ disabled: productsPage === 1 }"
                  >
                    <button
                      class="page-link"
                      @click="changeProductsPage(productsPage - 1)"
                    >
                      ←
                    </button>
                  </li>
                  <li
                    v-for="page in productsTotalPages"
                    :key="page"
                    class="page-item"
                    :class="{ active: page === productsPage }"
                  >
                    <button class="page-link" @click="changeProductsPage(page)">
                      {{ page }}
                    </button>
                  </li>
                  <li
                    class="page-item"
                    :class="{ disabled: productsPage === productsTotalPages }"
                  >
                    <button
                      class="page-link"
                      @click="changeProductsPage(productsPage + 1)"
                    >
                      →
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { getImageUrl } = useImageUrl();

const brand = ref<any>(null);
const categories = ref<any[]>([]);
const products = ref<any[]>([]);
const loading = ref(true);
const productsPage = ref(1);
const productsTotal = ref(0);
const productsTotalPages = ref(0);
const productsLimit = 9;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const loadBrandDetail = async () => {
  loading.value = true;
  try {
    const res = await client.get(
      `/admin/brands/${route.params.id}?page=${productsPage.value}&limit=${productsLimit}`,
    );
    console.log('Brand detail response:', res.data);

    // API возвращает { brand: {...}, categories: [...], products: { data: [...], total, page, limit, totalPages } }
    brand.value = res.data.brand;
    categories.value = res.data.categories || [];

    const productsData = res.data.products;
    products.value = productsData.data || [];
    productsTotal.value = productsData.total || 0;
    productsTotalPages.value = productsData.totalPages || 0;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const changeProductsPage = (page: number) => {
  if (page >= 1 && page <= productsTotalPages.value) {
    productsPage.value = page;
    loadBrandDetail();
  }
};

const deleteBrand = async () => {
  if (!confirm('Удалить бренд?')) return;
  try {
    await client.delete('/admin/brands', { data: { id: brand.value.id } });
    router.push('/admin/brands');
  } catch (err) {
    alert('Ошибка удаления');
  }
};

onMounted(loadBrandDetail);
</script>
