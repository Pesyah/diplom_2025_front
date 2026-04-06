<template>
  <div>
    <h2 class="mb-4">Панель управления</h2>
    <div class="row">
      <div class="col-md-3 mb-3">
        <div
          class="card text-white bg-primary h-100"
          style="cursor: pointer"
          @click="goTo('/admin/pizzas')"
        >
          <div class="card-body">
            <h5 class="card-title">Пиццы</h5>
            <p class="card-text fs-2">{{ stats.pizzas }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div
          class="card text-white bg-success h-100"
          style="cursor: pointer"
          @click="goTo('/admin/sizes')"
        >
          <div class="card-body">
            <h5 class="card-title">Размеры</h5>
            <p class="card-text fs-2">{{ stats.sizes }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div
          class="card text-white bg-dark h-100"
          style="cursor: pointer"
          @click="goTo('/admin/relations/size')"
        >
          <div class="card-body">
            <h5 class="card-title">💰 Цены</h5>
            <p class="card-text fs-2">Пицца+Размер</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div
          class="card text-white bg-warning h-100"
          style="cursor: pointer"
          @click="goTo('/admin/additives')"
        >
          <div class="card-body">
            <h5 class="card-title">Добавки</h5>
            <p class="card-text fs-2">{{ stats.additives }}</p>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div
          class="card text-white bg-secondary h-100"
          style="cursor: pointer"
          @click="goTo('/admin/relations/additive')"
        >
          <div class="card-body">
            <h5 class="card-title">➕ Добавки</h5>
            <p class="card-text fs-2">К размерам</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div
          class="card text-white bg-info h-100"
          style="cursor: pointer"
          @click="goTo('/admin/orders')"
        >
          <div class="card-body">
            <h5 class="card-title">Заказы</h5>
            <p class="card-text fs-2">{{ stats.orders }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import client from '@/api/client';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const stats = ref({ pizzas: 0, sizes: 0, additives: 0, orders: 0 });

const goTo = (path: string) => {
  router.push(path);
};

onMounted(async () => {
  const res = await client.get('/pizza-admin/all-relations');
  stats.value.pizzas = res.data.pizza.length;
  stats.value.sizes = res.data.pizzaSize.length;
  stats.value.additives = res.data.pizzaAdditive.length;

  const orders = await client.get('/orders/admin/all');
  stats.value.orders = orders.data.total;
});
</script>
