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
        <div class="card h-100">
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
              @click="goToCatalog(category.id)"
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
        <div class="card h-100">
          <div class="card-body text-center">
            <h6 class="card-title mb-0">{{ brand.name }}</h6>
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

const categories = ref<any[]>([]);
const brands = ref<any[]>([]);

const loadData = async () => {
  try {
    const res = await client.get('/products/all-relations');
    categories.value = res.data.productsCategory?.slice(0, 8) || [];
    brands.value = res.data.producers || [];
  } catch (err) {
    console.error(err);
  }
};

const goToCatalog = (categoryId?: number) => {
  if (categoryId) {
    router.push(`/catalog?categoryId=${categoryId}`);
  } else {
    router.push('/catalog');
  }
};

onMounted(loadData);
</script>
