// router/index.ts
import { useUserStore } from '@/stores/userStore';
import { createRouter, createWebHistory } from 'vue-router';

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
const AlertFormPage = () => import('@/views/alerts/AlertFormPage.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Публичные
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/reset-password', component: ResetPasswordView },

    // Авторизованные
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
      component: AlertFormPage,
      meta: { requiresAuth: true, canCreateAlerts: true }, // админ или староста
    },
    {
      path: '/alerts/:id',
      name: 'alert-detail',
      component: AlertDetailPage,
      meta: { requiresAuth: true },
    },
    {
      path: '/alerts/:id/edit',
      name: 'alert-edit',
      component: AlertFormPage,
      meta: { requiresAuth: true, canCreateAlerts: true }, // админ или староста
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

    // Админские
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

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

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
  if (to.meta.admin && !userStore.isAdmin) {
    return next('/');
  }

  // Проверка на возможность создавать уведомления (админ или староста)
  if (to.meta.canCreateAlerts && !userStore.isAdmin && !userStore.isElder) {
    return next('/');
  }

  next();
});

export default router;
