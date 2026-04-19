import { useUserStore } from '@/stores/userStore';
import { createRouter, createWebHistory } from 'vue-router';

// Ленивая загрузка страниц
const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const ProfileView = () => import('@/views/auth/ProfileView.vue');
const ResetPasswordView = () => import('@/views/auth/ResetPasswordView.vue');
const ChangePasswordView = () => import('@/views/auth/ChangePasswordView.vue');

const HomePage = () => import('@/views/HomePage.vue');
const AlertListPage = () => import('@/views/alerts/AlertListPage.vue');
const AlertDetailPage = () => import('@/views/alerts/AlertDetailPage.vue');
const GlobalAlertListPage = () =>
  import('@/views/alerts/GlobalAlertListPage.vue');
const GlobalAlertCreatePage = () =>
  import('@/views/alerts/GlobalAlertCreatePage.vue');
const GlobalAlertDetailPage = () =>
  import('@/views/alerts/GlobalAlertDetailPage.vue');
const StructurePage = () => import('@/views/structure/StructurePage.vue');
const UserListPage = () => import('@/views/users/UserListPage.vue');
const AlertCreatePage = () => import('@/views/alerts/AlertFormPage.vue'); // или AlertFormPage
const AlertEditPage = () => import('@/views/alerts/AlertFormPage.vue'); // тот же компонент

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Публичные
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/reset-password', component: ResetPasswordView },

    // Требуют авторизации
    { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
    {
      path: '/change-password',
      component: ChangePasswordView,
      meta: { requiresAuth: true },
    },

    // Главная
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: { requiresAuth: true },
    },

    // Уведомления (обычные)
    {
      path: '/alerts',
      name: 'alerts',
      component: AlertListPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/alerts/create',
      name: 'alert-create',
      component: AlertCreatePage,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/alerts/:id',
      name: 'alert-detail',
      component: AlertDetailPage,
      meta: { requiresAuth: true },
    },

    {
      path: '/alerts/create',
      name: 'alert-create',
      component: AlertCreatePage,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/alerts/:id/edit',
      name: 'alert-edit',
      component: AlertEditPage,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/alerts/:id',
      name: 'alert-detail',
      component: AlertDetailPage,
      meta: { requiresAuth: true },
    },

    // Глобальные уведомления
    {
      path: '/global-alerts',
      name: 'global-alerts',
      component: GlobalAlertListPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/global-alerts/create',
      name: 'global-alert-create',
      component: GlobalAlertCreatePage,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/global-alerts/:id',
      name: 'global-alert-detail',
      component: GlobalAlertDetailPage,
      meta: { requiresAuth: true },
    },

    // Структура и пользователи (админ)
    {
      path: '/structure',
      name: 'structure',
      component: StructurePage,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/users',
      name: 'users',
      component: UserListPage,
      meta: { requiresAuth: true, admin: true },
    },

    // Редирект с несуществующих
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const userStore = useUserStore();

  // Если нет токена и нужна авторизация
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  // Если есть токен, но нет user в store - загружаем
  if (token && !userStore.user) {
    try {
      const client = (await import('@/api/client')).default;
      const res = await client.get('/auth/me');
      userStore.setUser(res.data);
    } catch (err) {
      userStore.clear();
      return next('/login');
    }
  }

  // Проверка на админа
  if (to.meta.admin && userStore.user?.roleType?.name !== 'admin') {
    return next('/');
  }

  next();
});

export default router;
