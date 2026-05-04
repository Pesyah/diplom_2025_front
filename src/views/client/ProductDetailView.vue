<!-- src/views/client/ProductDetailView.vue -->
<template>
  <div class="container">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-warning"></div>
    </div>

    <div v-else-if="product" class="row">
      <!-- Изображения -->
      <div class="col-md-6">
        <div v-if="product.images?.length" class="mb-3">
          <img
            :src="getImageUrl(product.images[0])"
            :alt="product.name"
            class="w-100 rounded shadow-sm"
            style="max-height: 500px; object-fit: contain; background: #f8f9fa"
          />
        </div>
        <div
          v-else
          class="bg-light rounded d-flex align-items-center justify-content-center"
          style="height: 400px"
        >
          <span class="text-muted fs-1">📦</span>
        </div>
      </div>

      <!-- Информация -->
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/">Главная</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link to="/catalog">Каталог</router-link>
            </li>
            <li class="breadcrumb-item active">{{ product.name }}</li>
          </ol>
        </nav>

        <h1 class="mb-2">{{ product.name }}</h1>

        <p v-if="product.producer" class="text-muted">
          Бренд: <strong>{{ product.producer.name }}</strong>
        </p>

        <div class="mb-3">
          <span class="text-warning fs-2 fw-bold"
            >{{ formatPrice(product.price) }} ₽</span
          >
        </div>

        <div class="mb-3">
          <span
            :class="product.stockQuantity > 0 ? 'text-success' : 'text-danger'"
          >
            {{
              product.stockQuantity > 0
                ? `В наличии: ${product.stockQuantity} шт.`
                : 'Нет в наличии'
            }}
          </span>
        </div>

        <div class="mb-4">
          <h5>Описание</h5>
          <p class="text-muted">{{ product.description }}</p>
        </div>

        <div v-if="product.categories?.length" class="mb-4">
          <h6>Категории:</h6>
          <span
            v-for="category in product.categories"
            :key="category.id"
            class="badge bg-secondary me-1"
          >
            {{ category.name }}
          </span>
        </div>

        <button
          @click="addToCart"
          class="btn btn-warning btn-lg"
          :disabled="product.stockQuantity <= 0"
        >
          🛒 Добавить в корзину
        </button>
      </div>
    </div>

    <div v-else class="text-center py-5">
      <h4>Товар не найден</h4>
      <router-link to="/catalog" class="btn btn-warning mt-3"
        >В каталог</router-link
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { useImageUrl } from '@/composables/useImageUrl';
import { useCartStore } from '@/stores/cartStore';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const { getImageUrl } = useImageUrl();
const cartStore = useCartStore();

const product = ref<any>(null);
const loading = ref(true);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU').format(price);
};

const addToCart = () => {
  if (!product.value) return;

  cartStore.addItem({
    productId: product.value.id,
    name: product.value.name,
    price: product.value.price,
    count: 1,
    photo: product.value.images?.[0] || '',
    brand: product.value.producer?.name || '',
  });

  alert('Товар добавлен в корзину!');
};

onMounted(async () => {
  try {
    const id = route.params.id as string;
    const res = await client.get(`/products/by-id/${id}`);
    product.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
