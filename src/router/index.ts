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
    { path: '/menu', component: MenuView },
    { path: '/cart', component: CartView },

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
      meta: { requiresAuth: true, admin: true },
    },

    // Client (user)
    {
      path: '/orders',
      component: OrdersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/:id',
      component: OrderDetailView,
      meta: { requiresAuth: true },
    },

    // Admin
    {
      path: '/admin',
      component: AdminDashboardView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/coffee',
      component: AdminCoffeeView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/coffee/volumes',
      component: AdminCoffeeVolumeView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/coffee/additives',
      component: AdminCoffeeAdditiveView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/coffee/relations',
      component: AdminCoffeeRelationsView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/products',
      component: AdminProductsView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/products/categories',
      component: AdminProductCategoriesView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/orders',
      component: AdminOrdersView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/orders/:id',
      component: AdminOrderDetailView,
      meta: { requiresAuth: true, admin: true },
    },
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

  if (to.meta.admin && userStore.user?.roleType?.name !== 'admin') {
    return next('/menu');
  }

  next();
});

export default router;
