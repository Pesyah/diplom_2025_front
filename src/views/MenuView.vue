<template>
  <div>
    <h1 class="mb-4">Меню пицц</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else class="row g-4">
      <div v-for="pizza in pizzas" :key="pizza.id" class="col-md-6 col-lg-4">
        <div
          class="card h-100 shadow-sm"
          style="cursor: pointer"
          @click="goToDetail(pizza.id)"
        >
          <img
            v-if="pizza.photo"
            :src="getImageUrl(pizza.photo)"
            class="card-img-top"
            style="height: 200px; object-fit: cover"
          />
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h5 class="card-title mb-0">{{ pizza.name }}</h5>
              <span class="badge bg-secondary">{{
                pizza.pizzaType?.name
              }}</span>
            </div>
            <p class="card-text text-muted small">
              {{ truncateDescription(pizza.description, 80) }}
            </p>
            <div class="mt-3">
              <span class="text-primary fw-bold fs-5">
                {{ getPriceRange(pizza) }}
              </span>
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
import { useRouter } from 'vue-router';

const router = useRouter();
const pizzas = ref([]);
const loading = ref(true);

const truncateDescription = (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

const getPriceRange = (pizza: any) => {
  if (!pizza.pizzaSizeRelation?.length) return '---';
  const prices = pizza.pizzaSizeRelation.map((r: any) => r.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) return `${min} ₽`;
  return `от ${min} до ${max} ₽`;
};

const goToDetail = (id: string) => {
  router.push(`/pizza/${id}`);
};

const { getImageUrl } = useImageUrl();
onMounted(async () => {
  try {
    const res = await client.get('/pizza/all-pizza');
    pizzas.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>
