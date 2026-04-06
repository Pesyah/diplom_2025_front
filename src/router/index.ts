import { useUserStore } from '@/stores/userStore';
import { createRouter, createWebHistory } from 'vue-router';

const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const ProfileView = () => import('@/views/auth/ProfileView.vue');
const AdminCreateView = () => import('@/views/auth/AdminCreateView.vue');
const MenuView = () => import('@/views/MenuView.vue');
const CartView = () => import('@/views/CartView.vue');
const OrdersView = () => import('@/views/OrdersView.vue');

// Админка
const DashboardView = () => import('@/views/admin/DashboardView.vue');
const PizzaListView = () => import('@/views/admin/PizzaListView.vue');
const PizzaFormView = () => import('@/views/admin/PizzaFormView.vue');
const SizeListView = () => import('@/views/admin/SizeListView.vue');
const SizeFormView = () => import('@/views/admin/SizeFormView.vue');
const AdditiveListView = () => import('@/views/admin/AdditiveListView.vue');
const AdditiveFormView = () => import('@/views/admin/AdditiveFormView.vue');
const RelationSizeView = () => import('@/views/admin/RelationSizeView.vue');
const RelationAdditiveView = () =>
  import('@/views/admin/RelationAdditiveView.vue');
const AdminOrdersView = () => import('@/views/admin/AdminOrdersView.vue');
const OrderDetailView = () => import('@/views/OrderDetailView.vue');
const PizzaDetailView = () => import('@/views/PizzaDetailView.vue');
const AdminOrderDetailView = () =>
  import('@/views/admin/AdminOrderDetailView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/cart', component: CartView, meta: { requiresAuth: true } },
    { path: '/orders', component: OrdersView, meta: { requiresAuth: true } },
    {
      path: '/orders/:id',
      component: OrderDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: '/pizza/:id',
      component: PizzaDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      component: () => import('@/views/RouterView.vue'),
      meta: { requiresAuth: true },
    },

    // Админка
    {
      path: '/admin/create',
      component: AdminCreateView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin',
      component: DashboardView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/pizzas',
      component: PizzaListView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/pizzas/create',
      component: PizzaFormView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/pizzas/:id/edit',
      component: PizzaFormView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/sizes',
      component: SizeListView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/sizes/create',
      component: SizeFormView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/additives',
      component: AdditiveListView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/additives/create',
      component: AdditiveFormView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/relations/size',
      component: RelationSizeView,
      meta: { requiresAuth: true, admin: true },
    },
    {
      path: '/admin/relations/additive',
      component: RelationAdditiveView,
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
