<template>
  <section class="page-band">
    <div class="container-xxl">
      <div class="toolbar-panel">
        <div>
          <span class="eyebrow">Сделки</span>
          <h1>Аренды и продажи</h1>
        </div>
        <div class="action-row">
          <button class="btn btn-ghost" type="button" @click="loadDeals">Обновить</button>
          <router-link class="btn btn-ghost" to="/admin">К панели</router-link>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <section class="content-panel">
        <div class="section-heading">
          <h2>Все аренды</h2>
          <span class="pill">{{ rents.length }}</span>
        </div>
        <div v-if="loading" class="state-panel">
          <div class="spinner-border"></div>
          <p>Загружаем сделки</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table warm-table">
            <thead>
              <tr>
                <th>Книга</th>
                <th>Код объявления</th>
                <th>Период</th>
                <th>Покупатель</th>
                <th>Владелец</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rent in rents" :key="rent.id">
                <td>{{ rent.books.name }}</td>
                <td>{{ bookListingCode(rent.books) }}</td>
                <td>{{ formatDate(rent.rentStart) }} - {{ formatDate(rent.rentEnd) }}</td>
                <td>{{ formatUserName(rent.buyer) }}</td>
                <td>{{ formatUserName(rent.seller) }}</td>
                <td>{{ rent.isAccepted ? 'подтверждена' : 'ожидает' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="content-panel">
        <div class="section-heading">
          <h2>Все продажи</h2>
          <span class="pill">{{ sales.length }}</span>
        </div>
        <div class="table-responsive">
          <table class="table warm-table">
            <thead>
              <tr>
                <th>Книга</th>
                <th>Код объявления</th>
                <th>Цена</th>
                <th>Покупатель</th>
                <th>Продавец</th>
                <th>Статус</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in sales" :key="sale.id">
                <td>{{ sale.books.name }}</td>
                <td>{{ bookListingCode(sale.books) }}</td>
                <td>{{ formatMoney(sale.price) }}</td>
                <td>{{ formatUserName(sale.buyer) }}</td>
                <td>{{ formatUserName(sale.seller) }}</td>
                <td>{{ sale.isAccepted ? 'подтверждена' : 'ожидает подтверждения' }}</td>
                <td>{{ formatDate(sale.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { rentApi, saleApi } from '@/api/library';
import type { Rent, Sale } from '@/types/library';
import { getApiErrorMessage } from '@/utils/errors';
import {
  bookListingCode,
  formatDate,
  formatMoney,
  formatUserName,
} from '@/utils/format';
import { onMounted, ref } from 'vue';

const loading = ref(false);
const error = ref('');
const rents = ref<Rent[]>([]);
const sales = ref<Sale[]>([]);

const loadDeals = async () => {
  loading.value = true;
  error.value = '';

  try {
    const [rentsData, salesData] = await Promise.all([
      rentApi.adminAll(),
      saleApi.adminAll(),
    ]);
    rents.value = rentsData;
    sales.value = salesData;
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, 'Не удалось загрузить сделки');
  } finally {
    loading.value = false;
  }
};

onMounted(loadDeals);
</script>
