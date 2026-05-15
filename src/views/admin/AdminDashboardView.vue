<template>
  <section class="page-band">
    <div class="container-xxl">
      <div class="toolbar-panel">
        <div>
          <span class="eyebrow">Администрирование</span>
          <h1>Пульт библиотеки</h1>
        </div>
        <button class="btn btn-ghost" type="button" @click="loadStats">
          Обновить
        </button>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <section class="admin-hero-panel">
        <div>
          <span class="eyebrow">Рабочий центр</span>
          <h2>Управление вынесено по разделам, чтобы не тонуть в одной странице</h2>
          <p>
            Администратор не покупает и не арендует книги. Здесь только фонд,
            пользователи, авторы и контроль сделок.
          </p>
        </div>
        <div class="admin-stat-grid">
          <div class="admin-stat-card">
            <span>Авторы</span>
            <strong>{{ stats.authors }}</strong>
          </div>
          <div class="admin-stat-card">
            <span>Читатели</span>
            <strong>{{ stats.users }}</strong>
          </div>
          <div class="admin-stat-card">
            <span>Аренды</span>
            <strong>{{ stats.rents }}</strong>
          </div>
          <div class="admin-stat-card">
            <span>Продажи</span>
            <strong>{{ stats.sales }}</strong>
          </div>
        </div>
      </section>

      <div class="admin-section-grid">
        <router-link class="admin-section-card" to="/admin/users">
          <span class="eyebrow">Пользователи</span>
          <h2>Читатели и администраторы</h2>
          <p>Поиск пользователей и создание нового администратора.</p>
        </router-link>

        <router-link class="admin-section-card" to="/admin/authors">
          <span class="eyebrow">Авторы</span>
          <h2>Справочник авторов</h2>
          <p>Создание, редактирование и удаление авторов.</p>
        </router-link>

        <router-link class="admin-section-card" to="/admin/deals">
          <span class="eyebrow">Сделки</span>
          <h2>Аренды и продажи</h2>
          <p>Отдельные таблицы с кодами объявлений для расписок.</p>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { authApi, booksApi, rentApi, saleApi } from '@/api/library';
import { getApiErrorMessage } from '@/utils/errors';
import { onMounted, ref } from 'vue';

const error = ref('');
const stats = ref({
  authors: 0,
  users: 0,
  rents: 0,
  sales: 0,
});

const loadStats = async () => {
  error.value = '';

  try {
    const [authors, users, rents, sales] = await Promise.all([
      booksApi.authors(),
      authApi.usersByQuery(''),
      rentApi.adminAll(),
      saleApi.adminAll(),
    ]);
    stats.value = {
      authors: authors.length,
      users: users.length,
      rents: rents.length,
      sales: sales.length,
    };
  } catch (loadError) {
    error.value = getApiErrorMessage(loadError, 'Не удалось загрузить статистику');
  }
};

onMounted(loadStats);
</script>
