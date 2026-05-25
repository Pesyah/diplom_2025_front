// src/router/index.ts
import { useUserStore } from '@/stores/userStore';
import { createRouter, createWebHistory } from 'vue-router';

// Auth views
const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const ProfileView = () => import('@/views/auth/ProfileView.vue');
const CreateAdminView = () => import('@/views/auth/CreateAdminView.vue');

// Admin views
const AdminDashboardView = () => import('@/views/admin/AdminDashboardView.vue');
const AdminProductsView = () => import('@/views/admin/AdminProductsView.vue');
const AdminProductFormView = () =>
  import('@/views/admin/AdminProductFormView.vue');
const AdminOrdersView = () => import('@/views/admin/AdminOrdersView.vue');
const AdminOrderDetailView = () =>
  import('@/views/admin/AdminOrderDetailView.vue');
const AdminBrandsView = () => import('@/views/admin/AdminBrandsView.vue');
const AdminBrandFormView = () => import('@/views/admin/AdminBrandFormView.vue');
const AdminBrandDetailView = () =>
  import('@/views/admin/AdminBrandDetailView.vue');
const AdminCategoriesView = () =>
  import('@/views/admin/AdminCategoriesView.vue');
const AdminCategoryFormView = () =>
  import('@/views/admin/AdminCategoryFormView.vue');

// Client views
const HomeView = () => import('@/views/client/HomeView.vue');
const CatalogView = () => import('@/views/client/CatalogView.vue');
const ProductDetailView = () => import('@/views/client/ProductDetailView.vue');
const CartView = () => import('@/views/client/CartView.vue');
const OrdersView = () => import('@/views/client/OrdersView.vue');
const OrderDetailView = () => import('@/views/client/OrderDetailView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth routes
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
    {
      path: '/admin/create-admin',
      component: CreateAdminView,
      meta: { requiresAuth: true, admin: true },
    },

    // Admin routes
    {
      path: '/admin/dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/products',
      component: AdminProductsView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/products/create',
      component: AdminProductFormView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/products/:id/edit',
      component: AdminProductFormView,
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
    {
      path: '/admin/brands',
      component: AdminBrandsView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/brands/create',
      component: AdminBrandFormView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/brands/:id/edit',
      component: AdminBrandFormView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/brands/:id',
      component: AdminBrandDetailView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/categories',
      component: AdminCategoriesView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/categories/create',
      component: AdminCategoryFormView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/categories/:id/edit',
      component: AdminCategoryFormView,
      meta: { requiresAuth: true, admin: true },
    },

    // Client routes
    { path: '/', component: HomeView, meta: { clientOnly: true } },
    { path: '/catalog', component: CatalogView, meta: { clientOnly: true } },
    {
      path: '/product/:id',
      component: ProductDetailView,
      meta: { clientOnly: true },
    },
    {
      path: '/cart',
      component: CartView,
      meta: { requiresAuth: true, clientOnly: true },
    },
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
    return next('/');
  }

  if (to.meta.clientOnly && userStore.user?.roleType?.name === 'admin') {
    return next('/admin/dashboard');
  }

  next();
});

export default router;
