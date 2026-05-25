<!-- src/views/client/HomeView.vue -->
<template>
  <div class="container">
    <!-- Hero секция -->
    <div class="bg-dark text-white rounded-3 p-5 mb-4">
      <div class="row align-items-center">
        <div class="col-md-6">
          <h1 class="display-4 fw-bold">TechStore</h1>
          <p class="lead">
            Техника от ведущих мировых брендов с гарантией качества
          </p>
          <router-link to="/catalog" class="btn btn-warning btn-lg">
            Перейти в каталог
          </router-link>
        </div>
        <div class="col-md-6 text-center">
          <span style="font-size: 120px">⚡</span>
        </div>
      </div>
    </div>

    <!-- Категории -->
    <h3 class="mb-3">Популярные категории</h3>
    <div class="row mb-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="col-md-3 mb-3"
      >
        <div
          class="card h-100 home-link-card"
          role="button"
          tabindex="0"
          @click="goToCatalog(category.id)"
          @keyup.enter="goToCatalog(category.id)"
          @keyup.space.prevent="goToCatalog(category.id)"
        >
          <img
            :src="getImageUrl(category.avatar)"
            class="card-img-top p-3"
            style="height: 150px; object-fit: contain"
            :alt="category.name"
          />
          <div class="card-body text-center">
            <h6 class="card-title">{{ category.name }}</h6>
            <button
              class="btn btn-outline-warning btn-sm"
              @click.stop="goToCatalog(category.id)"
            >
              Смотреть
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Бренды -->
    <h3 class="mb-3">Популярные бренды</h3>
    <div class="row">
      <div
        v-for="brand in brands.slice(0, 6)"
        :key="brand.id"
        class="col-md-2 col-4 mb-3"
      >
        <div
          class="card h-100 home-link-card"
          role="button"
          tabindex="0"
          @click="goToCatalog(undefined, brand.id)"
          @keyup.enter="goToCatalog(undefined, brand.id)"
          @keyup.space.prevent="goToCatalog(undefined, brand.id)"
        >
          <div class="card-body text-center">
            <h6 class="card-title">{{ brand.name }}</h6>
            <button
              class="btn btn-outline-warning btn-sm"
              @click.stop="goToCatalog(undefined, brand.id)"
            >
              Смотреть
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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { getImageUrl } = useImageUrl();

interface Category {
  id: number;
  name: string;
  avatar: string;
}

interface Brand {
  id: number;
  name: string;
}

const categories = ref<Category[]>([]);
const brands = ref<Brand[]>([]);

const loadData = async () => {
  try {
    const res = await client.get('/products/all-relations');
    categories.value = res.data.productsCategory?.slice(0, 8) || [];
    brands.value = res.data.producers || [];
  } catch (err) {
    console.error(err);
  }
};

const goToCatalog = (categoryId?: number, brandId?: number) => {
  if (categoryId) {
    router.push({ path: '/catalog', query: { categoryId } });
  } else if (brandId) {
    router.push({ path: '/catalog', query: { brandId } });
  } else {
    router.push('/catalog');
  }
};

onMounted(loadData);
</script>

<style scoped>
.home-link-card {
  cursor: pointer;
}

.home-link-card:focus-visible {
  outline: 3px solid rgba(255, 193, 7, 0.5);
  outline-offset: 2px;
}
</style>
