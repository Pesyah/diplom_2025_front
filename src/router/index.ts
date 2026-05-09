// src/router/index.ts
import { useUserStore } from '@/stores/userStore';
import { createRouter, createWebHistory } from 'vue-router';

// Auth views
const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const ProfileView = () => import('@/views/auth/ProfileView.vue');
const CreateAdminView = () => import('@/views/auth/CreateAdminView.vue');

// Client views
const MenuView = () => import('@/views/client/MenuView.vue');
const CartView = () => import('@/views/client/CartView.vue');
const OrdersView = () => import('@/views/client/OrdersView.vue');
const OrderDetailView = () => import('@/views/client/OrderDetailView.vue');

// Admin views
const AdminDashboardView = () => import('@/views/admin/AdminDashboardView.vue');
const AdminCoffeeView = () => import('@/views/admin/AdminCoffeeView.vue');
const AdminCoffeeVolumeView = () =>
  import('@/views/admin/AdminCoffeeVolumeView.vue');
const AdminCoffeeAdditiveView = () =>
  import('@/views/admin/AdminCoffeeAdditiveView.vue');
const AdminCoffeeRelationsView = () =>
  import('@/views/admin/AdminCoffeeRelationsView.vue');
const AdminProductsView = () => import('@/views/admin/AdminProductsView.vue');
const AdminProductCategoriesView = () =>
  import('@/views/admin/AdminProductCategoriesView.vue');
const AdminOrdersView = () => import('@/views/admin/AdminOrdersView.vue');
const AdminOrderDetailView = () =>
  import('@/views/admin/AdminOrderDetailView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public
    { path: '/', redirect: '/menu' },
    { path: '/menu', component: MenuView, meta: { clientOnly: true } },
    { path: '/cart', component: CartView, meta: { clientOnly: true } },

    // Auth routes
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    {
      path: '/profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/create-admin',
      component: CreateAdminView,
      meta: { requiresAuth: true, adminOnly: true },
    },

    // Client (user)
    {
      path: '/orders',
      component: OrdersView,
      meta: { requiresAuth: true, clientOnly: true },
    },
    {
      path: '/orders/:id',
      component: OrderDetailView,
      meta: { requiresAuth: true, clientOnly: true },
    },

    // Admin & Moderator
    {
      path: '/admin',
      component: AdminDashboardView,
      meta: { requiresAuth: true, staff: true },
    },
    {
      path: '/admin/coffee',
      component: AdminCoffeeView,
      meta: { requiresAuth: true, staff: true },
    },
    {
      path: '/admin/coffee/volumes',
      component: AdminCoffeeVolumeView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/admin/coffee/additives',
      component: AdminCoffeeAdditiveView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/admin/coffee/relations',
      component: AdminCoffeeRelationsView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/admin/products',
      component: AdminProductsView,
      meta: { requiresAuth: true, staff: true },
    },
    {
      path: '/admin/products/categories',
      component: AdminProductCategoriesView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/admin/orders',
      component: AdminOrdersView,
      meta: { requiresAuth: true, staff: true },
    },
    {
      path: '/admin/orders/:id',
      component: AdminOrderDetailView,
      meta: { requiresAuth: true, staff: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const userStore = useUserStore();

  // Проверка авторизации
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  // Загрузка пользователя если есть токен но нет данных
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

  const role = userStore.user?.roleType?.name;
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';
  const isStaff = isAdmin || isModerator;

  // Админ/модератор пытается зайти на клиентские страницы — редирект в админку
  if (isStaff && to.meta.clientOnly) {
    return next('/admin');
  }

  // Не staff пытается зайти в staff-зону — редирект в меню
  if (to.meta.staff && !isStaff) {
    return next('/menu');
  }

  // Не админ пытается зайти в adminOnly — редирект в админ-дашборд
  if (to.meta.adminOnly && !isAdmin) {
    return next('/admin');
  }

  // Админ/модератор заходит на корень или клиентские — редирект в админку
  if (
    isStaff &&
    (to.path === '/' || to.path === '/menu' || to.path === '/cart')
  ) {
    return next('/admin');
  }

  next();
});

export default router;
