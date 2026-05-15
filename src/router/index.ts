import { useUserStore } from '@/stores/userStore';
import { createRouter, createWebHistory } from 'vue-router';

const CatalogView = () => import('@/views/library/CatalogView.vue');
const BookDetailView = () => import('@/views/library/BookDetailView.vue');
const AuthorsView = () => import('@/views/library/AuthorsView.vue');
const AuthorDetailView = () => import('@/views/library/AuthorDetailView.vue');
const MyBooksView = () => import('@/views/library/MyBooksView.vue');
const TransactionsView = () => import('@/views/library/TransactionsView.vue');
const AdminDashboardView = () => import('@/views/admin/AdminDashboardView.vue');
const AdminUsersView = () => import('@/views/admin/AdminUsersView.vue');
const AdminAuthorsView = () => import('@/views/admin/AdminAuthorsView.vue');
const AdminDealsView = () => import('@/views/admin/AdminDealsView.vue');
const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const ProfileView = () => import('@/views/auth/ProfileView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/catalog' },
    { path: '/catalog', name: 'catalog', component: CatalogView },
    { path: '/books/:id', name: 'book-detail', component: BookDetailView },
    { path: '/authors', name: 'authors', component: AuthorsView },
    {
      path: '/authors/:id',
      name: 'author-detail',
      component: AuthorDetailView,
    },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-books',
      name: 'my-books',
      component: MyBooksView,
      meta: { requiresAuth: true },
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboardView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsersView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/admin/authors',
      name: 'admin-authors',
      component: AdminAuthorsView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/admin/deals',
      name: 'admin-deals',
      component: AdminDealsView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    { path: '/rooms', redirect: '/catalog' },
    { path: '/rooms/:id', redirect: (to) => `/books/${to.params.id}` },
    { path: '/my-reservations', redirect: '/transactions' },
    { path: '/admin/:pathMatch(.*)*', redirect: '/admin' },
    { path: '/:pathMatch(.*)*', redirect: '/catalog' },
  ],
});

router.beforeEach(async (to) => {
  const userStore = useUserStore();
  const token = localStorage.getItem('token');

  if (token && !userStore.user && !userStore.isBootstrapped) {
    try {
      await userStore.loadMe();
    } catch {
      userStore.clear();
    }
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return '/login';
  }

  if (to.meta.adminOnly && !userStore.isAdmin) {
    return '/catalog';
  }

  const userWorkspaceRoutes = [
    'catalog',
    'book-detail',
    'authors',
    'author-detail',
    'my-books',
    'transactions',
  ];

  if (userStore.isAdmin && userWorkspaceRoutes.includes(String(to.name))) {
    return '/admin';
  }

  if ((to.name === 'login' || to.name === 'register') && userStore.isAuthenticated) {
    return userStore.isAdmin ? '/admin' : '/catalog';
  }

  return true;
});

export default router;
