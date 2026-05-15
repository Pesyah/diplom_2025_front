<template>
  <div class="app-shell" :class="{ 'admin-shell': isAdmin }">
    <nav class="library-navbar navbar navbar-expand-lg sticky-top">
      <div class="container-xxl">
        <router-link class="brand-mark navbar-brand" :to="homeRoute">
          <span class="brand-icon" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <span>
            <strong>{{ isAdmin ? 'Пульт библиотеки' : 'Теплая полка' }}</strong>
            <small>
              {{ isAdmin ? 'управление фондом и сделками' : 'книги, аренда и обмен' }}
            </small>
          </span>
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavigation"
          aria-controls="mainNavigation"
          aria-expanded="false"
          aria-label="Открыть меню"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="mainNavigation" class="collapse navbar-collapse">
          <ul class="navbar-nav mx-auto nav-pills-soft">
            <template v-if="isAdmin">
              <li class="nav-item">
                <router-link class="nav-link" to="/admin">Панель</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/admin/users">Пользователи</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/admin/authors">Авторы</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/admin/deals">Сделки</router-link>
              </li>
            </template>

            <template v-else>
              <li class="nav-item">
                <router-link class="nav-link" to="/catalog">Каталог</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/authors">Авторы</router-link>
              </li>
              <li v-if="isAuthenticated" class="nav-item">
                <router-link class="nav-link" to="/my-books">Мои книги</router-link>
              </li>
              <li v-if="isAuthenticated" class="nav-item">
                <router-link class="nav-link" to="/transactions">Сделки</router-link>
              </li>
            </template>
          </ul>

          <div class="navbar-actions">
            <template v-if="isAuthenticated">
              <router-link class="profile-chip" to="/profile">
                <span>{{ initials }}</span>
                <b>{{ userName }}</b>
              </router-link>
              <button class="btn btn-ghost" type="button" @click="logout">
                Выйти
              </button>
            </template>
            <template v-else>
              <router-link class="btn btn-ghost" to="/login">Войти</router-link>
              <router-link class="btn btn-primary-soft" to="/register">
                Регистрация
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <main class="app-main">
      <RouterView />
    </main>

    <footer class="library-footer">
      <div class="container-xxl">
        <span>{{ isAdmin ? 'Пульт библиотеки' : 'Теплая полка' }}</span>
        <span>Дипломный проект, {{ currentYear }}</span>
      </div>
    </footer>

    <div
      v-if="feedback.isOpen"
      class="feedback-backdrop"
      role="dialog"
      aria-modal="true"
      @click.self="feedback.close"
    >
      <section class="feedback-modal" :class="`feedback-${feedback.type}`">
        <button
          class="feedback-close"
          type="button"
          aria-label="Закрыть"
          @click="feedback.close"
        >
          ×
        </button>
        <span class="feedback-mark" aria-hidden="true">
          {{ feedback.type === 'success' ? '✓' : feedback.type === 'error' ? '!' : 'i' }}
        </span>
        <h2>{{ feedback.title }}</h2>
        <p>{{ feedback.message }}</p>
        <button class="btn btn-primary-soft" type="button" @click="feedback.close">
          Понятно
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';

const userStore = useUserStore();
const feedback = useFeedbackStore();
const router = useRouter();

const currentYear = new Date().getFullYear();
const isAuthenticated = computed(() => userStore.isAuthenticated);
const isAdmin = computed(() => userStore.isAdmin);
const homeRoute = computed(() => (isAdmin.value ? '/admin' : '/catalog'));
const userName = computed(() => {
  const user = userStore.user;
  return user ? `${user.name} ${user.surname}`.trim() : 'Профиль';
});
const initials = computed(() => {
  const user = userStore.user;
  if (!user) return 'ТП';
  return `${user.name?.[0] ?? ''}${user.surname?.[0] ?? ''}`.toUpperCase();
});

onMounted(async () => {
  if (localStorage.getItem('token') && !userStore.user) {
    try {
      await userStore.loadMe();
    } catch {
      userStore.clear();
    }
  }
});

const logout = async () => {
  userStore.clear();
  await router.push('/catalog');
};
</script>
